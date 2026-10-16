# Notice

An **in-page notice**: something the reader of this page should know, inside the content — "Figures
for the current month are provisional", "This record was merged into R-00412", "Import finished".

It is not a `Banner` (a system-wide condition above the `TopBar`), not a `Field` error (a problem
with one control), and not a toast (the outcome of an action just taken).

## Geometry

Full width of its container, the tone's tint ground at `ds-radius-md`, 10px by 14px of padding.
A 16px icon in the tone's text color, then an optional **title** (14/500 `ds-text-1`) over the body
(14px `ds-text-1`), then at most **one action** (a link or a dense `Button`) and, when dismissible, a
×. Under 480px of its own width the action moves under the body (a container query).

## Tones

| Tone | Ground · icon | For |
|---|---|---|
| `info` (default) | `ds-accent-tint` · `ds-accent-text`, an info circle | context: provisional, read only, merged |
| `success` | `ds-success-tint` · `ds-success-text`, a check circle | a finished state worth keeping on screen |
| `warning` | `ds-warning-tint` · `ds-warning-text`, a triangle | something that needs attention soon |
| `danger` | `ds-danger-tint` · `ds-danger-text`, an octagon | something that failed or blocks the page |

`icon` replaces the tone's icon. `info`, `success` and `warning` are `role="status"`; `danger` is
`role="alert"`.

## Dismissal

The same rules and the same code as `Banner`: `dismissible` with an `id` adds a × and remembers the
dismissal for this viewer (`viewer` scopes it to a signed-in user; storage that is unavailable
falls back to this page view). `remember={false}` dismisses for this page view only. `dismissed` is
bindable: pass what the server knows from a cookie so a dismissed notice never shows before
hydration. **A `danger` notice is never dismissible** — show it while its condition holds.

## What the consumer provides

`tone`, `title`, `message` (or children — a sentence or two; paragraphs are spaced), `icon`,
`action` snippet, `id`, `dismissible`, `remember` (default true), `viewer`, `dismissed`
(bindable), `ondismiss`, `class`.

```svelte
<Notice tone="warning" title="Two records need review" message="Their owners left the team.">
  {#snippet action()}<Button size="dense" href="/review">Review</Button>{/snippet}
</Notice>
```

## Don't

- Don't use it for a system-wide condition; that is a `Banner`.
- Don't use it for the result of an action the viewer just took; that is a toast.
- Don't stack several; combine them, or keep the one that matters.
- Don't put it on a work view to explain the controls; explanations live in `HelpTip`s.
