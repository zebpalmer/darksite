# Grid

The card grid. **Container-driven, never viewport breakpoints:**

```css
grid-template-columns: repeat(auto-fill, minmax(min(var(--card-min), 100%), 1fr));
```

so it adds columns as its pane widens — a grid beside an open filter panel has fewer columns than
the same grid with the panel closed, without anyone writing a breakpoint — and never stretches a
card past its L width. Default gap `18px 14px` (row × column).

## Density is the user's choice

`density` `s` / `m` / `l` maps to a card min-width of 180 / 232 / 320px. Omit the prop and the
grid reads `--ds-grid-min` (232px, M, by default), so an app applies the viewer's density
preference once, by setting that property on the root.

A thumbnail grid narrower than 520px goes **2-up** — a phone, or a narrow pane — so S / M / L do
not all collapse to one column. A grid given an explicit `min` of **260px or more** is a row grid
(`EntityCard`) and keeps its min: one per line.

## What the consumer provides

`density`, `min` (explicit px, which overrides density), `gap` (CSS, default `18px 14px`),
`label` (names the grid as a list), `class`, `data-*` passthrough, children (the cards).

## Don't

- Don't write `lg:grid-cols-5`. That is the bug this component exists to prevent.
- Don't put a card in a fixed-width column.
- Don't cap the page width to control the column count — let the pane do it.
