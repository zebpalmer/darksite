# Banner

A system-level condition the user must know about but that belongs to no field: "The nightly sync
has failed for 3 hours", "Read-only maintenance from 18:00".

Full width **above the `TopBar`**, inside the shell, **pushing content down** — never overlaying
it. 40px, the tone's tint ground, its icon, one sentence and at most one action.

## Tones

`info` (accent tint), `warning`, `danger`. `info` and `warning` are `role="status"`; `danger` is
`role="alert"`.

## Dismissal

`dismissible` with an `id` adds a × and remembers the dismissal for this viewer (`viewer` scopes it
to a signed-in user; storage failures fall back to this page view). A **`danger` banner is never
dismissible**: show it while its condition holds and remove it when the condition clears.

## What the consumer provides

`id`, `tone`, `message` (or children — one sentence), `action` snippet (one link or Button),
`dismissible`, `viewer`, `ondismiss`, `class`.

## Don't

- Don't use a Banner for something that belongs to a field or a page — that is a `Field` error or
  an `EmptyState`.
- Don't stack more than one; resolve or combine them.
- Don't put a Banner over content.
