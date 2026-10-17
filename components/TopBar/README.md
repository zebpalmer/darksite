# TopBar

An optional strip above the content column for the things that belong to **every** page in a
section: search, a global create action, a scope or filter selector that outlives the page.

`ds-bg-2` with a `ds-border-subtle` bottom edge. **48px** on content routes, or a slim **40px** on
`ds-bg-1` where it carries nothing but search.

## The test for what goes here

If a control is not relevant on every page of the section, it does not belong in the top bar — it
belongs in that page's `PageHeader` actions. A top bar that changes between sibling pages is a
header wearing the wrong hat, and it costs the user the one thing a persistent bar is for:
knowing where it will be.

## It sits outside the padded column

So `PageHeader` keeps its flush geometry underneath, and a sticky page header still sticks
directly below it. The shell publishes its height as `--ds-topbar-h` for panes sizing against it.

Search focuses on `/`, except while the user is typing or where the page has already claimed that
key — a page that owns `/` wins, because its search is the nearer one. It wins by handling the key
first (`preventDefault`), or by passing `searchKey={null}`. The key is the `focusShortcut`
attachment, which any other container can use.

A search that should share the line with each page's title, rather than take a row of its own, is
`AppShell`'s `headerActions` instead. On a page with no level-1 `PageHeader` — a map, a custom
work view — the shell shows those header actions here, ahead of the bar's own actions (on a phone,
as an icon button that opens a full-width row under the bar). Nothing to wire: the bar reads them
from the shell.

## Room

The actions always sit at the end of the bar, phones included. Short of room, `start` gives way
first: it shrinks and scrolls sideways, so a row of filter chips there never pushes the actions off
the bar. What is inside `start` keeps its own size; the cell does the scrolling.

## What the consumer provides

`start` snippet (a scope selector, a row of filter chips), `search` snippet (usually an `Input` with a `/` key cap),
`actions` snippet (right side), `variant` (`default` 48 | `slim` 40), `sticky`, `label`,
`searchKey` (default `/`; `null` hands the key to the page).

## Don't

- Don't put page-specific actions here.
- Don't stack a top bar and a section tab strip — pick one.
- Don't hide it on scroll. A persistent bar that disappears is worse than no bar.
