/**
 * ChordPro, read once, for every chordlist project that needs it.
 *
 * This file is canonical here, in chordlist-backend, and vendored byte for byte into
 * chordlist-website (`lib/vendor/chordpro.ts`, by `pnpm sync:chordpro`). It therefore imports
 * nothing and touches no runtime API: it has to compile under Deno and under Next.js alike. Edit
 * it here, run the backend's tests, then sync the website; a website test fails while the two
 * copies differ.
 *
 * What it does:
 *
 * - `readChordPro` turns a file into blocks — stanzas, comments, tablature — with every chord
 *   attached to the column it falls on, the section each block belongs to, and the song's
 *   metadata. It is written against the files ozbcoz.com publishes, which is where most real-world
 *   ChordPro comes from, and follows that site's reading of the directives where it differs from
 *   the specification: `{soi}`, `{sob}` and `{soh}` are italic, bold and highlight there, not an
 *   intro, a bridge and a header.
 * - `mergeProgressions` reduces those blocks to one section per distinct progression — what the
 *   backend stores. It reads chords and section structure only.
 * - `renderChordlistMarkdown` writes a chordlist song file: YAML frontmatter, `[Section]`
 *   headings, and chord lines over the words — what the website's converter shows.
 *
 * Which tokens count as chords is the caller's to say, because the two consumers answer it
 * differently: the backend accepts what its arrangement validator accepts, and the website only
 * what the app's chord-line reader will treat as a chord. `isChordlistChord` is the latter and the
 * default.
 *
 * Lyric text is held in memory for as long as a document lives — the renderer needs it, and a
 * stanza's words are what mark a chorus nobody labelled. The backend's adapter keeps nothing but
 * the merged sections, so lyrics never reach its output or its database.
 */

export type ChordPredicate = (token: string) => boolean;

export interface ChordPlacement {
    /** Characters of the line's text before the chord. */
    offset: number;
    chord: string;
}

export type ChordProLine =
    /** Words, with the chords that fall inside them. */
    | { type: "lyric"; text: string; chords: ChordPlacement[] }
    /** Chords with nothing sung under them: `[G] / / / [D] / / /`, or a grid row. */
    | { type: "chords"; text: string; chords: ChordPlacement[] }
    | { type: "comment"; text: string }
    | { type: "tab"; text: string }
    /** A break inside a `{soc}` … `{eoc}` block, which does not end the section. */
    | { type: "blank" };

export interface ChordProBlock {
    /** The section the file names for this block, by label, comment, environment, or by its words recurring. */
    label: string | null;
    /** The section the block is read as: its label, or one inferred. Null when it has no chords. */
    section: string | null;
    lines: ChordProLine[];
    /** Every chord in the block, in order, as written. */
    chords: string[];
    lyric: boolean;
}

export interface ChordProMetadata {
    title: string | null;
    subtitle: string | null;
    artist: string | null;
    key: string | null;
    capo: string | null;
    tempo: string | null;
}

export interface ChordProDocument {
    metadata: ChordProMetadata;
    blocks: ChordProBlock[];
    /** Bracketed tokens that were not chords, such as `[Stop]` or `[Kazoo]`. */
    skippedAnnotations: number;
}

export interface ChordProSection {
    name: string;
    /** One cycle of the progression. */
    chords: string[];
    /** How many times that cycle is played back to back where the section first appears. */
    repeats: number;
    /** How many blocks of the source collapsed into this section. */
    occurrences: number;
}

export interface ChordProReadOptions {
    isChord?: ChordPredicate;
}

/** The most times a folded loop may repeat; matches the backend's arrangement limit. */
export const maximumFoldedRepeats = 32;

// MARK: - Chord tokens

const chordSuffixWords = ["maj", "Maj", "MAJ", "min", "Min", "aug", "dim", "sus", "add"];
const chordSuffixCharacters = new Set("0123456789mM°ø+-#b(),");

/**
 * Whether the app reads a token as a chord. A port of `ChordTransposer.isChordToken` in
 * chordlist-app: a chord line only counts as chords when every word on it passes this, so
 * anything the converter writes onto a chord line has to.
 */
