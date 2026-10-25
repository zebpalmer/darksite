# PageHeader

The top of a page: 56px, the title in `page-title` (20/500), the count in `meta`, optional content
after the title (usually `Tabs`), and right-aligned actions. A `ds-border-subtle` bottom edge on
`ds-bg-1`. **No breadcrumbs, no hero** — an overview page opens with an `Intro` instead.

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

Content after the title — chips, a status — **wraps onto a further line under the title** when the
lead has no room for it beside the title, so a long title and two chips never widen a phone page.
The title keeps its one line and its ellipsis; the header grows to fit the second line. A count
that has no room beside the title leads that second line, so it stays readable. The header
still makes room in the steps below first, counting that content in, so it wraps only once the
actions are as compact as they go.

## Making room

When the title (and the count and anything after it) do not fit beside the actions on one line, the
header makes room in steps, at any width, and gives it back as the header widens:

1. The shell's header actions collapse to their icon button (as they always are on a phone).
2. The `actions` snippet is told `{ compact: true }`: render the icon form of its buttons there.

```svelte
<PageHeader title="Records" count={1284}>
  {#snippet actions({ compact })}
    {#if compact}
      <Button variant="icon" icon={Download} label="Export" />
    {:else}
      <Button variant="ghost" icon={Download}>Export</Button>
    {/if}
  {/snippet}
</PageHeader>
```

A snippet that ignores `compact` keeps its one form. On a header **narrower than 560px** (a phone),
when the title still does not fit beside the actions, the actions move to a second line,
right-aligned, and the title keeps the full first line. Actions still wider than the header wrap
onto a further right-aligned line rather than run past its edge. A title that fits keeps one line,
and the count still gives way before anything wraps. A title longer than a phone's whole width
still truncates; keep titles short.

The header takes every step it needs in one pass, each measured, so it reaches `compact` at any
width down to 320px, with 44px touch targets — including on a phone, where the shell's actions are
an icon button already and step 1 changes nothing on screen. Nothing in the header runs past the
page. Mount it with its actions as they will be; the steps are found again whenever the header,
its title or its actions change size.

## What the consumer provides

`title`, `count` (a number, localized — or preformatted text like "38 this week"), `level` (the
heading level, default 1), `mono` (the title is an identifier — a serial, a hash, a path, a
record number — and is set in mono with tabular figures, as identifiers are everywhere else),
`actions` snippet (search, Views, Sort, density, Filters; receives `{ compact }`), `sticky`
(sticks to the top of the scrolling pane at `--ds-z-sticky`), `class`, children (inline after the
title), `shellActions` (default true).

## The shell's header actions

Inside an `AppShell` with `headerActions`, a level-1 header renders those shell-wide controls ahead
of its own `actions` — the page's primary button stays right-most — and on phones, or when the
header lacks room, swaps them for an icon button that opens a full-width row under the bar (see the
`AppShell` card). The page writes nothing for this. `shellActions={false}` leaves them out of one
page's header. Either way a level-1 header claims them: only a page with no level-1 header gets
them in the TopBar instead.

## Don't

- Don't add breadcrumbs or a hero band; an overview page uses `Intro` in place of the PageHeader.
- Don't put the page's own padding around it.
- Don't let the title wrap.
