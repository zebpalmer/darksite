# SkeletonLoader

A placeholder with the **same geometry as the real thing** — `ds-bg-3` blocks on a slow 1.6s
opacity pulse (1 → 0.55 → 1), static under `prefers-reduced-motion`.

This, not a spinner, is how this system loads content whose shape it already knows. A grid of card
skeletons occupies exactly the space the cards will, so nothing jumps when they arrive.

## Variants

- **`line`** (default) — one 12px text line; `width` and `height` size it.
- **`block`** — a sized box, 120px tall by default.
- **`card`** — a media `Card`: a 16:9 `ds-radius-sm` thumbnail block, then two 12px lines at 80%
  and 55%.
- **`entity`** — an `EntityCard` row: a 56px avatar block in a bordered `ds-bg-2` row with two
  lines.
- **`grid`** — a whole `Grid` of `card` placeholders (`count`, 8 by default). It takes the Grid's
  own `density`, `min` and `gap`, and with neither it reads `--ds-grid-min` like the real Grid, so
  the placeholders land in exactly the columns the cards will. A `min` of 260 or more draws
  `entity` rows instead, as a row grid does.

## What the consumer provides

`variant`, `count` (repeat), `width` / `height` (for `line` and `block`), `density` / `min` /
`gap` (for `grid`), `label` (a screen-reader
status, "Loading" by default — pass `null` when an ancestor already announces loading, as a
`Table` does with `aria-busy`), `class`. The wrapper is `display: contents`, so it never disturbs
the grid or cell it sits in.

## Don't

- Don't use a skeleton whose geometry differs from the content — that is worse than a spinner.
- Don't animate it faster. 1.6s is deliberately calm.
