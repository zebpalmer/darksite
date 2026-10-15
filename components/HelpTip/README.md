# HelpTip

A small icon carrying a note as its tooltip. This is **how this system explains things**: detail lives
in a tooltip or a panel, never in an inline sentence under a control.

The icon is a button described by its note (`role="tooltip"` and `aria-describedby`), so a screen
reader reads the note with it. The note shows on hover, on focus — by keyboard or by a tap — and a
click or tap toggles it; Esc hides it. The icon keeps its drawn size while its hit area is 24px,
and 44px on a touch screen, and the note is placed beside it and kept inside the viewport.

## What the consumer provides

`text` (the note), `label` (the button's name, default "More information"), `icon` (a Lucide component; `Info` by default — pass `CornerLeftUp` for
"inherited from", `TriangleAlert` for a warning), `tone` (`default` `ds-text-3`, or `warning`
`ds-warning-text`), `size` (the icon's px, default 13), `placement` (`top` | `bottom`), `class`.

Inside a form, pass the note to `Field tip` instead and the Field places this component for you,
beside the label, still describing the control.

## Don't

- Don't write the note as a sentence under the control. That is the rule this component exists to
  keep.
- Don't hide something a user must act on in a tooltip — that is a `Field error` or a toast.
