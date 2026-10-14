# HelpTip

A small icon carrying a note as its tooltip. This is **how this system explains things**: detail lives
in a tooltip or a panel, never in an inline sentence under a control.

The note is the icon's accessible name, and it appears as a tooltip on hover **and on keyboard
focus** — the icon is a tab stop with its own focus ring, so a keyboard user can reach it.

## What the consumer provides

`text` (the note), `icon` (a Lucide component; `Info` by default — pass `CornerLeftUp` for
"inherited from", `TriangleAlert` for a warning), `tone` (`default` `ds-text-3`, or `warning`
`ds-warning-text`), `size` (px, default 13), `placement` (`top` | `bottom`), `class`.

Inside a form, pass the note to `Field tip` instead and the Field places this component for you,
beside the label, still describing the control.

## Don't

- Don't write the note as a sentence under the control. That is the rule this component exists to
  keep.
- Don't hide something a user must act on in a tooltip — that is a `Field error` or a toast.
