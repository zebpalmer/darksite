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

## What the consumer provides

`title`, `meta`, `tip`, `level` (the heading level, default 2), `padded`, `end`, `footer`,
children, `class`.

## Don't

- Don't nest a Pane in a Pane.
- Don't give it a primary button; the page's primary action lives in `PageHeader`.
