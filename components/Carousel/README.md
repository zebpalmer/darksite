# Carousel

A titled **horizontal row** of tiles — "Recent", "Flagged for review" — that scrolls sideways
instead of wrapping. A heading, an optional count and "See all" link, then one scroll-snap track.
Usually a row of `Card`s; any tile works.

It is not a slideshow: nothing rotates on its own, and there is no "slide 3 of 5". Use it for a
preview of a longer list that lives on its own page, several to a page. For the list itself, use
`Grid`.

## Tile width follows Grid density

`density` `s` / `m` / `l` is a tile width of 180 / 232 / 320px — the same numbers as `Grid` — and
without it the row reads `--ds-grid-min`, so the viewer's density preference applies to rows and
grids alike. `min` (px) overrides both. A track narrower than **520px** (a phone, or a narrow pane)
shows a little over two tiles, so the next one peeks in and says the row scrolls. Container
queries only; the row never asks about the viewport.

Gap is 14px, the `Grid` column gap. Tiles snap to their start edge.

## Keyboard: one stop per row

A home page with six rows of twenty tiles would be 120 tab stops, so the track holds **one tile in
the tab order** with a roving tabindex, in the manner of the WAI-ARIA composite widgets (a toolbar or
listbox) rather than the APG carousel, which is for rotating slides:

- **Tab** lands on the current tile's first control — the first tile until the user moves — and
  walks that tile's other controls (a favorite button, a menu).
- **← / →** move to the previous / next tile and scroll it into view; **Home / End** jump to the
  ends. The row remembers the tile it was on.
- **Tab** past the tile's last control leaves the row.

A control that appears in a tile later joins the order the same way. A track of static tiles (no links) becomes focusable itself, and
the arrow keys scroll it a page at a time.

Screen readers get a `region` named by the heading, holding a `list` of `listitem`s.

## Previous and next buttons

Round 32px buttons over the track's edges, centered on a 16:9 thumbnail, for a mouse that cannot
scroll sideways. Hidden at rest, shown on hover and while focus is in the row, and only when there
is somewhere to go. **Gone on touch screens** (`(hover: none), (pointer: coarse)`), where swiping is
native. They are a pointer affordance only — out of the tab order and hidden from assistive
technology, because the arrow keys already do the job — and they page by 90% of the track width.

## States

- **Loading** — `loading` shows `skeletonCount` (default 6) card skeletons in the tile slots, with
  one "Loading" status.
- **Empty** — with an `empty` snippet the row keeps its heading and shows the snippet (one short
  sentence in `ds-text-3`); without one, an empty row **renders nothing**, which is what a page of
  optional rows wants.

## What the consumer provides

`items`, `key(item)`, `tile` snippet — `(item, index)` — `title`, `level` (heading level, `2` by
default or `3`), `count` (shown in `meta` beside the title), `href` (the "See all" link) and
`seeAllLabel` ("See all"), `label` (the list's accessible name, default `title`), `density`, `min`,
`loading`, `skeletonCount`, `empty` snippet, `actions` snippet (beside "See all"), `class`.

## Don't

- Don't auto-advance a row. Nothing moves unless the user moves it.
- Don't use it as the only way to reach a long list — link "See all" to a `Grid` page.
- Don't size tiles from the viewport; set `density` or `--ds-grid-min`.
