# Grid

The card grid. **Container-driven, never viewport breakpoints:**

```css
grid-template-columns: repeat(auto-fill, minmax(min(var(--card-min), 100%), 1fr));
```

so it adds columns as its pane widens — a grid beside an open filter panel has fewer columns than
the same grid with the panel closed, without anyone writing a breakpoint — and never stretches a
card past its L width. Default gap `18px 14px` (row × column).

## Density is the user's choice

`density` S / M / L maps to a card min-width of 180 / 232 / 320px. Omit the prop and the grid
reads the signed-in user's own grid-density preference, M by default.

Phones force thumbnail grids **2-up**, so S / M / L do not all collapse to one column. A grid
given an explicit `min` of **260px or more** is a row grid (`EntityCard`) and keeps its min: one
per line.

## What the consumer provides

`density`, `min` (explicit px, which overrides density), `gap`, `class`, `data-*` passthrough,
children (the cards).

## Don't

- Don't write `lg:grid-cols-5`. That is the bug this component exists to prevent.
- Don't put a card in a fixed-width column.
- Don't cap the page width to control the column count — let the pane do it.
