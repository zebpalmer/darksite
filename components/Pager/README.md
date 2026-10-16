# Pager

Page links for a list someone will **link to**: a public listing, search results, an archive.
**Newer** on the left, **"1–50 of 295"** in the middle, **Older** on the right.

Inside an app, a long list ends in `LoadMore` (see [`layout.md`](../../docs/layout.md), "Long
lists"): rows append and nothing else moves. A Pager is for the list whose pages must each have a
URL — to bookmark, share, open in a new tab, or be found by a search engine.

## Driven by the URL

Each end is a real link. Pass the current `url` (in SvelteKit, `page.url`): the Pager reads the page
from `param` (default `page`) and links to the same URL with the page before or after, keeping every
other parameter — filters and sort survive paging. Page 1 drops the parameter, so the first page
has one URL. `pageFromUrl(url, param)` gives the page to the load function that fetches it, and
`pageHref(url, page, param)` builds the same links elsewhere.

To own the URL entirely, pass `page` and `href(page)` instead.

## Geometry

Two secondary `Button`s with chevrons, the range between them in 13px `ds-text-3` with tabular
figures, 12px above and below. An end with nowhere to go **stays in place, disabled** (45%), so the
middle never shifts: it is a link with no `href` and `aria-disabled`. A screen reader hears the
range as "51 to 100 of 295", in a `nav` named "Pagination".

When the total is unknown (a cursor-paged feed), give `hasMore`; the range reads "51–100".

## What the consumer provides

`url`, `param`, `page`, `pageSize` (default 50), `total`, `hasMore`, `href(page)`, `newerLabel` /
`olderLabel` (default "Newer" / "Older"; "Previous" / "Next" for a list not ordered by time),
`label`, `class`. SvelteKit link options (`data-sveltekit-noscroll`) go on an ancestor.

```svelte
<Table {rows} {columns} rowKey={(r) => r.id} label="Entries" />
<Pager url={page.url} pageSize={50} total={data.total} />
```

## Don't

- Don't use it for a list inside an app; that is `LoadMore`.
- Don't add numbered page buttons; the range says where you are.
- Don't hide a disabled end; the other one would move.
