# Chip

Toggle a label or category, show an active filter, carry an applied token, or offer a suggestion.
28px tall, 44 on touch, where an 8px gap between chips is also required.

## Modes, picked by prop

- **toggle** — `selected` (`true` | `false` | `'mixed'`) plus `onclick`: a `<button aria-pressed>`.
  Off is `ds-bg-3` with a `ds-border` edge; on is `ds-accent-tint` with a `ds-accent` border;
  `'mixed'` (a bulk selection where only some items have it) keeps the neutral ground and takes a
  `color-primary-700` border.
- **removable** — `removable` + `onremove` + `removeLabel`: a label plus a 22px × button (32 on
  touch). `variant="token"` is the applied-token look — `ds-bg-5`, no border. Pass `onclick` as
  well and the label becomes a second button beside the ×, so a partial bulk token can add to all
  (label) or remove from all (×).
- **suggestion** — `suggestion`, with `source` and `confidence`: a dashed border, a `+` icon and a
  `SourceBadge`. **Dashed always means "suggested, not applied"**; clicking applies it. `isNew`
  adds a `NewBadge` and tints the dashed border with the accent, for a value that exists nowhere
  yet.
- **static** — none of the above: a plain `<span>`.

## Extras

`keycap` (a hotkey hint on a keyboard-driven view), `count` (12px `ds-text-3`, for filters), `icon` (a leading
Lucide icon at 14px), `disabled`, `title`, `bodyProps` (spread last onto the label button, so the
label can be a Popover trigger while × stays its own button), `tone="warning"` (amber tint, border
and text over any state, for a value that fails a rule), children = the label.

## Don't

- Don't give a suggestion chip a solid border — dashed is the whole signal.
- Don't put more than one `SourceBadge` on a chip. Name the most reliable source and list the rest
  in `title`.
- Don't shrink the × below 22px, or 32 on touch.
