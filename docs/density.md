# Density and touch

Desktop defaults to dense: 32px controls, 28px chips, 13px meta, grids at M.

**Touch is 44px, always.** Under `(pointer: coarse)` every button, chip, tab and list row becomes
`ds-h-touch` with an 8px gap between chips — **whatever `size` the caller passed**, `dense`
included. The primitives do this themselves; do not override it.

When you add a size variant to a primitive, make its coarse rule match the size selector too
(`.ds-btn[data-size]`, not a bare `.ds-btn`). Otherwise the `[data-size]` rule out-ranks the bare
touch rule, and the control silently stays 22–28px on a phone.

Deliberate exceptions, each for a reason: a `SegmentedControl` option is 38px inside the 2px
padded strip (44 outer, 44 min wide); a `Chip`'s × is 32px; a pill `Tabs` is 40px; an icon
button inlaid in a 44px field is 36px.

**Touch text controls are 16px.** iOS Safari zooms the page when a control under 16px takes focus
and leaves it zoomed wider than the screen. One unlayered `(pointer: coarse)` rule forces
`max(16px, 1em)` on every text `input`, `textarea`, `select` and `contenteditable`, so no
per-component size is needed. Never reach for `maximum-scale` or `user-scalable=no` instead.

**Nothing widens a phone page.** Body text carries `overflow-wrap: break-word`; a long word inside
a flex or grid item still needs `min-width: 0` plus `overflow-wrap: anywhere` on that item. Check
`document.documentElement.scrollWidth <= innerWidth` at 320, 375 and 390 when you add a page.

**Grid density is a per-user preference.** S / M / L map to a card min-width of 180 / 232 / 320px,
M by default; `Grid` reads it. Phones force thumbnail grids 2-up, but a grid given an explicit
`min` of 260px or more (an `EntityCard` row) stays one per line instead.

**Sidebars only where there is a job** — a filter panel, a work queue. Everything else is full
width.
