# Meter

A determinate proportion: a 6px `ds-bg-4` track with rounded ends holding up to **three**
segments, and an optional legend underneath (an 8px swatch, the label and the count, 12px).

## Color

Segments take the **categorical palette** by position — `ds-cat-1`, `-2`, `-3` — or a semantic
`tone` when a segment means one (`success` for "done" in a progress meter). A 2px gap of track
separates segments and the legend always names them, so no segment relies on color alone.

The categorical palette (`ds-cat-1`…`ds-cat-5`: azure, gold, cyan, lime, neutral) stays clear of
the accent, the semantic roles and the severity scale. Every color holds at least 3:1 on the page
(`ds-bg-1`), on `ds-bg-2` and on the track in every mode, and neighbors alternate lighter and
darker. The charts (`CellBar`, `BarSeries`, `Ring`) use the same palette, and `ds-accent-2` as a
sixth color.

## Accessibility

`role="meter"` — or `progressbar` with `kind="progress"` — with `aria-valuenow`, `aria-valuemax`
and an `aria-valuetext` that states every segment: "Done 12, In progress 5, Blocked 2 of 30".

## What the consumer provides

`segments` (`{ label, value, tone? }[]`), `label` (the accessible name), `max` (default: the sum),
`kind`, `legend` (default true), `class`.

## Don't

- Don't use it for loading; that is a `Spinner` or a `SkeletonLoader`.
- Don't exceed three segments; that is a chart — a `Ring` for parts of a whole, a `BarSeries` over
  time.
- Don't use a categorical color to mean something — meaning belongs to the semantic and severity
  roles.
