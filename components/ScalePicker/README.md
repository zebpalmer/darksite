# ScalePicker

Pick a stop on an ordinal scale: segments in scale order, each with a 3px bottom mark stripe, so
the row itself reads as the ramp. A radio group: one tab stop, ←/→ move and select (wrapping),
Home/End jump to the ends. `SeverityPicker` is this picker over the built-in `severityScale`; use
`ScalePicker` for a scale the app defines with `defineScale` (see "Custom scales" in
[`severity.md`](../../docs/severity.md)).

## States

- **selected** — the stop's `bg` and `ink`, with its mark as the border.
- **suggested** — a dashed border. Not applied; clicking or accepting applies it.
- **unknown** — the scale's unknown stop, after the ordered ones, with a **dashed** stripe. A
  dashed stripe is unknown; a dashed border is suggested.
- **idle** — `ds-bg-3` with the mark stripe at 55% opacity.

40px tall, 48 on touch.

## It responds to its own width, not the viewport

A container query on the picker, by the number of cells *n* it shows (stops under the ceiling,
plus unknown):

| Width of the picker | Layout |
|---|---|
| ≥ *n* × 104px | one row, key caps shown |
| below *n* × 104px | one row, key caps hidden |
| below *n* × 80px | two balanced rows: ceil(*n*/2) columns (4 + 4, 5 + 4, 3 + 2) |
| *n* ≥ 7, below ceil(*n*/2) × 80px | three rows: ceil(*n*/3) columns (3 + 3 + 3) |

Key caps go before names do; the key stays in the button's `title` and `aria-keyshortcuts`.
Names never truncate.

## What the consumer provides

`scale`, `value` (bindable; `null` = unset), `onchange(value)`, `suggested`, `max` (a ceiling —
stops above it are **hidden, not disabled**; the unknown stop is never above a ceiling),
`keycaps` (show 1–*n* and the unknown key, `0` by default; binding the keys is the page's job —
`scale.fromKey(key, max)` maps them), `counts` (per stop, for a bulk action), `columns` (`auto`
| a fixed number), `controlled` (a click only calls `onchange`, for a `value` the parent derives),
`label` (the group's name; default the scale's `name`), `id`, `aria-labelledby`,
`aria-describedby`, `class`.

In a `Field`, let the Field's label name it: pass `id={f.id}`, `aria-labelledby={f.labelId}` and
`aria-describedby={f.describedBy}`. A `<label for>` names only a single native control, so a group
needs the label's id instead.

## Don't

- Don't disable a stop the viewer may not set — remove it with `max`.
- Don't truncate the names to keep one row.
- Don't add a "None" segment; `null` is unset.
- Don't use it for more than nine ordered stops — that is a `Combobox`.
