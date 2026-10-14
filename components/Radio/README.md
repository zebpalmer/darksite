# Radio

One choice from a set, inside a form, when a `SegmentedControl` would not fit — more than seven
options, or labels too long for segments. A native `<input type="radio">`: the Checkbox geometry,
round, with an 8px `ds-accent-contrast` dot on a `ds-accent` fill.

## What the consumer provides

`name` (shared by the set), `value`, `group` (bindable — the set's selected value), `label`,
`hideLabel`, `disabled`, `invalid` (a danger edge), `onchange(value)`.

Put the set in a `<fieldset>` with a `<legend>`. A radio has no invalid state of its own: when the
set is in error, the fieldset carries the message and every radio takes `invalid`.

## Don't

- Don't use radios for two to seven short options — that is a `SegmentedControl`.
- Don't use a single radio; a lone yes/no is a `Checkbox`.
