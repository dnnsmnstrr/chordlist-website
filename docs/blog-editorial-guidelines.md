# Blog editorial guidelines

## Purpose

The chordlist blog helps musicians:

1. Learn practical ideas about chords and playing songs.
2. Build a durable, portable songbook.
3. Use chordlist and compatible tools effectively.

Every post should solve a recognisable reader problem. Product promotion should follow naturally
from that solution.

## Audience

Write for working and aspiring musicians who understand ordinary chord names but may not know
music-theory terminology or Markdown conventions.

Explain an unfamiliar term once, in plain language. Do not assume the reader is a developer.

## Voice

- Be practical, calm, direct, and musician-first.
- Use second person when giving advice and present tense where it reads naturally.
- Prefer concrete examples to abstract claims.
- Be confident without pretending a shortcut works universally.
- Mention a limitation where it changes the reader's decision; do not force every post to end with
  the same limitation formula.
- Avoid hype, scare tactics, exclamation marks, and generic openings such as "Have you ever
  wondered…?"
- Keep `chordlist` lowercase in prose and headings. Avoid starting a sentence with the name when
  that makes the lowercase styling look accidental.
- Use British English: `practise` as a verb, `normalise`, and `recognisably`.

## Shape the article around one promise

State the reader's problem or useful result in the first two paragraphs. Give each post one main
promise and remove sections that do not help deliver it.

A useful default structure is:

1. **Problem or result:** establish why the subject matters.
2. **Explanation:** teach the central idea.
3. **Example:** show real chords, a file excerpt, or a concrete situation.
4. **Action:** give the reader a small procedure or exercise.
5. **chordlist connection:** explain one relevant capability.
6. **Trade-off:** cover a limitation when it materially affects the advice.
7. **Closing:** leave the reader with a takeaway or next action.

These do not have to be separate sections. Use `##` headings for the main structure and `###`
sparingly. Do not add an H1 to a post body; the title from the frontmatter is the page H1.

Most posts should be about 600–1,000 words. A shorter post is fine when the idea is complete. Before
publishing a post under roughly 500 words, check whether it overlaps an existing article or lacks a
practical example.

## Titles and descriptions

- Describe the reader's task, question, or outcome.
- Prefer a title of roughly 45–65 characters, but treat clarity as more important than a hard limit.
- Avoid an exaggerated promise unless the article explicitly and convincingly qualifies it.
- Write a one-sentence description of roughly 120–160 characters that stands on its own.
- Do not merely repeat the title in the description.
- Treat the filename as a permanent URL. Use lowercase ASCII kebab-case with no date prefix, and do
  not rename an existing post.

## Write about music precisely

- Use `G D Em C` when showing what to enter in chordlist.
- Use G–D–Em–C when naming a progression in prose.
- Use I–V–vi–IV for Roman-numeral analysis.
- Put literal field names, filenames, commands, and file contents in code formatting.
- Explain Roman numerals before relying on them.
- State whether an example is in concert pitch, uses a capo, or represents a movable pattern when
  the distinction matters.
- Treat ear-training and music-theory rules of thumb as clues, not laws.
- Treat `always`, `never`, `most`, `every`, and precise-sounding historical or quantitative claims
  as fact-check warnings. Qualify or source them.

## Be exact about the product

- Teach the reader's subject before introducing chordlist.
- Give each post one principal product connection. Link to the documentation for operational detail
  instead of repeating the same feature explanation across articles.
- Describe current behaviour, not planned behaviour, as present fact.
- Verify app behaviour against the current implementation or documentation. In particular, do not
  describe progression matching as approximate or intelligent similarity unless that is what the
  current implementation does.
- Check product facts, availability, pricing, privacy, analytics, and platform support against the
  repository sources named in the blog-post skill. Do not rely on an older post as the authority.
- Do not repeat the site-wide download CTA in the body; every article already renders one after the
  post.
- Put a consequential limitation next to the feature it affects.

## Link with intent

Include links because they help the reader continue, not to meet a quota. A substantial post should
normally contain:

- one relevant documentation link;
- one contextual link to another blog post, when a useful next article exists; and
- a primary source for an external factual claim.

Use descriptive link text. Link directly to third-party instructions rather than sending readers
through an intermediate page when the external source is what they need.

## Use tags selectively

- Choose one primary tag.
- Add one secondary tag only when it describes a substantial part of the article.
- Use `workflow` only for a repeatable procedure, not as a default label.
- Do not tag a subject that receives only a passing mention.
- Propose a new tag only when several current or planned posts would use it.

## Images, examples, and copyright

- Add a screenshot when it makes a workflow easier to understand, not as decoration.
- Use a table or diagram when comparing three or more exact mappings.
- Write original example lyrics or use material that is clearly in the public domain. Do not
  reproduce copyrighted lyrics simply because they are easy to find online.
- Give every meaningful image useful alt text. Describe what matters in the image rather than
  repeating its caption.
- Check code blocks, tables, and images at a narrow mobile width.

## Editorial checklist

Before scheduling a post, confirm that:

- the opening states a concrete reader problem or result;
- the article delivers one clear promise;
- broad music-theory claims are qualified or supported by a primary source;
- current chordlist behaviour and product facts have been verified;
- repeated product copy has been removed;
- the post includes a useful example, procedure, or exercise;
- internal and external links are relevant and accurate;
- the title, description, slug, dates, draft status, and tags are valid;
- example lyrics are original or clearly reusable;
- the ending gives the reader a useful takeaway or next action; and
- the post has been checked on mobile and in a preview build.
