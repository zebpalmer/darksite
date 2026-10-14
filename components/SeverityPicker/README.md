# SeverityPicker

The severity variant of `SegmentedControl`: segments in scale order, each with a 3px bottom mark
stripe, so the row itself reads as the ramp. A radio group (←/→ move and select).

## States

- **selected** — the stop's `-bg` and `-ink`, with its mark as the border.
- **suggested** — a dashed mark border. Not applied; clicking or accepting applies it.
- **idle** — `ds-bg-3` with the mark stripe at 55% opacity.

40px tall, 48 on touch.

## It responds to its own width, not the viewport

A container query on the picker: when the five names no longer fit on one row it folds to a
two-row grid rather than truncating them, and key caps hide before names do — a name the user
cannot read is worse than a shortcut they have to hover for. The key stays in the button's `title`
and in `aria-keyshortcuts` either way.

## What the consumer provides

`value` (bindable; `null` = unset, which is how a fail-closed default should read),
`onchange(severity)`, `suggested`, `max` (a ceiling — stops above it are **hidden, not disabled**,
for a viewer who may not assign them), `keycaps`, `counts` (per stop, for a bulk action),
`columns` (`auto` | `5` | `3`), `controlled` (the picker keeps no click of its own: it shows
`value`, and a click only calls `onchange` — for a `value` the parent derives), `label`, `class`.

## Don't

- Don't disable a stop the viewer may not set — remove it.
- Don't truncate the names to keep one row.
- Don't add a "None" segment; `null` is unset.