export function isChordlistChord(token: string): boolean {
    const root = leadingNote(token);
    if (root === 0) {
        return false;
    }
    let rest = token.slice(root);
    const slash = rest.lastIndexOf("/");
    if (slash !== -1) {
        const bass = rest.slice(slash + 1);
        if (bass.length === 0 || leadingNote(bass) !== bass.length) {
            return false;
        }
        rest = rest.slice(0, slash);
    }
    while (rest.length > 0) {
        const word = chordSuffixWords.find((candidate) => rest.startsWith(candidate));
        if (word !== undefined) {
            rest = rest.slice(word.length);
            continue;
        }
        if (!chordSuffixCharacters.has(rest[0] ?? "")) {
            return false;
        }
        rest = rest.slice(1);
    }
    return true;
}

function leadingNote(text: string): number {
    const first = text[0];
    if (first === undefined || first < "A" || first > "G") {
        return 0;
    }
    return text[1] === "#" || text[1] === "b" ? 2 : 1;
}

/**
 * The chord inside a bracket, with the debris transcribers leave beside it removed: a bar line
 * (`[G   |]`), a strum mark (`[G*]`, `[Gmaj7 ~]`), or one of the many spellings of "no chord".
 * Null when what is left is not a chord.
 */
export function normalizeChordToken(
    raw: string,
    isChord: ChordPredicate = isChordlistChord,
): string | null {
    const token = raw.replace(/[|~*_]+/gu, " ").replace(/\s+/gu, " ").trim();
    if (token.length === 0 || token === "%") {
        return null;
    }
    if (/^n\s*[./]?\s*c\.?$/iu.test(token)) {
        return isChord("N.C.") ? "N.C." : null;
    }
    return isChord(token) ? token : null;
}

// MARK: - Section labels

/**
 * The labels a source can give a stanza, mapped to one name each — all of them names the app
 * recognizes as section headings. Numbers in the source ("Verse 2") are dropped: once identical
 * stanzas merge, the source's numbering no longer describes anything.
 */
const sectionKinds: ReadonlyArray<readonly [RegExp, string]> = [
    [/^pre[\s-]?chorus$/iu, "Pre-Chorus"],
    [/^(?:chorus|refrain|koris)$/iu, "Chorus"],
    [/^(?:verse|verses)$/iu, "Verse"],
    [/^(?:bridge|middle\s*(?:8|eight))$/iu, "Bridge"],
    [/^intro$/iu, "Intro"],
    [/^(?:outro|ending|end|coda|tag)$/iu, "Outro"],
    [/^(?:instrumental|break|link|riff)$/iu, "Instrumental"],
    [/^solo$/iu, "Solo"],
    [/^interlude$/iu, "Interlude"],
];

const labelWords =
    "pre[\\s-]?chorus|chorus|refrain|koris|verses|verse|bridge|middle\\s*(?:8|eight)|intro|outro|" +
    "ending|coda|instrumental|break|link|solo|interlude|riff|tag";

/** A whole line, or the start of one, that names a section: `Chorus`, `Verse 2:`, `(Intro)`. */
const labelLinePattern = new RegExp(`^[\\s(*]*(${labelWords})(?:\\s*\\d+)?\\s*[):.-]*\\s*`, "iu");

/** "Chorus x2" or "Repeat chorus" says to play an earlier section again; it starts nothing new. */
const repeatInstructionPattern = /\b(?:x\s*\d+|\d+\s*x|twice|again|repeat)\b/iu;

/** The stored name for a label, null when the text names no section. */
export function kindFromLabel(value: string): string | null {
    const word = value.replace(/[\s:.()*-]+$/u, "").replace(/^[\s(*]+/u, "").trim();
    // "Middle 8" is a name; the 2 in "Verse 2" is a number.
    for (const candidate of [word, word.replace(/\s*\d+$/u, "")]) {
        for (const [pattern, kind] of sectionKinds) {
            if (pattern.test(candidate)) {
                return kind;
            }
        }
    }
    return null;
}

/** Like `kindFromLabel`, but `undefined` when the text is not purely a label, null for a cue. */
function labelKind(value: string): string | null | undefined {
    const match = labelLinePattern.exec(value);
    if (!match || hasWords(value.slice(match[0].length))) {
        return undefined;
    }
    if (repeatInstructionPattern.test(value)) {
        return null;
    }
    return kindFromLabel(match[1] ?? "");
}

// MARK: - Directives

const directivePattern = /\{\s*([a-z_]+)\s*(?::([^}]*))?\}/giu;
const bracketPattern = /\[([^\]]*)\]/gu;

