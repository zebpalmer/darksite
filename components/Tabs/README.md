# Tabs

Sections of one thing, with their counts inline — "Queue 12 · Needs severity 3 · Failed 3". No badges
on badges.

## Two modes, chosen by the data

- **links** — every tab has an `href`: a `<nav>` of links with `aria-current="page"` on the active
  one. Use it for route sections, including section navigation across a few sibling data views
  (the test is in [`which-primitive.md`](../../docs/which-primitive.md)).
- **tabs** — no hrefs: a WAI-ARIA tablist (←/→ move and select, one tab stop). Render the panel
  yourself with `id={panelId(idPrefix, value)}` and `aria-labelledby={tabId(idPrefix, value)}`
  from the exported helpers. Pass the same `idPrefix` to `Tabs`; without one, its ids are unique
  to the instance, so two tab sets on a page never collide, but a panel cannot name its tab.

## Variants

- **`underline`** (default) — 40px tall, active in `ds-text-1` under a 2px `ds-accent` rule, the
  rest `ds-text-2`.
- **`pill`** — a segmented strip: a `ds-bg-2` container with a `ds-border-subtle` edge, tabs 28px
  (40 on touch), the active one on `ds-bg-4`. Use it inside a dense work header.

`full` stretches the tabs to fill the row, which is how a phone gets a 3- or 4-up strip; a cell
never shrinks below its content, so a large count is not clipped.

## What the consumer provides

`tabs` — `{ value, label, count?, tone?: 'danger' | 'warning', href?, disabled? }[]` — plus
`value` (bindable), `onchange(value)`, `label` (the `aria-label`), `idPrefix`, `variant`, `full`,
`class`. `tone` colors the **count** only: `danger` for Failed, `warning` for a lane that needs
attention.

## Don't

- Don't mix hrefs and handlers; the mode is all-or-nothing.
- Don't use Tabs for mutually exclusive *settings* — that is a `SegmentedControl`.
