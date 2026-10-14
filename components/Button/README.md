# Button

Every clickable action that is not a chip or a nav link.

## When to use which variant

- **`primary`** — filled `ds-accent` with `ds-accent-contrast` text at weight 500. **One per
  view, right-most.** The action the screen exists for.
- **`secondary`** (the default) — `ds-bg-4` with a `ds-border-strong` edge. The alternative
  standing next to the primary.
- **`ghost`** — transparent, `ds-text-2`. A frequent low-risk toolbar action; pair it with a
  `keycap` on desktop.
- **`danger`** — ghost in `ds-danger-text`, hovering onto `ds-danger-tint`. Irreversible, and
  **always confirmed by a `Dialog`**.
- **`danger-solid`** — filled `ds-danger` with `ds-danger-contrast` text at weight 500. Only ever
  the confirm button *inside* that Dialog.
- **`icon`** — a square ghost. `label` is **required**: it becomes both the `aria-label` and the
  `title`.

## Sizes

`dense` 28 · `default` 32 · `comfy` 36 · `touch` 44. A coarse pointer gets 44px whatever you
passed — the coarse rule matches `[data-size]` so it out-ranks the size variants.

## What the consumer provides

`variant`, `size`, `icon` / `iconEnd` (Lucide components), `label` (the accessible name for an
icon button, or the text when there are no children), `loading` + `loadingLabel` (a spinner and an
"-ing" verb: "Saving"), `keycap` (a hotkey token or list — it also sets `aria-keyshortcuts`),
`href` (renders an `<a>`), `type` (default `button`), `disabled`, `pressed` (a toggle, via
`aria-pressed`), `full` (100% width), `class`, children (the label), and any other attribute or
handler, spread onto the element.

## Don't

- Don't put two primaries in one view.
- Don't use `danger-solid` outside a Dialog.
- Don't ship an `icon` button without `label`.
- Don't disable a button to explain a problem; say it in a `Field error` or a toast.
