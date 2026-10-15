# Select

A native `<select>` in the control look, with a chevron. Native on purpose: every platform's own
picker, keyboard handling and screen-reader support come for free, and on a phone the system's own
sheet opens.

Use it for a single choice from a short or medium list in a form. For a long list to search, or to
create a value, use `Combobox`; for 2–7 options that should all be visible, `SegmentedControl`.

It takes the same `Field` contract as `Input`: `id`, `describedBy`, `invalid`.

## Behavior

- With nothing chosen, a first, unselectable "Choose…" option shows (`placeholder` renames it).
- `groups` render as `<optgroup>`s.
- 32px (44 on touch); `size="dense"` is 28 on a fine pointer.

## What the consumer provides

`options` (`{ value, label, disabled? }[]`) and/or `groups` (`{ label, options }[]`), `value`
(bindable), `placeholder`, `invalid`, `size` (`dense` | `default`), `describedBy`, `element` (a
bindable ref), `class`, and any other `<select>` attribute.

## Don't

- Don't use it for severities or a scale; those have pickers.
- Don't restyle the opened list; the platform draws it, which is the point.
