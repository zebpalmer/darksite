# SearchPalette

One search for a whole site: a modal with a large field, results grouped by kind under headings,
scope chips with counts, and the keyboard. For a product with several kinds of thing to find —
people, records, docs — behind one box. Picking from a list inside a form is a `Combobox`.

```svelte
<script lang="ts">
  import { SearchPalette, searchShortcut, type SearchFn } from 'darksite';

  let open = $state(false);
  const search: SearchFn = async (query, signal) => {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal });
    return res.json(); // [{ id: 'people', label: 'People', items: [...], total: 4 }, ...]
  };
  $effect(() => searchShortcut(() => (open = true)));   // /, ⌘K and Ctrl+K
</script>

<SearchPalette bind:open {search} placeholder="Search people, records and docs">
  {#snippet empty()}<a href="/guides/start">Getting started</a>{/snippet}
</SearchPalette>
```

## Layout

- **Desktop:** centered near the top (10vh down), 640px wide, at most 70% of the viewport tall. The
  field and the chips stay put; the results scroll under them. Key hints along the foot
  (↑ ↓ move, Enter open, Esc close) follow the viewer's hint preference.
- **Phones** (under 768px): the whole screen, 44px rows, a close button beside the field, no key
  hints. A modal may use the viewport, so this is a viewport rule.
- **The field** is 16px, so iOS does not zoom it.

## Behavior

- **A modal.** A native `<dialog>` in the top layer and in the modal stack (`modals`), like
  `Dialog`: focus stays inside, the page cannot scroll, Esc or a press on the scrim closes it, and
  focus returns to what opened it. Reopened, it keeps the last query, selected, so typing replaces it.
- **A combobox.** The field is a WAI-ARIA 1.2 combobox: focus stays in it, the results are
  `role="option"` rows in one `role="listbox"`, a `role="group"` per kind named by its heading, and
  the active row is `aria-activedescendant`. ↑/↓ move across the groups and wrap; the first row is
  active as results arrive, so Enter opens the best match. The count of results is announced.
- **Real links.** Every row is an `<a href>`, so a click goes through the router, and a middle
  click, ⌘/Ctrl-click, ⌘/Ctrl+Enter or ⇧Enter opens it in a new tab or window and leaves the palette
  open. A plain click on any link inside — a row, or one in `empty` — closes it.
- **Scopes.** With two groups or more, a row of chips reads "All 31 · People 4 · Records 23 · Docs
  4" (each group's `total`, or its item count). Under All each group shows `limit` rows (default 5)
  and a group with more offers "All 23" beside its heading, which scopes to it, as its chip does. A
  scope shows every item its group returned, so return more than `limit` for a group whose scope
  should show more.
- **Matches** are marked in each title (the first case-insensitive match of the query).
- **Rows:** a leading icon (`icon`), a small colored dot (`dot`, a role name such as `accent` or
  `success`), or the `leading` snippet; the title; the muted `meta` at the end.
- **Searching.** `search(query, signal)` runs `debounce` ms (default 120) after the last keystroke,
  and a newer query aborts the older one's `signal`, so pass it to `fetch`. A search that takes over
  300ms shows "Searching…" and a spinner; a quicker one shows nothing in between, and the earlier
  results stay until the new ones arrive. A search that throws shows "Search failed. Try again.";
  one that finds nothing shows `No results for "…"`.

## Opening it: the search trigger

The palette has no trigger of its own; the page opens it.

- **In the bar:** a ghost Button with the key cap, in `TopNav`'s `actions` (or a `TopBar`):

  ```svelte
  <Button variant="ghost" icon={Search} keycap="meta+k" onclick={() => (open = true)}>Search</Button>
  ```

  On a phone, where key caps hide, the same Button reads "Search"; an icon Button
  (`variant="icon" label="Search"`) fits a crowded bar.
- **On an overview page:** a large field-shaped button under the `Intro` — the system's own control
  look (`ds-control`) on a `<button>`, laid out as a field:

  ```svelte
  <button type="button" class="ds-control find" onclick={() => (open = true)}>
    <Search size={16} aria-hidden="true" />
    <span>Search people, records and docs</span>
    <KeyCap keys="meta+k" decorative />
  </button>
  <!-- .find { display: flex; align-items: center; gap: 8px; height: var(--ds-h-comfy);
             color: var(--ds-text-3); text-align: start; cursor: pointer } -->
  ```

  It is a button, not an input: typing into it would not search.
- **The keys:** `searchShortcut(open, keys?)` calls `open` on `/`, ⌘K and Ctrl+K (`SEARCH_KEYS`)
  from anywhere on the page. It stands aside while the user types in a field, while a modal is open,
  and for a press already handled. Give `/` to one owner: if the shell's `headerActions` already
  focus a search on `/`, pass `['meta+k', 'ctrl+k']`.

## What the consumer provides

- `search(query, signal)` → `SearchGroup[]` or a promise of them. `SearchGroup` is `{ id, label,
  items, total? }`; `SearchResult` is `{ id, title, href, meta?, icon?, dot?, group? }` (`group` is
  filled in from its group when left out). Empty groups are left out.
- `open` and `query` (bindable), `label` (default "Search"; the dialog's and the field's name),
  `placeholder`, `limit` (default 5), `debounce` (default 120), `empty` snippet (what shows before
  anything is typed: shortcuts, recent pages), `leading` snippet (`(result)`: a row's leading mark),
  `onselect(result)` (a row was chosen: keep a recent list), `class`. The words come from `strings`.

## Don't

- Don't use it to pick a value in a form — that is a `Combobox`.
- Don't put actions (buttons that do something) in the results; every row goes somewhere.
- Don't open it on a bare letter key; `/` and ⌘K are the conventions.
- Don't give `/` two owners on one page.
