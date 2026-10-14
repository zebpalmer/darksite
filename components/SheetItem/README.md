# SheetItem

One 44px row inside a `Sheet`, or any touch menu: an icon, a label, an optional trailing value or
check. A link when `href` is set, otherwise a button.

Hover is `ds-bg-4`. The icon is `ds-text-3`, and turns `ds-accent` when the row is the current
choice — which also sets `aria-current` (link) or `aria-pressed` (button) and adds a check.

## What the consumer provides

`label`, `icon` (a Lucide component at 18px), `href` **or** `onclick`, `current`, `trailing` (12px
`ds-text-3` at the right: a count, a value), `tone` (`default` | `danger`, which turns the label
and its icon `ds-danger-text`), `class`.

## Don't

- Don't shrink the row below 44px.
- Don't use it outside a sheet or touch menu — a desktop list row is a different thing.
