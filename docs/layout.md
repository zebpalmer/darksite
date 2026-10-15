# Layout

Three page archetypes, one scroll rule, and a short list of breakpoints. Most layout bugs in a
dense tool come from a page inventing its own answer to one of these.

## The three archetypes

**1. Content page.** The shell's column supplies the padding (16px on phones, 20px top / 24px
sides from `ds-bp-phone`) and **the document scrolls**. `PageHeader` first, then the content. This
is the default: settings, detail pages, lists, anything that is just a page.

**2. Work view.** The page lays out its own panes, opts out of the column's padding and **owns its
own scrolling** — the document does not scroll at all on desktop. A queue beside a card, a filter
rail beside a grid, anything with an `ActionBar` pinned to the bottom of a pane. This is the
archetype a dense tool is actually built from.

**3. Focused page.** One centered column, capped at a readable width, vertically centered when it is
short: sign-in, a setup gate, a fatal error. No rail, no header, no actions bar — just the one
thing being asked.

## Scroll ownership

**Exactly one element owns a scroll.** Decide which, per archetype, and make every ancestor
non-scrolling.

A pane that scrolls is always this shape:

```css
.pane   { display: flex; flex-direction: column; min-height: 0 }
.body   { flex: 1; min-height: 0; overflow: auto }   /* min-height: 0 is not optional */
.footer { flex: none }                                /* ActionBar */
```

`min-height: 0` on the scrolling child is the single most-forgotten line in flex layout: without
it the child refuses to shrink below its content, the pane grows instead, and the scroll silently
moves to the document.

On desktop a **work view locks the document** so its panes can be sized by the frame instead of
fighting the page. On phones it does not — there, let the document scroll and let the panes stack.

**Build a work view with `WorkView`**, which does all of this: inside `AppShell` it locks the shell
to the viewport from 768px, zeroes the column's padding, and fills what the `Banner` and `TopBar`
leave, with the `PageHeader` on top, a rail beside the results, the results as the one scroller
and the `ActionBar` under them. A page should never compute its pane heights from `--ds-topbar-h`
or cancel padding with negative margins:

```svelte
<WorkView label="Records">
  {#snippet header()}<PageHeader title="Records" count={total} />{/snippet}
  {#snippet rail()}<FilterRail {sections} bind:value />{/snippet}
  {#snippet top()}<ActiveFilters {sections} bind:value />{/snippet}
  <Table {rows} {columns} rowKey={(r) => r.id} label="Records" />
  {#snippet footer()}<ActionBar>…</ActionBar>{/snippet}
</WorkView>
```

A work view with a different shape (a queue beside a card) uses the pane pattern above inside the
WorkView's body.

## Panes and sidebars

**A sidebar needs a job.** A filter panel, a work queue, a secondary nav. Everything else is full
width. A sidebar that exists to balance the page is decoration, and this system has none.

- **Filter or queue rail:** 240–280px, its own scroll, collapsible, and it must collapse rather
  than shrink — a 140px filter panel is worse than none.
- **Secondary nav:** 200px, sticky, its own scroll (`SideNav`).
- Below `ds-bp-phone` every sidebar becomes a `Sheet`. No exceptions — a 320px phone cannot show
  two columns of anything useful.

## Width

**Nothing caps the page width.** Panes grow, grids add columns, tables get more room. The two
exceptions are **prose** and **forms**, which cap around 60–70 characters and 520px respectively,
because a 2000px-wide input is unusable.

This is why `Grid` is container-driven: a grid beside an open filter rail should show fewer
columns than the same grid with the rail closed, and no viewport breakpoint can know that.

## Breakpoints

Four, and they are tokens: `ds-bp-compact` 520 · `ds-bp-phone` 768 · `ds-bp-wide` 1200 ·
`ds-bp-rail` 1440.

**The rule that matters: components use container queries, only the shell uses viewport
breakpoints.** A component does not know how wide the viewport is and should not care — it knows
how much room *it* was given. `SeverityPicker` folds its rows on its own width;
`Grid` chooses columns on its own width. The shell is the one thing entitled to ask about the
viewport, because it is the thing laying out the viewport.

The exception is **touch**, which is a capability and not a width: `(pointer: coarse)` is what
raises every control to 44px, independently of `ds-bp-phone`. A tablet gets touch sizing at
desktop widths, which is correct.

## Long lists

**Tables and lists load a page and offer "Load more"** — no page numbers, no "1–50 of 295" footer.

- The list's foot is `LoadMore`: a full-width secondary `Button` reading "Load more", beside a
  `meta` line ("Showing 50 of 295"). While it loads, the button takes its loading state ("Loading more").
- New rows **append**. They never steal focus: keyboard focus stays on whatever row had it. When the
  button itself was activated from the keyboard, focus moves to the first new row, so the next
  arrow key continues into the new rows.
- **Infinite scroll is for image grids only** (`JustifiedGrid`), where a sentinel loads the next
  page as you approach the end. On a table it would make the foot of the page unreachable.
- **Selecting across unloaded rows is a second step.** The header checkbox selects the *loaded*
  rows; the `ActionBar` then offers "Select all 295". Choosing it switches the selection from a list
  of keys to "everything matching the current filter", which the consumer must handle as its own
  mode. Changing the filter or sort clears it.
- Changing the sort or a filter returns to the first page.

## The padding contract

The shell's padded column publishes its own padding as `--ds-pad-top` and `--ds-pad-x`.
`PageHeader` cancels it with negative margins so it stays flush to the column edges, and anything
else that must bleed full-width does the same. A page that lays out its own panes sets both to
`0px` and takes over.

This is one variable pair rather than a prop drilled through every page, so a page added later
inherits the right geometry by default instead of by remembering to.
