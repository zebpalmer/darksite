# Tooltip

A short label or note for a control, shown beside it. It is an **attachment**, so it goes on any
element that can already take focus — a Button, a link, a Chip:

```svelte
<script>
  import { tooltip } from 'darksite';
</script>

<a href="/records/412" {@attach tooltip('Opened 3 times this week')}>R-00412</a>
```

`Button` uses it for you: an icon button's `label` is its tooltip, and any Button's `title` becomes
one instead of the browser's native title, which a keyboard or touch user never sees.

## Behavior

- Shows after 300ms of hover, at once on keyboard focus, and on a long press on a touch screen
  (hiding 1.5s after the finger lifts).
- Hides on leaving, blur, a scroll, or Esc — Esc is taken only while the tooltip shows, so a
  surrounding Dialog does not close with it. One shown for keyboard focus stays through a scroll
  while its element is in view, following it: tabbing to an element below the fold scrolls the
  page, and that must not take the tooltip away again.
- In the top layer, placed with `placement` (default `top`), flipped and shifted to stay inside the
  viewport. Inside an open modal it moves into the modal, so it shows above it.
- `ds-bg-4` with `ds-elev-2`, 12px `ds-text-1`, up to 280px wide.

## Accessibility

The text **describes** the element (`role="tooltip"` and `aria-describedby`). When the text is
already the element's name — an icon button's label — the bubble is hidden from assistive
technology instead, so nothing is read twice.

## What the consumer provides

`tooltip(text, { placement?, delay? })` — `text` (nothing is attached when it is empty),
`placement` (a floating-ui placement, default `top`), `delay` (hover delay in ms, default 300).

## Don't

- Don't put anything a user must read to act in a tooltip — that is a `Field error`, a `HelpTip`
  note or the page itself.
- Don't attach one to an element that cannot take focus; a keyboard user would never see it.
- Don't put a tooltip on a tooltip trigger that is already a `HelpTip`.
