# BarSeries

A few values **over time**, stacked: one bar per period (a day, a week), each split into up to six
categorical series, oldest on the left. Deliberately small — no axes library, no zoom, no pan, no
second chart type hiding inside it.

## Geometry

A plot `height` px tall (default 160), its bars sharing the width with a 2px gap (1px past 40
periods). The scale is one subtle line at the top with its value just above it (12px `ds-text-3`)
and a stronger baseline at zero — there is no grid. Under the bars, the first and last periods are
named, and the middle one when there are five or more; a period's name may overflow into its
unnamed neighbors. A legend under it names each series when there is more than one.

The scale is the largest total unless `max` sets it, which is how two charts side by side share
one.

## Color

The categorical palette by position — `ds-cat-1` … `ds-cat-5`, then `ds-accent-2` — or each series'
own `tone`. Never a semantic or severity color.

## Interaction

Hover a bar for a tooltip: the period (its `title`, or its label), each series' value with its
swatch, and the total. The hovered period takes a `ds-bg-3` band. From the keyboard, the chart is
one tab stop; it opens on the latest period and ← / → (Home / End) move between periods, Esc hides
the tooltip. On touch, a tap shows a period's tooltip.

## Accessibility

The drawing is an image named by `label`. Every value is also in a visually hidden data table — a
row per period, a column per series and the total, captioned by `label` — which is what assistive
technology reads.

## What the consumer provides

`series` (`{ key, label, tone? }[]`), `data` (`{ label, title?, values }[]`, in time order;
`values` maps a series key to a number, and a missing value counts as zero), `label`, `max`,
`height`, `format(value)`, `legend` (default true), `class`.

```svelte
<BarSeries
  label="Records per day"
  series={[{ key: 'opened', label: 'Opened' }, { key: 'closed', label: 'Closed' }]}
  data={days.map((d) => ({ label: formatDate(d.date), values: d.counts }))}
/>
```

## Don't

- Don't use it for fewer than three periods; that is a `Stat` or a `Meter`.
- Don't stack more than six series, or series that are not parts of one total.
- Don't use a categorical color to mean something.
