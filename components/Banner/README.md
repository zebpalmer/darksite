# Banner

A system-level condition the user must know about but that belongs to no field: "The nightly sync
has failed for 3 hours", "Read-only maintenance from 18:00".

Full width **above the `TopBar`**, inside the shell, **pushing content down** — never overlaying
it. 40px, the tone's tint ground, its icon, one sentence and at most one action.

## Tones

`info` (accent tint), `warning`, `danger`. `info` and `warning` are `role="status"`; `danger` is
`role="alert"`.

`strong` swaps the tint for the tone's **solid fill** — `ds-accent`, `ds-warning-fill` or
`ds-danger-fill` — with everything inside in the fill's contrast color, and a secondary `Button` in
`action` drawn as an outline. Use it for a condition nobody may miss, such as a staging or test
site, or an outage; a strong banner on every page soon stops being read.

```svelte
<Banner id="staging" tone="warning" strong message="This is the staging site.">
  {#snippet action()}<Button size="dense" href="https://example.com">Go to the live site</Button>{/snippet}
</Banner>
```

## Dismissal

`dismissible` with an `id` adds a × and remembers the dismissal for this viewer (`viewer` scopes it
to a signed-in user; storage failures fall back to this page view). A **`danger` banner is never
dismissible**: show it while its condition holds and remove it when the condition clears.

`remember={false}` makes a dismissal last for **this page view only**: the banner is back on the
next load. Use it for a notice that must keep returning while its condition holds — the
update-available notice below.

## Update available

When a new version of the app is waiting, show an `info` Banner with one **Reload** action. It is
dismissible, but never forever: the viewer can put it away for now, and it returns on the next load
while the update still waits.

```svelte
{#if updateReady}
  <Banner id="update" tone="info" message="A new version is available." dismissible remember={false}>
    {#snippet action()}<Button size="dense" onclick={reload}>Reload</Button>{/snippet}
  </Banner>
{/if}
```

Reload applies the update; when the page holds unsaved edits, ask first with a `Dialog`. See
[`shell.md`](../../docs/shell.md).

## What the consumer provides

`id`, `tone`, `message` (or children — one sentence), `action` snippet (one link or Button),
`dismissible`, `remember` (default true), `viewer`, `dismissed` (bindable: pass what the server
knows from a cookie, so a dismissed banner never shows before hydration), `ondismiss`, `class`.

`Notice` shares this dismissal logic (`darksite:notice:` keys beside `darksite:banner:`).

## Don't

- Don't use a Banner for something that belongs to a field or a page — that is a `Field` error, a
  `Notice` in the page, or an `EmptyState`.
- Don't stack more than one; resolve or combine them.
- Don't put a Banner over content.
