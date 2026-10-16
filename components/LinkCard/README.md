# LinkCard

A destination on an overview page: a tool, a section, a guide. The whole card is one link — an
optional icon in the accent, a title, a sentence or two, an arrow, and an optional note at the foot
("Updated hourly"). `ds-bg-2` with a `ds-border-subtle` edge; hover is `ds-bg-3`.

Put several in a `Grid min={260}`.

## What the consumer provides

`href`, `title`, `text`, `icon` (a Lucide icon), `meta`, `external` (opens in a new tab; the arrow
turns and a screen reader hears "opens in a new tab"), `class`.

## Don't

- Don't use it for a record — that is `EntityCard` — or for media — that is `Card`.
- Don't put a second link or a button inside it.
