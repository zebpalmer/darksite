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
