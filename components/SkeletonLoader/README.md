# SkeletonLoader

A placeholder with the **same geometry as the real thing** — `ds-bg-3` blocks on a slow 1.6s
opacity pulse (1 → 0.55 → 1), static under `prefers-reduced-motion`.

This, not a spinner, is how this system loads content whose shape it already knows. A grid of card
skeletons occupies exactly the space the cards will, so nothing jumps when they arrive.

## Variants

- **`card`** — a media `Card`: a 16:9 `ds-radius-sm` thumbnail block, then two 12px lines at 80%
  and 55%.
- **`entity`** — an `EntityCard` row: a 56px avatar block in a bordered `ds-bg-2` row with two
  lines.
- **`line`** — one 12px text line; `width` and `height` size it.
- **`block`** — a sized box, 120px tall by default.

## What the consumer provides

`variant`, `count` (repeat), `width` / `height` (for `line` and `block`), `grid` (wrap the repeats
in a `Grid`, for a loading page of cards), `label` (screen-reader status, "Loading" by default),
`class`. The wrapper is `display: contents`, so it never disturbs the grid it sits in.

## Don't

- Don't use a skeleton whose geometry differs from the content — that is worse than a spinner.
- Don't animate it faster. 1.6s is deliberately calm.
