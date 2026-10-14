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

Search focuses on `/`, except where the page has already claimed that key — a page that owns `/`
wins, because its search is the nearer one.

## What the consumer provides

`search` (a snippet, usually an `Input leading={Search}` with a `/` key cap), `actions` snippet
(right side), `variant` (`default` 48 | `slim` 40), `sticky`, `label`.

## Don't

- Don't put page-specific actions here.
- Don't stack a top bar and a section tab strip — pick one.
- Don't hide it on scroll. A persistent bar that disappears is worse than no bar.
