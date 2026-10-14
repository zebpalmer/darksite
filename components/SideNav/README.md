# SideNav

Secondary navigation **inside** a section — settings, an admin area, a multi-page configuration
flow. 200px, grouped, sticky, with its own scroll.

It sits **beside** the page, not above it, so the page keeps its own full `PageHeader`. A strip of
tabs across the top would compete with that header and run out of room by the eighth item.

32px rows, 11px uppercase `ds-text-3` group titles, active = `ds-bg-4` + `ds-text-1` + a 2px
`ds-accent` bar. A group whose pages are all unvisited may start collapsed, expanding when one of
its pages becomes current.

## When tabs are right instead

A small set of sibling **data views** whose tables need the full width — say a reports section with
five views of the same records — uses `Tabs` in links mode, inline in the `PageHeader`. All three
must hold: about six sections at most, each a view of the same data rather than a separate settings
page, and pages that are wide tables or grids. Anything else gets a `SideNav`.

## Below `ds-bp-phone` it becomes a `<select>`

A full-width native select under the top bar, with `<optgroup>` for the groups. Not a sheet, not a
drawer: a native select is the one control every phone renders well, it needs no custom focus
handling, and secondary navigation is not worth a modal.

## What the consumer provides

`items` (`{ id, label, href, group, badge? }[]`), `groups` (ordered ids and labels), `current`,
`collapsible` (default false), `label` (the `aria-label` for the `<nav>`).

## Don't

- Don't put it above the page as a tab strip — if a tab strip is right, use `Tabs` (see above).
- Don't nest a third level of navigation. If a section needs one, it is a section of its own.
- Don't duplicate an item that is already in the rail.