/** Character formatting on ozbcoz.com. Stripped, never read as structure. */
const formattingDirectives = new Set([
    "soi",
    "eoi",
    "sob",
    "eob",
    "soh",
    "eoh",
    "tc",
    "tb",
    "ts",
    "textcolour",
    "textcolor",
    "textsize",
    "textfont",
    "chordcolour",
    "chordcolor",
    "chordsize",
    "chordfont",
]);
const commentDirectives = new Set([
    "c",
    "comment",
    "ci",
    "comment_italic",
    "cb",
    "comment_box",
    "highlight",
]);
const breakDirectives = new Set([
    "np",
    "new_page",
    "npp",
    "new_physical_page",
    "colb",
    "column_break",
]);

type Environment = "chorus" | "verse" | "bridge" | "grid" | "tab";

const environmentStarts: Readonly<Record<string, Environment>> = {
    soc: "chorus",
    start_of_chorus: "chorus",
    sov: "verse",
    start_of_verse: "verse",
    start_of_bridge: "bridge",
    sog: "grid",
    start_of_grid: "grid",
    sot: "tab",
    start_of_tab: "tab",
};
const environmentEnds = new Set([
    "eoc",
    "end_of_chorus",
    "eov",
    "end_of_verse",
    "end_of_bridge",
    "eog",
    "end_of_grid",
    "eot",
    "end_of_tab",
]);
const environmentKinds: Readonly<Record<Environment, string | null>> = {
    chorus: "Chorus",
    verse: "Verse",
    bridge: "Bridge",
    grid: null,
    tab: null,
};

// MARK: - Reading

interface WorkingBlock extends ChordProBlock {
    /** The block's words folded to letters, compared to find a chorus and then dropped. */
    words: string;
    /** Set for `{chorus}`, a heading that stands for a section rather than writing it out. */
    cue?: boolean;
}

