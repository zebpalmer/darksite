# ListRow

One record as a dense row that is **neither a table row nor a card**: a leading picture, a title,
a meta line and trailing controls. A queue beside a detail pane, a picker's results, a short list
in a panel, "recent records" on a dashboard.

## Geometry

- **40px** by default, **32px** `dense`, **44px** on a coarse pointer whatever the density.
- `lines={2}` puts the meta under the title: 48px (40 dense, 52 on touch).
- Title in `body` `ds-text-1`, meta in `meta` `ds-text-3`; both truncate on one line with a
  `title` attribute. The trailing slot is `ds-text-3` with tabular figures for counts.
- Hover `ds-bg-2`. **Current** (the row the detail pane shows) is `ds-bg-4` with a 2px accent bar,
  like the rail. **Selected** (part of a multi-selection) is `ds-accent-tint`.

## What the consumer provides

`title`, `meta`, `lines` (1 | 2), `leading` snippet (a 16px icon, a 24px `Avatar`, a thumbnail),
`trailing` snippet (a `StatusBadge`, a count, a `Checkbox`, an icon `Button` — it sits **outside**
the link or button, so it may hold its own controls), `href` (the row is a link) or `onclick` (a
button) or neither (static), `current` (`aria-current`: `page` for a link, `true` for a button),
`selected`, `dense`, `disabled`, `as` (`li` by default — put rows in a `<ul>` — or `div`),
`class`.

`selected` is the look only: the `Checkbox` in the row carries the selection's semantics.

## ListRow, Table or EntityCard

| The records… | Use |
|---|---|
| are compared column by column, sorted, or bulk-selected with a header checkbox | `Table` |
| are one line each — a name and a little meta — in a narrow pane or a picker | `ListRow` |
| are people or organizations shown as an index, in a grid | `EntityCard` in a `Grid min={280}` |
| are media, where the picture is the point | `Card` in a `Grid` |

If you find yourself lining up a ListRow's meta into columns, it is a Table.

## Don't

- Don't nest a control inside the main link or button — use `trailing`.
- Don't wrap the title or meta onto more lines; use `lines={2}` or a Table.
- Don't use `current` for more than one row at a time.
