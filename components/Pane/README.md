# Pane

A titled block on a content page: a dashboard section, a block on a detail page. (A work view's
panes are a layout, not this — see `docs/layout.md`.)

`ds-bg-2`, a `ds-border-subtle` edge, `ds-radius-md`, no shadow.

- **Header** — 44px: the `title` in `card-title` (14/500), an optional `meta` (13px `ds-text-3`),
  an optional `tip` (a `HelpTip`), and an `end` snippet for one link or one secondary action.
  Sentence case.
- **Body** — unpadded, so a `Table` or a list sits flush: the Pane hands a Table its ground and its
  14px inset. `padded` gives prose or a form 14px.
- **Footer** — an optional snippet under a subtle edge, for a timestamp or a "View all".

## Collapsible

`collapsible` makes the title a disclosure: a button inside the heading with a 16px chevron (it
turns as the pane opens, over `ds-dur-fast`, and not at all under reduced motion), `aria-expanded`,
and `aria-controls` pointing at the body. Collapsed, the body and footer are hidden and the header
loses its bottom edge. `open` is bindable (default `true`); pass `open={false}` to start collapsed.

`collapseBelow` starts it collapsed when the **pane itself** is narrower than that many pixels as it
mounts — a secondary block that should fold away on a narrow column, without asking the viewport.
It is read once: after that the viewer's choice stands.

Use it for secondary blocks on a long content page (history, related records), not to hide the
thing the page is for. A `tip` and the `end` snippet stay outside the button.

## What the consumer provides

`title`, `meta`, `tip`, `level` (the heading level, default 2), `padded`, `collapsible`, `open`
(bindable), `collapseBelow`, `end`, `footer`, children, `class`.

## Don't

- Don't nest a Pane in a Pane.
- Don't give it a primary button; the page's primary action lives in `PageHeader`.
