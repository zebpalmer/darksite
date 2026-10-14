# ActionBar

One row of actions fixed to the bottom of its pane: 56px (64 on touch), `ds-bg-2`, a `ds-border`
top edge.

**It never overlaps content.** It is the last, non-scrolling child of its pane — not an overlay.

## The layout contract

The pane is `display: flex; flex-direction: column` with a bounded height; the content above is
`flex: 1; min-height: 0; overflow: auto`; the ActionBar comes last. For a page-level bar, where
the whole page scrolls, pass `sticky` — it then sticks above `ds-chrome-bottom`, so the phone tab
bar never covers it.

While mounted it measures itself and publishes its height as `--ds-actionbar-space` on `<html>`,
so the `Toaster` stacks above it instead of over it.

## Composition

Primary action **right-most**. Put a `<span class="grow"></span>` between the left group and the
right group; `<span class="divider"></span>` draws a 1px, 24px-tall `ds-border` rule between
clusters. A long-lived undo lives here — not in a toast, which would expire.

## What the consumer provides

`sticky`, `label` (the toolbar's `aria-label`, "Actions" by default), `class`, children.

## Don't

- Don't float it over the content.
- Don't nest one inside a `Sheet` — a sheet has a `footer` snippet.
- Don't put two primaries in it.
