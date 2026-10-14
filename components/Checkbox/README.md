# Checkbox

A yes/no choice in a form, or a row's selection in a `Table`: a native `<input type="checkbox">` in
the system's look, so forms, labels and screen readers work without help.

16px box at `ds-radius-xs`, `ds-bg-3` with a `ds-border-strong` edge. Checked and mixed fill with
`ds-accent` and draw the tick or dash in `ds-accent-contrast`. The **hit area is 32px** on desktop
and **44px** on touch, while the box stays 16px — the whole label is the target.

## What the consumer provides

`label` (required — the visible label, or the accessible name with `hideLabel`), `checked`
(bindable: `true` | `false` | `'mixed'`), `hideLabel` (for a selection column), `name`, `value`,
`disabled` (45%), `invalid` (a `ds-danger` edge and `aria-invalid`), `onchange(checked, event)`,
`onclick`, `children` (replaces the visible label text).

**Mixed** sets the native `indeterminate` property and `aria-checked="mixed"`, and draws the dash
before hydration too. Clicking a mixed box checks it.

## Don't

- Don't use a Checkbox for a setting that applies immediately — that is a `Switch`.
- Don't style a bare global `input` and hope checkboxes survive it.
- Don't drop the label; `hideLabel` still needs one for screen readers.
