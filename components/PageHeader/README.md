# PageHeader

The top of a page: 56px, the title in `page-title` (20/500), the count in `meta`, optional content
after the title (usually `Tabs`), and right-aligned actions. A `ds-border-subtle` bottom edge on
`ds-bg-1`. **No breadcrumbs, no hero.**

## One header geometry everywhere

It is **always flush** — to the top of the pane and to both edges of the main column. A page that
lays out its own panes simply makes it the first child; in the shell's padded column it cancels
that padding (the layout publishes it as `--ds-pad-top` / `--ds-pad-x`) with negative margins, so
every page gets the same bar, the same full-width border and the same 20px title inset.

It also leaves the column's gap below itself, so the page's content starts where it would have
without a header.

Put it **first** on the page. Something that must sit above it bleeds the same way and sets
`--ds-pad-top: 0px` on the wrapper; a demo frame that must *not* bleed sets both variables to
`0px`.

The title keeps its width and truncates at the lead's edge; **the count is what gives way** on a
narrow header.

## What the consumer provides

`title`, `count` (a number, localized — or preformatted text like "38 this week"), `level` (the
heading level, default 1), `mono` (the title is an identifier — a serial, a hash, a path, a
record number — and is set in mono with tabular figures, as identifiers are everywhere else),
`actions` snippet (search, Views, Sort, density, Filters), `sticky`
(sticks to the top of the scrolling pane at `--ds-z-sticky`), `class`, children (inline after the
title).

## Don't

- Don't add breadcrumbs or a hero band.
- Don't put the page's own padding around it.
- Don't let the title wrap.
