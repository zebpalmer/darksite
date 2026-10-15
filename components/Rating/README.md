# Rating

A star rating from 1 to `max` (5 by default). Whole stars only.

## Input

A **radio group**: one tab stop, on the current star (the first when unrated).

- ←/→ (and ↑/↓) step by one; Home and End jump to 1 and `max`.
- Delete or Backspace clears; choosing the current star again clears it too. `clearLabel` adds an
  explicit ghost `Clear` button beside the stars while something is rated. `clearable={false}`
  turns clearing off.
- Hover previews the value. Stars are 32px (24 `dense`), **44px each on a coarse pointer**.
- Filled stars are `ds-accent`, empty ones `ds-text-3`. Each star is named "1 star", "2 stars"…;
  the group is named by `label`.

## Display

`readonly` draws the stars as one image named "Quality: 4 of 5 stars" (or "Not rated"), with no
buttons and no hover. `showValue` adds a `4/5` readout in `meta` `ds-text-3`.

## What the consumer provides

`value` (bindable; `null` is unrated), `max`, `label` (required), `onchange(value)`, `readonly`,
`disabled`, `clearable`, `clearLabel`, `size` (`dense` | `default`), `showValue`, `class`.

## Don't

- Don't use stars for a severity or a priority — those are ordered scales with names
  (`SeverityPicker`, `SegmentedControl`).
- Don't use a rating as a filter control; filter with chips ("4 stars and up").
- Don't show half stars in an input; a display of an average should say the number too.
