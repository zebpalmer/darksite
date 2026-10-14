# EntityCard

An organization or a person as a **row**: a 56px avatar, the name in `card-title`, one meta line in
`meta`. `ds-bg-2` with a `ds-border-subtle` edge at `ds-radius-md`; hover is `ds-bg-4`.

Use it in a `Grid min={280}` for the organization and people indexes and for any "people on
this record" list. That `min` of 260px or more also tells `Grid` this is a row grid, so a phone
shows one per line instead of forcing the 2-up thumbnail layout.

## What the consumer provides

`href`, `name`, `image` (a URL; `Avatar` falls back to initials), `shape` (`square` for an organization,
`round` for a person), `meta` ("Owner · 84 items"), `code` (a short tag — a role, a region,
a team — in mono `ds-text-3` beside the name), `trailing` snippet (a favorite toggle, a count), `class`.

## Don't

- Don't use it as a card in a thumbnail grid — it is a row.
- Don't let the name or the meta wrap; both truncate with a `title`.
