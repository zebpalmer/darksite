# Ring

Parts of **one whole**, as a ring: records by state, storage used of what is available.

## Geometry

`size` px square (default 112), a `thickness` px track (default 12) in `ds-bg-4`, and up to six
arcs clockwise from the top with 2px of track between them, so no arc relies on color alone. The
middle holds the total (20/500, tabular) and an optional `centerLabel` under it (12px `ds-text-3`),
or whatever the `center` snippet renders. A legend beside the ring — below it when there is no room
— names each part with its value.

`max` larger than the sum leaves the rest as track: "71 of 100" is one segment and `max={100}`.

## Color

The categorical palette by position — `ds-cat-1` … `ds-cat-5`, then `ds-accent-2` — or each part's
own `tone`. Never a semantic or severity color.

## Interaction

Hover an arc for a tooltip beside it: the part's name, its value and its share. From the keyboard
the ring is one tab stop; ← / → move between the parts, Esc hides the tooltip.

## Accessibility

The drawing is an image named by `label`. Every part is also in a visually hidden data table — its
name, value and share, and the total when `max` is set — captioned by `label`.

## What the consumer provides

`segments` (`{ label, value, tone? }[]`), `label`, `max`, `size`, `thickness`, `format(value)`,
`center` snippet, `centerValue` (default: the total), `centerLabel`, `legend` (default true),
`class`.

```svelte
<Ring label="Records by state" centerLabel="records" segments={[
  { label: 'Open', value: 185 },
  { label: 'In progress', value: 78 },
  { label: 'Blocked', value: 24 }
]} />
```

## Don't

- Don't use it for values over time; that is a `BarSeries`.
- Don't use it in a row or a table cell; a proportion on one line is a `Meter`.
- Don't use more than six parts; group the smallest as "Other".
