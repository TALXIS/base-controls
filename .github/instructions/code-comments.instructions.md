---
applyTo: "**"
description: "How to write (and when not to write) code comments."
---

# Code comments

Default to **zero** comments. Code should carry its own meaning through naming and structure. A comment is a cost: it has to be read, kept true, and updated forever. Write one only when the code cannot say it itself.

## Write a comment only for

- **Why, not what.** A non-obvious decision, a trade-off, or a constraint that isn't visible in the code.
- **External forces.** Browser/API/library quirks, upstream bugs, spec requirements, workarounds — link the issue or spec.
- **Landmines.** Ordering requirements, invariants a future edit could silently break, "don't refactor this into X because Y".
- **Public API docs.** TSDoc on exported types, props, and functions consumers use — describe contract and behaviour, not implementation.

## Never write

- **Restatements.** `// increment counter` above `counter++`, or a header repeating the function name.
- **Change narration.** Anything about what you are doing right now: `// now uses the new hook`, `// refactored to`, `// added prop for`, `// removed the old implementation`. This context expires the moment the change merges.
- **History.** How it used to work, what the previous approach was, what was deleted. Git holds that.
- **Chat residue.** References to the conversation, the request, the ticket, the reviewer, "as discussed", "per your request".
- **Section banners and decoration.** `// ---- Helpers ----`, ASCII art, boxes.
- **Commented-out code.** Delete it.
- **Obvious TODOs.** No speculative `// TODO: maybe make this configurable`.

## Style

- One line where possible. Two sentences is already long; a paragraph almost never belongs in source.
- Plain, factual, present tense. No hedging, no enthusiasm, no explaining yourself to the reader.
- `//` for implementation notes, TSDoc `/** */` only for public API.
- Match the surrounding file's comment density — if the neighbouring code has no comments, that's the target.

## The survival test

Before keeping a comment, ask: **would this still be useful in a year to someone who never saw this diff?** If not, delete it.

## When editing existing code

- Don't add comments to explain your edit.
- Do update or delete comments your edit made wrong or stale.
- Don't strip comments you didn't invalidate — someone wrote them for a reason.
