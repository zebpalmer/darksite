# WorkView

The work-view frame ([`layout.md`](../../docs/layout.md), "The three archetypes"): a `PageHeader`
on top, a rail beside the results (a `FilterRail`, a work queue), the results scrolling on their
own, and an `ActionBar` pinned under them. It sizes itself, so a page never computes pane heights
from the shell's chrome or cancels padding with negative margins.

```svelte
<WorkView label="Records">
  {#snippet header()}<PageHeader title="Records" count={total} />{/snippet}
  {#snippet rail()}<FilterRail {sections} bind:value onchange={sync} />{/snippet}
  {#snippet top()}<ActiveFilters {sections} bind:value onchange={sync} />{/snippet}
  <Table {rows} {columns} rowKey={(r) => r.id} label="Records" selectable bind:selected />
  {#snippet footer()}
    <ActionBar label="Bulk actions">…</ActionBar>
  {/snippet}
</WorkView>
```

## How it sizes

- **Inside `AppShell`, from 768px:** while a WorkView is mounted the shell locks to the viewport
  (`100dvh`, no document scroll) and the content column's padding drops to zero, so the
  `PageHeader` is flush with no negative margins. The WorkView fills whatever the `Banner` and
  `TopBar` leave — whatever their heights, with no measuring — using flex and `min-height: 0` all
  the way down. A route that renders a WorkView needs no `padded={false}`.
- **The one scroller** is the results body. A `Table` placed directly in it becomes the scroller
  itself, so its header sticks; anything else (a `Grid`, a list) scrolls inside the body.
- **The rail** stretches to the full height beside the results and keeps its own scroll; the
  `FilterRail` collapses to its 44px strip rather than shrinking.
- **`top`** sits above the results and does not scroll: `ActiveFilters`, a view-level notice. Empty,
  it takes no room.
- **`footer`** is the last, non-scrolling child: the `ActionBar`. It never overlaps a row.
- **Below 768px** the document scrolls instead, as `layout.md` says: the rail is the `FilterRail`'s
  own "Filters" button above the results, the results flow at their natural height, and the footer
  sticks above the tab bar (`--ds-chrome-bottom`). This switch is the shell's — the viewport, at
  `ds-bp-phone` — because it is where the shell changes who owns the scroll, the same switch
  `FilterRail` makes.
- **Outside `AppShell`**, give it a height: `--ds-workview-h: 100dvh`, or a flex parent with
  `min-height: 0`.

## What the consumer provides

`header` snippet (a `PageHeader`), `rail` snippet, `top` snippet, children (the results), `footer`
snippet (an `ActionBar`), `label` (names the results region for assistive technology), `class`.

## Don't

- Don't compute pane heights from `--ds-topbar-h` and friends in a page; use this.
- Don't wrap the `Table` in another scrolling element inside the body; its header stops sticking.
- Don't put a WorkView in a padded content page's flow beside other content — it is the page.
- Don't nest WorkViews.
