# Avatar

A person's or an organization's picture, falling back to **initials** on `ds-bg-4` with a `ds-border`
edge. A failed image load falls back too, automatically.

## Shape carries meaning

`round` for people and accounts; `square` (`ds-radius-sm`) for organizations, whose initials also switch
to mono in `ds-text-1`. Keep that consistent — the shape is how an organization is told from a person
at a glance.

## What the consumer provides

`name` (for the initials — `initials(name)`, exported for anything else that needs the same two
letters — and the alt text), `src`, `size` (px, default 32; `EntityCard` passes 56,
and the font steps up to 14px at 48 and above), `shape`, `class`.

## Don't

- Don't use a round avatar for an organization.
- Don't use color to tell avatars apart. Shape and initials do that; a tinted ground per person
  turns a list into confetti.
