# Card

The media card — a video or a gallery. **No card chrome**: the 16:9 thumbnail at `ds-radius-sm`
*is* the card, and the text sits under it.

Put cards in a `Grid`, or in a horizontal row. Never in a fixed-width column.

## The overlays, and where they sit

- **Severity** bottom-left: `SeverityBadge size="sm"`.
- **Duration** bottom-right, mono and tabular, on a `ds-scrim` pill — or, for a gallery, an
  images icon and the count.
- **Favorite** top-right: a filled heart on a round scrim.
- **Progress**: a 3px `ds-accent` bar along the bottom edge.
- `overlay` snippet for anything else.

The thumbnail scales to 1.03 on hover over `ds-dur-base`. A missing or broken thumbnail falls back
to a `ds-bg-3` tile with a film or images icon.

## The text

Title in `card-title` (14/500), one meta line in `meta` (13px `ds-text-3`), both single-line with
an ellipsis and a `title` attribute. A `rating` — the viewer's own, 1–5 — shows as `★ n` at the
end of the title row. It is **display only**: rating happens on the detail page, so there is no
hover-only control for a touch user to miss.

## What the consumer provides

`href`, `title`, `thumbnail`, `kind` (`video` | `gallery`), `severity`, `duration` (seconds),
`imageCount`, `favorite`, `progress` (0–1), `rating`, `meta`, `overlay` snippet, `class`, plus
every other `<a>` attribute and handler, typed, on the link: `role`, `aria-*`, `data-*`, `onclick`,
`onkeydown`, `target`. (`title` is the card's title, not the attribute.)

## Select mode

When a view selects cards for a bulk action, each card becomes a checkbox: pass `role="checkbox"`,
`aria-checked`, an `onclick` that toggles and prevents the navigation, and an `onkeydown` that
toggles on Space (a link activates on Enter only). Draw the check in the `overlay` snippet.

```svelte
<Card
  {href}
  {title}
  role="checkbox"
  aria-checked={selected.has(id)}
  onclick={(e) => { e.preventDefault(); toggle(id); }}
  onkeydown={(e) => { if (e.key === ' ') { e.preventDefault(); toggle(id); } }}
>
  {#snippet overlay()}{#if selected.has(id)}<span class="check">…</span>{/if}{/snippet}
</Card>
```

## Don't

- Don't add a border, a background or a shadow to a card.
- Don't put a hover-only control on it.
- Don't let the title wrap to two lines.