export function readChordPro(text: string, options: ChordProReadOptions = {}): ChordProDocument {
    const isChord = options.isChord ?? isChordlistChord;
    const metadata: ChordProMetadata = {
        title: null,
        subtitle: null,
        artist: null,
        key: null,
        capo: null,
        tempo: null,
    };
    const blocks: WorkingBlock[] = [];
    let skippedAnnotations = 0;
    let environment: Environment | null = null;

    // Inside `{soc}` … `{eoc}` every stanza is the chorus, however many breaks it contains.
    const fresh = (): WorkingBlock => ({
        label: environment === null ? null : environmentKinds[environment],
        section: null,
        lines: [],
        chords: [],
        lyric: false,
        words: "",
    });
    let current = fresh();

    const flush = () => {
        const hasContent = current.lines.some((line) => line.type !== "blank");
        if (hasContent || (current.label !== null && current.lines.length === 0 && current.cue)) {
            while (current.lines[current.lines.length - 1]?.type === "blank") {
                current.lines.pop();
            }
            blocks.push(current);
        }
        current = fresh();
    };
    // A label names the block that follows it. A break before anything arrives clears it again:
    // "Chorus" alone above a blank line is a cue to play the chorus, not the start of one.
    const startLabelled = (kind: string) => {
        flush();
        current.label = kind;
    };
    const addLine = (line: ChordProLine) => {
        current.lines.push(line);
        if (line.type === "lyric" || line.type === "chords") {
            current.chords.push(...line.chords.map((placement) => placement.chord));
        }
        if (line.type === "lyric") {
            current.lyric = true;
            current.words += foldWords(line.text);
        }
    };
    const standalone = (line: ChordProLine) => {
        flush();
        addLine(line);
        flush();
    };

    for (const rawLine of text.replace(/^﻿/u, "").split(/\r\n|\r|\n/u)) {
        if (environment === "tab") {
            const end = /^\s*\{\s*(?:eot|end_of_tab)\s*\}\s*$/iu.test(rawLine);
            if (end) {
                environment = null;
                flush();
            } else if (rawLine.trim().length > 0) {
                addLine({ type: "tab", text: rawLine.replace(/\s+$/u, "") });
            }
            continue;
        }

        let rest = "";
        let lastIndex = 0;
        let sawDirective = false;
        let highlighted = "";

        directivePattern.lastIndex = 0;
        let directive = directivePattern.exec(rawLine);
        while (directive !== null) {
            rest += rawLine.slice(lastIndex, directive.index);
            lastIndex = directive.index + directive[0].length;
            sawDirective = true;

            const name = (directive[1] ?? "").toLowerCase();
            const value = (directive[2] ?? "").trim();
            const started = environmentStarts[name];

            if (formattingDirectives.has(name)) {
                // Formatting is transparent: whatever it wraps is read as part of the line.
                if (name === "soh") {
                    highlighted = rawLine.slice(lastIndex).split(/\{\s*eoh\s*\}/iu)[0] ?? "";
                }
            } else if (started !== undefined) {
                flush();
                environment = started;
                current = fresh();
                const labelled = value ? kindFromLabel(value) : null;
                if (labelled) {
                    current.label = labelled;
                }
            } else if (environmentEnds.has(name)) {
                environment = null;
                flush();
            } else if (name === "chorus") {
                // `{chorus}` plays the chorus again: a heading with nothing under it.
                flush();
                current.label = "Chorus";
                current.cue = true;
                flush();
            } else if (commentDirectives.has(name)) {
                const kind = value ? labelKind(value) : undefined;
                if (kind !== undefined && kind !== null) {
                    startLabelled(kind);
                } else if (value) {
                    standalone({ type: "comment", text: value });
                } else {
                    // An empty `{c: }` is how ozbcoz.com separates stanzas.
                    flush();
                }
            } else if (breakDirectives.has(name)) {
                flush();
            } else {
                readMetadata(metadata, name, value);
            }
            directive = directivePattern.exec(rawLine);
        }
        rest += rawLine.slice(lastIndex);

        if (environment === "tab") {
            continue;
        }
        if (environment === "grid") {
            const chords = gridChords(rest, isChord);
            if (chords.length > 0) {
                addLine({ type: "chords", text: "", chords });
            }
            continue;
        }

        if (rest.trim().length === 0) {
            if (!sawDirective) {
                if (environment === null) {
                    flush();
                } else if (current.lines.length > 0) {
                    current.lines.push({ type: "blank" });
                }
            }
            continue;
        }

        // `{soh}Chorus{eoh}` and a bare `Chorus:` line are the same statement.
        const highlightedKind = highlighted ? labelKind(highlighted) : undefined;
        if (highlightedKind) {
            startLabelled(highlightedKind);
        }

        const line = readLine(rest, isChord);
        skippedAnnotations += line.skippedAnnotations;
        if (line.label !== undefined) {
            if (line.label === null) {
                // "Chorus x2": play something already written out. Nothing new starts here.
                standalone({ type: "comment", text: rest.trim() });
                continue;
            }
            startLabelled(line.label);
        }
        if (line.content !== null) {
            addLine(line.content);
        }
    }
    flush();

    nameSections(blocks);
    return {
        metadata,
        blocks: blocks.map((block) => ({
            label: block.label,
            section: block.section,
            lines: block.lines,
            chords: block.chords,
            lyric: block.lyric,
        })),
        skippedAnnotations,
    };
}

function readMetadata(metadata: ChordProMetadata, name: string, value: string): void {
    if (!value) {
        return;
    }
    switch (name) {
        case "title":
        case "t":
            metadata.title ??= value;
            break;
        case "subtitle":
        case "st":
        case "su":
            metadata.subtitle ??= value;
            break;
        case "artist":
            metadata.artist ??= value;
            break;
        case "key":
        case "k":
            metadata.key ??= value;
            break;
        case "capo":
            metadata.capo ??= value;
            break;
        case "tempo":
            metadata.tempo ??= value;
            break;
    }
}

interface ReadLine {
    /** A section the line names; null when it only says to repeat one; undefined when it names none. */
    label: string | null | undefined;
    content: ChordProLine | null;
    skippedAnnotations: number;
}

