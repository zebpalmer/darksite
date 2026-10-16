# CellBar

A number with a bar, **inside a `Table` cell**: how each row compares with the largest, read down
the column. The smallest of the three charts.

## Geometry

A 6px `ds-bg-4` track with rounded ends filling the cell, a bar from its start in a categorical
color, and the value beside it in tabular figures at the cell's own size. The value sits in a
`valueWidth` column (default `6ch`), so every bar in the column starts and ends in the same place.
It stays on one line.

## Color

One categorical color, `ds-cat-1` by default: `tone` takes `1`–`5` or `'accent-2'`. Never a
semantic or severity color — a red bar would read as a problem. Every categorical color holds 3:1 on
the track and on the page and panel grounds.

## Accessibility

The value is the text the table reads; the bar is drawn for the eye and hidden from assistive
technology. Its tooltip says "312 of 1,240". With `showValue={false}` the value is still there for
a screen reader.

## What the consumer provides

`value`, `max` (the column's scale — usually its largest value, the same for every row), `tone`,
`format(value)`, `showValue` (default true), `valueWidth`, `class`.

```svelte
{#snippet records(row)}<CellBar value={row.records} {max} />{/snippet}

<Table {rows} columns={[
  { key: 'team', label: 'Team' },
  { key: 'records', label: 'Records', align: 'end', width: '220px', cell: records }
]} rowKey={(r) => r.id} label="Records by team" />
```

## Don't

- Don't give each row its own `max`; the bars only compare against one scale.
- Don't use more than one CellBar column in a table.
- Don't use it for progress toward a goal; that is a `Meter`.
