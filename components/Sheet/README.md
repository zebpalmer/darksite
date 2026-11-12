# Sheet

The bottom sheet. Filters, sort, and **every choice on touch** — it replaces `Popover` and
`Dialog` under 768px, and `Popover` makes that switch itself.

`ds-radius-lg` on the top two corners, a grab handle, 44px rows (use `SheetItem`), safe-area
padding, a scrim behind, `78dvh` max height. `ds-bg-3` with `ds-elev-3`.

Built on the native modal `<dialog>`: focus is trapped inside, Esc closes, the page behind cannot be
reached or scrolled, and focus returns to where it was. A press on the scrim closes it too.

## `side="right"` is the edit drawer

At ≥768px it presents as a right-side drawer, 440px wide and full height, rounded on the left —
the shape for **every record edit form**. Under 768px it
falls back to the bottom sheet, per the touch rule.

## `size`

How wide the sheet may grow, for content that needs the room: a wide form, a table, a preview.

| `size` | Bottom sheet (max width) | Right drawer (≥768px) |
|---|---|---|
| `md` (default) | 640px | 440px |
| `lg` | 960px | 960px |
| `full` | 1400px | 1400px |

Every size stops at the viewport. A wide right drawer keeps a 32px strip of scrim on its left, so
the page shows behind it and a press there closes it. Under 768px every size is the bottom sheet,
full width on a phone.

```svelte
<Sheet bind:open title="Compare versions" side="right" size="lg">…</Sheet>
```

## The footer convention

The `footer` snippet is a right-aligned flex row: put buttons straight in it (never an `ActionBar`
inside a Sheet), secondary first, primary last. A `flex: 1` spacer or stretched buttons override
the alignment when a sheet wants a full-width "Show 42 records".

## What the consumer provides

`open` (bindable), `title` (the visible heading and the accessible name), `description`,
`onclose()`, `footer` snippet, `maxHeight` (default `78dvh`; ignored when `side="right"`), `side`
(`bottom` default | `right`), `size` (`md` default | `lg` | `full`), children (the body, which
scrolls).

## Unsaved edits

`dirty` marks a sheet that holds unsaved edits; the app reads it as `modals.dirty` to postpone a
reload or navigation. `onbeforeclose()` runs before Esc, the scrim or the close button closes the
sheet — return `false` to keep it open (and ask). Setting `open` to false from code bypasses it. A
browser may still close a modal on a repeated Esc; the sheet then follows rather than drifting out
of sync, so treat `onbeforeclose` as a courtesy, not a lock.

## Don't

- Don't nest an `ActionBar` in the footer.
- Don't use a Popover or Dialog for a choice on a phone.