function readLine(text: string, isChord: ChordPredicate): ReadLine {
    let label: string | null | undefined;
    let body = text;

    const bare = stripBrackets(text);
    const leading = labelLinePattern.exec(bare);
    if (leading) {
        // Only a label when nothing but chords and punctuation follows it, so a lyric that happens
        // to start with "Bridge over ..." is still a lyric.
        const afterLabel = bare.slice(leading[0].length);
        if (!hasWords(afterLabel.replace(repeatInstructionPattern, ""))) {
            const kind = kindFromLabel(leading[1] ?? "");
            label = repeatInstructionPattern.test(afterLabel) && !/\[/u.test(text) ? null : kind;
            body = text.replace(/^[^[]*/u, "");
        }
    }

    let lyric = "";
    const chords: ChordPlacement[] = [];
    let skippedAnnotations = 0;
    let lastIndex = 0;
    bracketPattern.lastIndex = 0;
    let token = bracketPattern.exec(body);
    while (token !== null) {
        lyric += body.slice(lastIndex, token.index);
        lastIndex = token.index + token[0].length;
        const raw = token[1] ?? "";
        const chord = normalizeChordToken(raw, isChord);
        if (chord !== null) {
            chords.push({ offset: lyric.length, chord });
            // `Now [D] I've` puts the chord between two spaces rather than on the word. Taking the
            // second space puts it on "I've" and leaves the words singly spaced.
            if (/(?:^|\s)$/u.test(lyric) && body[lastIndex] === " ") {
                lastIndex += 1;
            }
        } else {
            const kind = labelKind(raw);
            if (kind && chords.length === 0 && label === undefined && !hasWords(lyric)) {
                label = kind;
            } else if (raw.trim().length > 0) {
                // Kept as words in parentheses, where chordlist leaves anything that is not a
                // chord; square brackets on their own line would read as a section heading.
                lyric += `(${raw.trim()})`;
                skippedAnnotations += 1;
            }
        }
        token = bracketPattern.exec(body);
    }
    lyric += body.slice(lastIndex);
    const textLine = lyric.replace(/\s+$/u, "");

    let content: ChordProLine | null = null;
    if (hasWords(textLine)) {
        content = { type: "lyric", text: textLine, chords };
    } else if (chords.length > 0) {
        content = { type: "chords", text: textLine, chords };
    } else if (textLine.trim().length > 0) {
        content = { type: "comment", text: textLine.trim() };
    }
    return { label, content, skippedAnnotations };
}

/** Reads `| G . . . | C . / . |`: every cell that is a chord, in its column. */
function gridChords(text: string, isChord: ChordPredicate): ChordPlacement[] {
    const chords: ChordPlacement[] = [];
    const cell = /[^\s|:]+/gu;
    let match = cell.exec(text);
    while (match !== null) {
        const chord = normalizeChordToken(match[0], isChord);
        if (chord !== null) {
            chords.push({ offset: match.index, chord });
        }
        match = cell.exec(text);
    }
    return chords;
}

function stripBrackets(value: string): string {
    return value.replace(bracketPattern, " ");
}

function foldWords(value: string): string {
    return value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
}

/** Whether text has anything a person would sing or read, rather than strums and bar counts. */
function hasWords(value: string): boolean {
    return /\p{L}{2,}/u.test(value.replace(/\([^)]*\)/gu, " "));
}

// MARK: - Naming sections

/** Shorter than this, repeated words are a refrain line or a "la la la", not a whole chorus. */
const minimumChorusLetters = 24;

/** Sections a sung block can turn out to be. An instrumental with words is not one. */
const sungKinds = new Set(["Verse", "Chorus", "Pre-Chorus", "Bridge"]);

/**
 * Names every block that has chords.
 *
 * Most files never mark their chorus, but a chorus is the stanza whose words come round again —
 * verses share chords and change words — so an unlabelled block sung twice, word for word, is
 * labelled a chorus. Any other unlabelled block is a verse when it has words, and a block with no
 * words is an intro before the singing starts, an outro after it ends, and an instrumental in
 * between.
 */
function nameSections(blocks: WorkingBlock[]): void {
    const counts = new Map<string, number>();
    for (const block of blocks) {
        if (block.words.length >= minimumChorusLetters) {
            counts.set(block.words, (counts.get(block.words) ?? 0) + 1);
        }
    }

    const played = blocks.filter((block) => playedChords(block.chords).length > 0);
    let firstSung = -1;
    let lastSung = -1;
    played.forEach((block, index) => {
        if (block.lyric) {
            firstSung = firstSung === -1 ? index : firstSung;
            lastSung = index;
        }
    });

    played.forEach((block, index) => {
        if (block.label === null && (counts.get(block.words) ?? 0) > 1) {
            block.label = "Chorus";
        }
        if (block.label !== null) {
            block.section = block.label;
        } else if (block.lyric) {
            block.section = "Verse";
        } else if (firstSung === -1 || index < firstSung) {
            block.section = "Intro";
        } else {
            block.section = index > lastSung ? "Outro" : "Instrumental";
        }
    });
    for (const block of blocks) {
        if (block.section === null && block.cue) {
            block.section = block.label;
        }
    }
}

// MARK: - Progressions

/**
 * One section per distinct progression, in the order each first appears.
 *
 * A labelled block keeps its label and merges only into a section of the same name, so a verse and
 * a chorus that happen to share their chords stay two sections — which progression goes with which
 * part of the song is the information worth keeping. An unlabelled block merges into a section
 * that already plays its chords: a sung block into a sung section, a block without words into any.
 * Distinct progressions under one name are numbered (`Verse 1`, `Verse 2`).
 */
export function mergeProgressions(document: ChordProDocument): ChordProSection[] {
    const candidates = document.blocks
        .filter((block) => block.section !== null)
        .map((block) => ({ block, chords: playedChords(block.chords) }))
        .filter((candidate) => candidate.chords.length > 0);

    interface Group {
        kind: string;
        match: string[];
        chords: string[];
        repeats: number;
        occurrences: number;
    }
    const groups: Group[] = [];

    for (const { block, chords } of candidates) {
        const shape = progressionShape(chords);
        // A lone chord — the final strum under the last word — is not a progression.
        if (shape.chords.length < 2 && candidates.length > 1) {
            continue;
        }
        const kind = block.section ?? "Verse";
        const same = (group: Group) => sameChords(group.match, shape.match);
        const match = block.label !== null
            ? groups.find((group) => same(group) && group.kind === kind)
            : groups.find((group) => same(group) && group.kind === kind) ??
                groups.find((group) => same(group) && (!block.lyric || sungKinds.has(group.kind)));

        if (match) {
            match.occurrences += 1;
        } else {
            groups.push({ kind, ...shape, occurrences: 1 });
        }
    }

    const totals = new Map<string, number>();
    for (const group of groups) {
        totals.set(group.kind, (totals.get(group.kind) ?? 0) + 1);
    }
    const seen = new Map<string, number>();
    return groups.map((group) => {
        const ordinal = (seen.get(group.kind) ?? 0) + 1;
        seen.set(group.kind, ordinal);
        return {
            name: (totals.get(group.kind) ?? 0) > 1 ? `${group.kind} ${ordinal}` : group.kind,
            chords: group.chords,
            repeats: group.repeats,
            occurrences: group.occurrences,
        };
    });
}

/**
 * ChordPro writes a chord wherever it changes under the words, and transcribers routinely write it
 * again at the start of every line or bar it is held through. Adjacent repeats describe the page,
 * not the music, and are collapsed. A "no chord" that merely pads the start or end goes with them.
 */
export function playedChords(chords: readonly string[]): string[] {
    const collapsed = chords.filter((chord, index) => index === 0 || chord !== chords[index - 1]);
    while (collapsed[0] === "N.C.") {
        collapsed.shift();
    }
    while (collapsed[collapsed.length - 1] === "N.C.") {
        collapsed.pop();
    }
    return collapsed;
}

/**
 * What a block stores, and what it is compared by.
 *
 * Transcribers write a loop out as many times as it is sung and then land on its first chord once
 * more to close the line: `D Bm C A7 D Bm C A7 D`. That is the loop `D Bm C A7` played twice with
 * its resolution, so it is stored as the loop with a repeat count, and two blocks that differ only
 * in how often they went round compare equal. A single pass with its resolution (`G C D G`) is
 * stored as written, since there is no loop to fold it into, but still compares equal to `G C D`.
 */
export function progressionShape(
    chords: readonly string[],
): { chords: string[]; repeats: number; match: string[] } {
    const exact = foldLoop(chords);
    if (exact !== null) {
        return { chords: exact.chords, repeats: exact.repeats, match: exact.chords };
    }
    const resolved = chords.length >= 3 && chords[chords.length - 1] === chords[0]
        ? chords.slice(0, -1)
        : null;
    if (resolved !== null) {
        const looped = foldLoop(resolved);
        if (looped !== null) {
            return { chords: looped.chords, repeats: looped.repeats, match: looped.chords };
        }
        return { chords: [...chords], repeats: 1, match: resolved };
    }
    return { chords: [...chords], repeats: 1, match: [...chords] };
}

/**
 * The shortest cycle whose repetition reproduces the whole sequence, or null when only the full
 * sequence does or the repeat count would pass the ceiling. Mirrors `foldSectionChords` in the
 * backend's domain, which this file cannot import.
 */
function foldLoop(chords: readonly string[]): { chords: string[]; repeats: number } | null {
    for (let period = 1; period <= chords.length / 2; period += 1) {
        if (chords.length % period !== 0) {
            continue;
        }
        let repeats = true;
        for (let index = period; index < chords.length; index += 1) {
            if (chords[index] !== chords[index - period]) {
                repeats = false;
                break;
            }
        }
        if (repeats) {
            const cycles = chords.length / period;
            return cycles > maximumFoldedRepeats
                ? null
                : { chords: chords.slice(0, period), repeats: cycles };
        }
    }
    return null;
}

function sameChords(left: readonly string[], right: readonly string[]): boolean {
    return left.length === right.length && left.every((chord, index) => chord === right[index]);
}

// MARK: - File names

/**
 * ozbcoz.com files are saved as `Title — Artist [1234].pro`. Only that shape is trusted: a plain
 * hyphen is as likely to sit inside a title ("80bpm straight - We Will Rock You") as between a
 * title and an artist.
 */
export function splitChordProFileName(
    fileName: string,
): { title: string | null; artist: string | null } {
    const base = chordProBaseName(fileName).replace(/\s*\[\d+\]\s*$/u, "");
    const separator = base.lastIndexOf(" — ");
    if (separator <= 0) {
        return { title: null, artist: null };
    }
    return {
        title: cleanText(base.slice(0, separator)),
        artist: cleanText(base.slice(separator + 3)),
    };
}

/** A file name without its folder or ChordPro extension. */
export function chordProBaseName(fileName: string): string {
    const name = fileName.split(/[\\/]/u).pop() ?? fileName;
    return name.replace(/\.(?:pro|cho|chopro|chordpro|crd|txt)$/iu, "");
}

export function cleanText(value: string | null | undefined): string | null {
    const cleaned = (value ?? "").replace(/\s+/gu, " ").trim();
    return cleaned.length > 0 ? cleaned : null;
}

// MARK: - chordlist Markdown

export type ChordlistOutputMode = "song" | "progressions";

export interface ChordlistMarkdown {
    title: string | null;
    artist: string | null;
    /** What to save the file as: `Title.md`, inside a folder named for the artist. */
    fileName: string;
    frontmatter: string;
    body: string;
    /** The whole file. */
    markdown: string;
    sections: ChordProSection[];
}

/**
 * A chordlist song file for the document.
 *
 * `song` writes the whole sheet the way chordlist's own files are written: a `[Section]` heading
 * above each stanza that has chords, and every chord on a chord line over the syllable it fell on
 * in the ChordPro. `progressions` writes only the headings, each followed by its section's
 * progression — the same merged sections the backend stores.
 *
 * Either way the frontmatter carries the title, artist and the song's main progressions, so the
 * song list shows them, plus the key, capo and tempo when the file states them.
 */
export function renderChordlistMarkdown(
    document: ChordProDocument,
    options: { mode: ChordlistOutputMode; fileName?: string },
): ChordlistMarkdown {
    const fromFileName = options.fileName
        ? splitChordProFileName(options.fileName)
        : { title: null, artist: null };
    const title = cleanText(document.metadata.title) ?? fromFileName.title ??
        (options.fileName ? cleanText(chordProBaseName(options.fileName)) : null);
    const artist = cleanText(document.metadata.artist) ?? fromFileName.artist;
    const sections = mergeProgressions(document);

    const fields: Array<[string, string | null]> = [
        ["title", title],
        ["artist", artist],
        ["chords", mainProgressions(sections)],
        ["key", cleanText(document.metadata.key)],
        ["capo", cleanText(document.metadata.capo)],
        ["tempo", cleanText(document.metadata.tempo)],
    ];
    const frontmatter = fields
        .filter((field): field is [string, string] => field[1] !== null)
        // The app JSON-decodes a quoted title or artist; every other field it reads as written.
        .map(([key, value]) =>
            `${key}: ${key === "title" || key === "artist" ? yamlScalar(value) : value}`
        )
        .join("\n");

    const body = options.mode === "song"
        ? renderSong(document)
        : sections.map((section) => `[${section.name}] ${section.chords.join(" ")}`).join("\n\n");
    const markdown = (frontmatter ? `---\n${frontmatter}\n---\n\n` : "") +
        (body ? `${body}\n` : "");

    return {
        title,
        artist,
        fileName: `${safeFileName(title ?? "Untitled")}.md`,
        frontmatter,
        body,
        markdown,
        sections,
    };
}

/** The verse's and the chorus's progressions, or the first section's when there is neither. */
function mainProgressions(sections: readonly ChordProSection[]): string | null {
    const base = (name: string) => name.replace(/ \d+$/u, "");
    const picks = ["Verse", "Chorus"]
        .map((kind) => sections.find((section) => base(section.name) === kind))
        .filter((section): section is ChordProSection => section !== undefined);
    const chosen = picks.length > 0 ? picks : sections.slice(0, 1);
    // `N.C.` is no chord, and the app's progression field would refuse it.
    const progressions = chosen
        .map((section) => section.chords.filter((chord) => chord !== "N.C.").join(" "))
        .filter((progression, index, all) => progression && all.indexOf(progression) === index);
    return progressions.length > 0 ? progressions.join(", ") : null;
}

function renderSong(document: ChordProDocument): string {
    const verses = document.blocks.filter((block) => block.section === "Verse").length;
    let verse = 0;
    const out: string[] = [];

    for (const block of document.blocks) {
        const lines: string[] = [];
        if (block.section !== null) {
            const numbered = block.section === "Verse" && verses > 1;
            lines.push(numbered ? `[Verse ${++verse}]` : `[${block.section}]`);
        }
        for (const line of block.lines) {
            lines.push(...renderLine(line));
        }
        if (lines.length > 0) {
            out.push(lines.join("\n"));
        }
    }
    return out.join("\n\n");
}

function renderLine(line: ChordProLine): string[] {
    switch (line.type) {
        case "blank":
            return [""];
        case "comment":
        case "tab":
            return [line.text];
        case "chords":
            return [chordLine(line.chords, 0, 2)];
        case "lyric": {
            const leading = line.text.length - line.text.trimStart().length;
            const words = line.text.trim();
            if (line.chords.length === 0) {
                return [words];
            }
            return [chordLine(line.chords, leading, 1), words];
        }
    }
}

/**
 * Each chord in the column of the character it was attached to, pushed right only as far as
 * keeping `gap` spaces from the one before it needs. The same layout as `ChordChartLayout` in the
 * app, so a converted file reads exactly as the app would have shown the ChordPro.
 */
function chordLine(chords: readonly ChordPlacement[], leading: number, gap: number): string {
    let line = "";
    for (const placement of chords) {
        if (placement.chord === "N.C.") {
            continue;
        }
        const start = Math.max(
            placement.offset - leading,
            line.length === 0 ? 0 : line.length + gap,
        );
        line += " ".repeat(start - line.length) + placement.chord;
    }
    return line;
}

/** A YAML value, quoted whenever leaving it bare could change what it means. */
function yamlScalar(value: string): string {
    const bare = /^[^\s\-?:,[\]{}#&*!|>'"%@`]/u.test(value) && !/:\s|\s#|\s$|:$/u.test(value) &&
        !/^(?:true|false|yes|no|on|off|null|~|[-+]?(?:\d[\d_]*)?(?:\.\d+)?(?:e[-+]?\d+)?)$/iu.test(
            value,
        );
    return bare ? value : JSON.stringify(value);
}

function safeFileName(value: string): string {
    return value.replace(/[/\\:*?"<>|]+/gu, "-").replace(/\s+/gu, " ").trim() || "Untitled";
}
