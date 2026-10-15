# Input

A text input in the system's control look: 32px (44 on touch), `ds-bg-3`, a `ds-border` edge at
`ds-radius-sm`, 14px text.

The look itself is the global `.ds-control` class, so a bare `<select class="ds-control">` or
`<textarea class="ds-control">` gets the same control without a wrapper. A textarea grows
instead: `height: auto`, `min-height: 80px`, vertical resize only.

## States

Hover raises the border to `ds-border-strong`, focus to `ds-accent`, `aria-invalid="true"` to
`ds-danger`; disabled is 45% opacity. The focus *ring* is the global `:focus-visible` outline on
top of that.

## What the consumer provides

`value` (bindable), `type` (default `text`), `mono` (Geist Mono at 13px — paths, filenames,
hashes), `invalid`, `describedBy` (the ids that describe it; becomes `aria-describedby`), `size`
(`dense` 28 | `default` 32; `dense` applies to fine pointers only, so
touch keeps its 44px), `leading` (a Lucide icon inlaid at the left, which pads the text by 34px),
`trailing` (a snippet inlaid at the right — a `SourceBadge`, a revert button, a `/` key cap; set
`--trail-w` to reserve its width, default 120px), `element` (a bindable ref), `class`, and any
other `<input>` attribute or handler.

Inside a `Field`, spread the field's `{ id, describedBy, invalid }` onto it.

## Don't

- Don't set a font size on a touch control. One global rule forces 16px there, because iOS Safari
  zooms anything smaller and never zooms back.
- Don't use a `leading` icon as a button; it is `pointer-events: none`.
