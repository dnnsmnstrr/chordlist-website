---
name: blog-refine
description: Refine a chordlist blog post the author drafted in writing mode (/editorial) so it matches the blog's language and style, while keeping it in the author's own words. Use when asked to refine, polish, tidy, edit, or proofread a post in content/blog.
---

# Blog refine

The author writes every post themselves, in writing mode at `/editorial/<slug>`, from an outline.
This skill makes that draft read like the rest of the blog — consistent spelling, terminology,
formatting, and structure — without turning it into somebody else's article.

**You are an editor, not a ghostwriter.** The finished post must still be recognisably the author's:
their argument, their examples, their order of ideas, and as many of their sentences as can stand.

## Hard rules

- **Never approve.** Do not write, copy, or recompute `approved` or `approvedDigest`, and do not call
  the `/api/editorial` approve action. Only the author approves, in `/editorial`, after reading the
  result. `lib/blog.ts` keeps unapproved posts out of production; that gate is the author's, not
  yours.
- **Never add substance.** No new claims, examples, sections, anecdotes, statistics, links to
  external sources, or conclusions the draft does not already make. If something is missing, say so
  in your summary as a suggestion — do not write it in.
- **Never fill a gap with your own prose.** A `TODO`, an unfinished sentence, or a bullet left from
  the outline stays as it is, and you list it in the summary.
- **Leave the plan alone.** Do not change the filename, `published`, `created`, `tags`, `draft`, or
  `outline`. Propose a better `title` or `description` in the summary; change them only if the
  author asks.
- **Never bring the archive into the draft.** `content/blog-archive/<slug>.md` holds the old
  machine-drafted version of a rewritten post. You may read it to check a fact or find a link target
  the author's draft already relies on, but do not reuse its wording, examples, or structure, do not
  suggest sections because the old version had them, and do not quote it in your summary unless the
  author asks. The author chose not to see it while writing.
- **Do not touch an empty post.** If the body is empty or only restates the outline, stop and say
  the post has not been written yet.

## Workflow

1. **Read the rules of the house.** Read `docs/blog-editorial-guidelines.md` completely, then
   `docs/blog-voice.md` — the author's own voice, which outranks generic style advice wherever the
   two differ.
2. **Read for voice.** Read two or three of the most recent posts in `content/blog/` whose frontmatter
   carries `approved:`. Those are the author's approved words and the reference for cohesion. Ignore
   anything unapproved, and above all `content/blog-archive/`: those are the machine-drafted
   versions the author is rewriting, kept out of the editor so they do not anchor the rewrite. They
   are not the voice to match.
3. **Keep the original.** Copy the post file, unchanged, to `.blog-originals/<slug>.md` (gitignored)
   before editing, overwriting any older copy. That is how the author compares their words with
   yours: `diff .blog-originals/<slug>.md content/blog/<slug>.md`.
4. **Check the facts you are not allowed to change.** Verify every product claim against the sources
   listed under **Accuracy** in `.agents/skills/blog-post/SKILL.md`, and every music claim the
   editorial guidelines flag (`always`, `never`, precise history). Do not correct a doubtful claim
   by rewriting it — flag it in the summary with what the source says.
5. **Edit, in this order, stopping as soon as the post reads well:**
   1. Mechanics — spelling (British: `practise` as a verb, `-ise`), punctuation, typos, grammar.
   2. House conventions — lowercase `chordlist`; `G D Em C` for what to type, G–D–Em–C in prose,
      I–V–vi–IV for analysis; code formatting for filenames, fields, and menu paths; `##` headings
      in sentence case, no H1; descriptive link text; verified internal link targets from the
      blog-post skill.
   3. Clarity — split a sentence that loses the reader, cut words that repeat, replace jargon the
      guidelines would have explained once.
   4. Shape — only if the draft needs it: a heading where a long run of paragraphs changes subject,
      a list where a procedure is buried in prose, the reader's problem moved into the first two
      paragraphs.
   Keep the author's word choices, rhythm, and humour. Where a sentence is idiosyncratic but correct,
   it stays.
6. **Report.** Reply with:
   - a short list of what changed and why, grouped by the steps above;
   - every flagged claim, gap, or `TODO`, with the source you checked;
   - an optional proposed title and description, if the current ones miss the guideline lengths or
     promise; and
   - the next step: review in `/editorial/<slug>`, then approve there.

If the draft was approved before you edited it, say plainly that your edit withdrew the approval —
the digest no longer matches — and that the post will not go live until the author approves again.

## Learning the voice

`docs/blog-voice.md` is how cohesion builds up over time. After a session, if the author's draft or
their reaction to your edits showed a clear, repeated preference — a word they always use, a
construction they reverted, a kind of opening they like — offer to add it there. Write it down only
when the author agrees, as one short line with an example. Never record a preference from a single
instance, and never from text you wrote.

## Validation

Run `pnpm lint` only if you touched anything outside the Markdown body. Run `pnpm build:og` only if
the author asked you to change the title or description. A body edit needs neither.
