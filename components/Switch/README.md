# Switch

A setting that **takes effect immediately**, with no Save. A native checkbox with `role="switch"`:
a 32×18 track, `ds-bg-5` off and `ds-accent` on, with a 12px thumb.

Color is never the only signal: the thumb's **position** carries the state, and the state is
**written** beside the track ("On" / "Off") unless the label already says it (`stateText={false}`).

## What the consumer provides

`label`, `checked` (bindable), `hideLabel`, `stateText` (default true), `onText` / `offText`,
`name`, `disabled`, `onchange(checked)`.

## Don't

- Don't use a Switch for something that needs Save — that is a `Checkbox`.
- Don't hide both the label and the state text.
