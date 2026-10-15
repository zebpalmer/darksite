# Table

Rows and columns — most operator screens. `Grid` is for media cards; everything else is a Table.

## Geometry

Header 34px; body rows **40px**, **32px** with `density="dense"`, and **44px** under a coarse
pointer whatever density was passed. 12px cell padding, with the first and last columns at
`--ds-table-inset` (12px by default) so a table can sit flush with its pane's own inset. Row
dividers `ds-border-subtle`, the header divider `ds-border`, header text 12/500 `ds-text-3`.

Cells are **one line**, with an ellipsis and the full value in `title`. Column widths come from
`width` or an even share — `table-layout: fixed`, so no long string ever sets a column's width.

## Columns

Each column declares `key`, `label`, and optionally `align` (`end` for numbers), `width`,
`priority`, `mono` (serials, hashes, paths — mono with tabular figures), `sortable`, `value(row)`
(defaults to `row[key]`) and `cell` (a snippet for custom rendering).

**Priority** drops columns as the *table* narrows — the table's own width, never the viewport:
priority 3 hides below 720px, priority 2 below 480px, priority 1 never.

Those thresholds suit a table with a handful of columns. A wide table — ten columns, or one beside a
side rail — gets cramped well before 720px, so move them per table with `hideBelow`:
`hideBelow={{ 3: 960, 2: 640 }}` (either key alone keeps the other's default). The default
thresholds are pure container queries; with `hideBelow` the table measures its own width with a
`ResizeObserver` instead (a container query cannot take a variable), so before it mounts every
column shows.

## Scrolling and the sticky header

The table owns its scrolling. In a **work view** give it a bounded height — make it the pane's
`flex: 1; min-height: 0` body — and the header sticks while rows scroll. In a **content page** the
document scrolls and the header does not stick: a horizontal scroll container cannot pass a sticky
header up to the document, which is a CSS limit, not a choice. Keep long tables in work views.
Set `minWidth` to scroll sideways inside the container instead of squeezing columns.

## Sorting

A sortable header is a button with `aria-sort` and a 16px sort icon. One key at a time: clicking a
new column sorts ascending, clicking the sorted one flips it. The consumer owns the data —
`sort` is bindable and `onsort({ key, direction })` fires on every change.

## Selection

`selectable` adds a leading `Checkbox` column; `selected` is a bindable `Set` of row keys. The
header box goes mixed when some rows are selected, and clicking it selects or clears every loaded
row. **Shift-click** selects a range. A selected row takes `ds-accent-tint`. The selection count and
bulk actions live in the pane's `ActionBar`, never in a floating toolbar. Selecting rows that are
not loaded yet is a second step — see `docs/layout.md`, "Long lists".

## Row groups

`groupBy(row)` returns a group key, and the rows sit under a header row per group inside the one
table — one set of columns, one selection, one keyboard path — instead of a Pane and a Table per
group. Groups keep the order they first appear in `rows`, so sort the rows to order the groups; rows
show group by group.

Each group is its own `<tbody>` whose header is a `<th scope="rowgroup">` spanning the row: 32px,
12/500 `ds-text-2`, the group's count after it in `ds-text-3`, and it sticks under the column header
while its rows scroll past. `groupLabel(key)` gives the header text (the key by default, so map a
stored code to its label); the `group` snippet replaces the header, receiving `{ key, label, rows,
count }`. Arrow keys move across groups; the header rows take no focus. Header selection still
selects every loaded row.

## Row marks

A row can carry a 3px leading stripe, drawn inside its first cell so no column shifts:

- `rowTone(row)` → `accent`, `success`, `warning` or `danger` — the semantic roles' marks, for a
  state that needs to stand out in a long list (a failed run, a held record).
- `rowSeverity(row)` → a severity — the severity mark, only ever for a severity (`docs/severity.md`).
  It wins over `rowTone`.

The stripe is a scan aid, never the only signal: the row must say the same thing in words, with a
`StatusBadge` or `SeverityBadge` in a cell. Mark the exceptions, not every row.

## Row links and keyboard

`href(row)` makes the whole row navigable through a real link in its first cell: a pointer click
anywhere in the row follows it, unless the click lands on a control inside the row.

Rows take focus: **↑ / ↓** move it, **Home / End** jump, **Space** toggles selection, **Enter**
opens the row. The focused row shows the focus ring inset.

## States

- **Loading:** `loading` shows `loadingRows` skeleton rows of the real geometry and sets
  `aria-busy`.
- **Empty:** the `empty` snippet, or a default `EmptyState`, inside the table's frame.
- **Missing values:** `null`, `undefined` or `''` render the `Missing` mark — an em dash in
  `ds-text-3`, announced as "No value". Never a blank cell — a blank reads as still loading.
  Override the mark with `missing`; a custom `cell` uses `<Missing />` itself.

## What the consumer provides

`rows`, `columns`, `rowKey(row)`, `label` (the accessible name), `density`, `selectable`,
`selected` (bindable), `sort` (bindable), `onsort`, `href`, `cell` (a fallback snippet for columns
without their own), `empty`, `loading`, `loadingRows`, `missing`, `minWidth`, `groupBy`,
`groupLabel`, `group`, `rowTone`, `rowSeverity`, `hideBelow`, `class`.

## Don't

- Don't paginate inside the table; long lists end in "Load more" below it.
- Don't let a cell wrap to a second line.
- Don't give a priority-1 column to anything a reader can do without.
- Don't use a Table for media — that is `Grid` + `Card`.
- Don't stack a Pane and a Table per group; use `groupBy`.
- Don't mark every row, and don't let a stripe be the only place a state is shown.
