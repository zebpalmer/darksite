# Stepper

A number nudged up and down: **− value +** in the `.ds-control` look, 32px (28 `dense`), 44px on a
coarse pointer, with the − and + buttons as square as the control is tall.

## Keyboard

The field is a `spinbutton` carrying `aria-valuenow`, `-valuemin` and `-valuemax`.

- ↑/↓ step by `step`; PageUp/PageDown take `bigStep` (ten steps by default).
- Home and End jump to `min` and `max` when they are set.
- A typed value is committed on Enter or when the field loses focus: it is clamped to the bounds
  and snapped to the step (`step={0.25}`: 1.3 becomes 1.25). Something that is not a number
  reverts; Esc abandons the edit.
- The − and + buttons are for the pointer and stay out of the tab order. Each disables at its
  bound.

## What the consumer provides

`value` (bindable), `min`, `max`, `step`, `bigStep`, `label` (required — the accessible name, or a
visible label with `hideLabel={false}`; inside a `Field`, pass the same label and leave it
hidden), `onchange(value)`, `size` (`dense` | `default`), `disabled`, `width` (the value field, CSS,
default `6ch`), `name`, `id`, `class`.

## Don't

- Don't use a Stepper for a wide range — a value of 1–1000 is an `Input`.
- Don't use it to pick one of a few named options; that is a `SegmentedControl`.
- Don't hide the bounds: if `max` matters, say it in a `Field tip`.
