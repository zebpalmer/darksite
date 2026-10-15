# Missing

The missing-value mark: an em dash in `ds-text-3`, announced to assistive technology as "No value".
Use it wherever a value can be absent — a table cell, a fact in a detail pane, a line in a card —
so a blank never reads as still loading, and so every page says it the same way.

`Table` and `FactList` render it for an empty value (`null`, `undefined` or `''`) on their own;
reach for it directly in a custom cell or anywhere else a value may be missing.

```svelte
{#if record.owner}{record.owner}{:else}<Missing />{/if}
```

## Geometry

Inline text: it inherits the surrounding size and line height, and takes `ds-text-3`. The dash is
`aria-hidden`; a visually hidden "No value" carries the meaning.

## What the consumer provides

`mark` (default "—"), `label` (the spoken text; default "No value" — say "Not recorded" or "Not
set" only when the difference matters), `class`.

## Don't

- Don't leave a blank, or write "N/A", "None" or "Unknown" in its place.
- Don't render "0" or an empty string for a value that is genuinely unknown; zero is a value.
- Don't hand-roll the dash; a page that does loses the spoken label.
