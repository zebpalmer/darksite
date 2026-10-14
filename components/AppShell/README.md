# AppShell

The application frame: a `NavRail` beside a content column that holds an optional `TopBar`, the
page, and whatever bottom chrome the page needs. Below `ds-bp-phone` the rail is replaced by a
`TabBar` and the column becomes the whole screen.

It is the one component allowed to ask about the viewport ([`layout.md`](../../docs/layout.md), "Breakpoints").

## What it owns

- **The grid:** `grid-template-columns: auto 1fr`, the rail sized by `ds-rail-w` or
  `ds-rail-w-expanded`, the column taking the rest. No maximum width.
- **The padding contract:** the padded column publishes `--ds-pad-top` and `--ds-pad-x` so
  `PageHeader` can cancel them and sit flush. A page that lays out its own panes sets both to
  `0px`.
- **`--ds-chrome-bottom`:** the height of fixed bottom chrome — the tab bar plus its safe-area
  inset on phones, `0px` on desktop. Pages pad by it; `Toaster` lifts above it.
- **`--ds-topbar-h`:** the top bar's height, for panes sizing themselves against it.
- **One `Toaster`**, mounted here and nowhere else.

## What the consumer provides

`items` (the single navigation list — see [`shell.md`](../../docs/shell.md)), `current` (the active id), `user` (for the
account block), `topBar` (a snippet, or omitted), `children` (the page), and `padded` (default
true; false hands the whole column to a work view).

## Don't

- Don't give the column a maximum width. Panes grow and grids add columns.
- Don't mount a second `Toaster`, or a second navigation list.
- Don't let a page reach past the shell to position itself against the viewport.
