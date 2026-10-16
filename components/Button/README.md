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
`href` (renders an `<a>`), `type` (default `button`), `disabled`, `reason` (why it is disabled:
it then stays focusable with the reason as its tooltip — see below), `pressed` (a toggle, via
`aria-pressed`), `full` (100% width), `class`, children (the label), and any other attribute or
handler, spread onto the element: every native `<button>` and `<a>` attribute passes through,
typed — `form`, `name`, `value`, `download`, `target`, `rel`, `data-*`.

## A disabled button that says why

A native `disabled` button leaves the tab order, and some browsers send it no pointer events, so a
tooltip saying why it is disabled can never be reached by keyboard, and in those browsers not by
hover either. Give the reason as `reason`: while `disabled`, the Button renders
`aria-disabled="true"` instead of the native attribute. It still looks and announces as disabled,
but it stays in the tab order, the reason is its tooltip (on hover, keyboard focus and long press)
and describes it to a screen reader, and a click — by mouse, Enter or Space — does nothing: no
handler, no navigation, no form submission. A disabled link with a `reason` gets `tabindex="0"` for
the same reason. Without a `reason`, `disabled` is native, as before; `reason` does nothing while
the button is enabled.

```svelte
<Button variant="primary" disabled={!rows.length} reason="Select a row to export">Export</Button>
```

Keep it short and actionable — what would enable it. A long explanation is a `Field error` or a
`Notice`.

## Submitting a form from a footer

A `Sheet` or `Dialog` footer sits outside the `<form>` in its body. Give the form an `id` and the
primary button `type="submit" form="…"`: the button submits that form, and **Enter in any of its
single-line fields submits too**, because the form has a submit button.

```svelte
<Sheet bind:open title="Edit record">
  <form id="edit-record" onsubmit={save}>…</form>
  {#snippet footer()}
    <Button onclick={() => (open = false)}>Cancel</Button>
    <Button variant="primary" type="submit" form="edit-record">Save</Button>
  {/snippet}
</Sheet>
```

## Downloads and server endpoints

A client-side router intercepts same-origin links. A `Button href` that points at a **file
download** or at an endpoint the app's router does not own (an export, a report rendered by the
server, a sign-out route) needs the router's full-load escape hatch, or the router fetches it as a
page and fails. In SvelteKit that is `data-sveltekit-reload`; add `download` for a file:

```svelte
<Button href="/exports/records.csv" download data-sveltekit-reload icon={Download}>Export</Button>
```

Other routers have their own attribute (or need `target="_self"`); Button passes any of them
through.

## Don't

- Don't put two primaries in one view.
- Don't use `danger-solid` outside a Dialog.
- Don't ship an `icon` button without `label`.
- Don't disable a button to explain a problem; say it in a `Field error` or a toast.
