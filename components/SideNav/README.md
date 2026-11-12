# SideNav

Secondary navigation **inside** a section — settings, an admin area, a multi-page configuration
flow. 200px, grouped, sticky, with its own scroll.

It sits **beside** the page, not above it, so the page keeps its own full `PageHeader`. A strip of
tabs across the top would compete with that header and run out of room by the eighth item.

32px rows, 11px uppercase `ds-text-3` group titles, active = `ds-bg-4` + `ds-text-1` + a 2px
`ds-accent` bar.

## Collapsible groups

With `collapsible`, each group title is a disclosure button. A group starts open when it holds the
current page; otherwise its `collapsed` says how it starts — `true` closed, `false` open — and with
neither it starts closed. After that the viewer's toggle wins. Items outside any group have no
title, so they are always listed.

```ts
const groups: NavGroup[] = [
  { id: 'workspace', label: 'Workspace', collapsed: false },
  { id: 'advanced', label: 'Advanced', collapsed: true }
];
```

## Badges

An item's `badge` is a count (`12`, shown `99+` past 99) or `true` for a dot. `badgeTone` colors it:
`neutral` (default, muted text), `warning` or `danger` (the state roles' text on their tint, which
the contrast check covers in every mode). Use a tone for a count that asks for attention, not for
decoration.

- **Collapsed groups.** While a collapsible group is closed, its toggle shows the **sum of its
  items' numeric badges**, in the **highest tone among the items that count** (danger, then
  warning, then neutral). A dot does not sum, an item with `0` does not count, and a sum of zero
  shows nothing. Open the group and the toggle's badge gives way to the items' own.
- **Phone select.** A native option cannot hold markup, so the badge is appended to its label:
  `Alerts (5)`, `Alerts (new)` for a dot. Tone is not shown there.
- **Screen readers.** A badge is read as a count after the name (`Alerts, 5`), never as part of it.

## Descriptions

An item's `description` is a sentence about the destination, shown as its tooltip on hover, focus
and long press, and read as its description. It never carries something the user must read to
choose.

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

`items` (`NavItem[]` with `group` and an optional `description`), `groups` (ordered
`{ id, label, collapsed? }`), `current`, `label` (the `<nav>`'s name, required), `collapsible`
(default false), `onnavigate(href)` (what the phone select
does on change; default `location.assign` — pass your router's `goto`).

## Don't

- Don't put it above the page as a tab strip — if a tab strip is right, use `Tabs` (see above).
- Don't nest a third level of navigation. If a section needs one, it is a section of its own.
- Don't duplicate an item that is already in the rail.
