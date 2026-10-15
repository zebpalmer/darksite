# Combobox

Pick from many, or create. The organization, person and label pickers, and the system's one typeahead.

A WAI-ARIA 1.2 combobox: the input owns focus, rows are `role="option"` in a `role="listbox"`, and
the active row is `aria-activedescendant`. ↑/↓ move (wrapping), Enter picks the active row,
**⇧Enter creates**, Esc closes, Tab closes. Esc is swallowed **only** while the list is open, so
the page's own Esc still works when it is closed.

## The create row

Set `oncreate` and a `Create "…"` row appears **always last**, under a separator, in
`ds-accent-text`, bound to ⇧Enter. `createLabel(text)` words it.

## What the consumer provides

- `items` — `{ value, label, meta?, disabled? }[]`, each `value` unique (it keys the rows). `meta` is the muted right-hand note (a count,
  a kind).
- `value` (bindable input text), `onselect(item)`, `clearOnSelect` (default true — the text clears
  for the next pick, which is what a token picker wants; set false for a single value and the text
  becomes the label).
- `oninput(text)` with `filter={false}` and `loading` for server-side search: feed the results
  back as `items`.
- `placeholder`, `label`, `id` / `describedBy` / `invalid` (from `Field`), `disabled`, `size`,
  `openOnFocus` (default false), `emptyText`, `element` (a bindable ref), `trailing` snippet
  (inside the right edge, before the chevron), `class`.

## Don't

- Don't build another typeahead. This is the one.
- Don't put the create row anywhere but last.
- Don't swallow Esc when the list is closed.
