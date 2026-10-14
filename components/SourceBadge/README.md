# SourceBadge

The provenance pill for a value: `● Registry 96%`. It answers "where did this come from?" without
a sentence.

## Two variants

- **`applied`** (default) — 22px, `ds-accent-tint` ground, `ds-accent-text`, with a 6px
  `ds-accent` dot. The value **is** in the field.
- **`suggestion`** — 20px, neutral `ds-bg-4` / `ds-text-2`, no dot. It sits inside a dashed
  suggestion `Chip`, where the value is **not** applied.

## One source per badge

Name the **most reliable** source that produced the value, with its own percentage, and put the
full list in the `title` (`Sources: File 20% · Model 80%`). Rank sources from what a person
asserted to what was guessed — for example a value typed by hand, then a trusted registry, then
an import, then a model, then a default — and keep that order in one place.

## What the consumer provides

`source` (the display name — map the API's source enum to a label at the call site),
`confidence` (0–1, or a percentage; omit it and no number is shown), `variant`, `title` (the full
source list), `class`.

It is not a button. Nothing happens when you click it.

## Don't

- Don't stack two badges on one value.
- Don't show a percentage a source did not give you.
