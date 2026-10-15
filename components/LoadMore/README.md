# LoadMore

The foot of a long `Table` or list ([`layout.md`](../../docs/layout.md), "Long lists"): a `meta`
line ("Showing 50 of 295") over a full-width secondary `Button` reading "Load more". No page
numbers, no "1–50 of 295" pager.

## Behavior

- The button takes its loading state ("Loading more") while `onLoadMore()` runs — it may return a
  promise — or while `loading` is true.
- New rows **append**. They never steal focus, except when the button was pressed from the
  keyboard: then, once the rows have arrived, `focusRow(index)` is called with the index of the
  first new row, so the next arrow key continues into them.
- When everything is shown the button goes and the meta line stays ("Showing 295 of 295").

## What the consumer provides

`shown` (rows loaded), `total` (when known), `hasMore` (default `shown < total`; pass it when the
total is unknown), `loading`, `onLoadMore()`, `focusRow(index)` (focus that row; for a `Table`, its
body row at that index), `label` (default "Load more"), `class`.

## Don't

- Don't use infinite scroll on a table; it makes the foot of the page unreachable. Infinite scroll
  is `JustifiedGrid`'s.
- Don't reset the list on load more. Changing the sort or a filter is what returns to the first
  page.
