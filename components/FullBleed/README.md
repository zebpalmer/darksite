# FullBleed

A page that takes the whole content column: a map, a canvas, a diagram. The sixth page type in
[`layout.md`](../../docs/layout.md).

Inside `AppShell`, a mounted `FullBleed` removes the column's padding and the footer and locks the
shell to the viewport at every width, so the page fills exactly what the navigation, `Banner` and
`TopBar` leave — no height arithmetic in the page. It is `position: relative`, so overlay panels
(a legend, a filter pane, a detail card) go inside it with absolute positioning.

## What the consumer provides

`label` (names the region), `class`, children (the map and its overlays).

## Don't

- Don't scroll the document on a full-bleed page; the map pans.
- Don't put a `PageHeader` above it; a title belongs in an overlay panel or the browser's tab.
