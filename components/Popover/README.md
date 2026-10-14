# Popover

Reference info beside the work: the hotkey legend, saved views, the account panel. A list of
actions is a `Menu`, which has menu semantics; a Popover does not.

**Non-modal** — the page behind keeps its keys and its pointer, which is the point: an
operator can read the legend while still using the page's hotkeys. Esc or an outside click closes it.
Under 768px it presents as a `Sheet` instead, with a scrim, per the touch rule.

`ds-bg-3` at `ds-radius-md` with `ds-elev-3`, 12px padding, 320px wide by default, capped at
`min(70dvh, 640px)` and scrolling. An optional title is 12px `ds-text-3`, in sentence case — capitals are
reserved for navigation group titles.

## What the consumer provides

- `trigger` snippet — it receives the attributes to spread onto **your** trigger (ids,
  `aria-expanded`, the click handler):
  `{#snippet trigger(attrs)}<Button {...attrs}>Views</Button>{/snippet}`.
- `open` (bindable) — controlled: set it from code (a hotkey, another button) and the popover
  opens anchored to its trigger with no click; Esc or an outside click write `false` back. The
  trigger must be rendered, and the pane must be visible — positioning happens in a frame
  callback, which a hidden tab never runs.
- `title` (heading and accessible name, and the sheet title on phones), `label` (the accessible
  name when there is no title), `placement` (default `bottom-end`), `width` (default `320px`),
  `sheetOnPhone` (default true), `closeOnOutside` (default true — `false` keeps it open while the
  user works behind it, as the legend does; Esc and the trigger still close it), `class`, children.

## Don't

- Don't use a Popover for a confirmation (`Dialog`) or for an edit form (`Sheet side="right"`).
- Don't make it modal.
