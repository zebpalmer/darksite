# KeyCap

A `<kbd>` hotkey hint: 18px tall, 12px mono, a 2px bottom edge so it reads as a key.

Put one next to the control its key triggers — never as a standalone label. Every hotkey in the
system is visible this way.

## What the consumer provides

- `keys` — a hotkey token (`shift+enter`, `space`, `g`) or several alternatives. One formatter
  renders them (`⇧Enter`, `Space`, `g`); `separator` sits between alternatives (default ` / `).
- `hint` (default true) — a *hint* cap hides when the user turns key hints off
  (`<html data-hints="off">`) and on phones. Pass `false` for caps that **are** the content, as in
  a hotkey legend.
- `tone` — `default`, or `primary` for a cap sitting on a filled primary Button, where it switches
  to `ds-accent-key` with a `ds-accent-key-edge` lip and `ds-accent-contrast` text.
- `decorative` (default false) — `aria-hidden`, for a cap inside a control that already carries
  `aria-keyshortcuts`. `Button`, `Chip` and `SegmentedControl` all pass it.

## Don't

- Don't invent key names. They follow one hotkey token grammar, declared in one place.
- Don't draw a cap without also setting `aria-keyshortcuts` on the control it belongs to.
