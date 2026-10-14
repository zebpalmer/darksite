# JustifiedGrid

The image grid. Rows that fill the width exactly, images at **their own aspect ratio — no crop**,
landing near a target row height. Tiles are `ds-bg-3` at `ds-radius-sm` with a 6px gap.

Use it for an image gallery, a review queue, a contact sheet — anywhere the pictures are the
content and their shapes vary. For fixed-ratio media cards use `Grid` instead.

Keep the layout a pure function, separate from the component, and test it; the component should
only measure its width and render what the function returns. The break is greedy: add images to the row until scaling it to the full
width would make it shorter than the target, then close the row. The **last row is not stretched**
— it keeps the target height, left-aligned — unless it already overfills, and no row grows past
1.6× the target, so a lone panorama cannot blow up the page.

Phones get rows at 70% of the target height, so two or three images share one.

It also carries the infinite-scroll sentinel: an intersection observer with an 800px root margin
calls `onLoadMore` before the user reaches the end.

## What the consumer provides

`items`, `key(item)` (a stable key), `aspect(item)` (width ÷ height; fall back to square on
unknown dimensions and clamp extreme strips), `density`
(a target row height), `rowHeight` (overrides it), `gap`, `tile` snippet — it receives
`(item, index, { width, height })`, the box the tile must fill — `hasMore`, `loadingMore`,
`onLoadMore`, `label`, `onLayout(rows)` (the current layout after every change, for a keyboard
cursor that moves up and down a row).

## Don't

- Don't crop to a fixed ratio. That is what `Grid` is for.
- Don't stretch the last row.
