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

## The footer convention

The `footer` snippet is a right-aligned flex row: put buttons straight in it (never an `ActionBar`
inside a Sheet), secondary first, primary last. A `flex: 1` spacer or stretched buttons override
the alignment when a sheet wants a full-width "Show 42 records".

## What the consumer provides

`open` (bindable), `title` (the visible heading and the accessible name), `description`,
`onclose()`, `footer` snippet, `maxHeight` (default `78dvh`; ignored when `side="right"`), `side`
(`bottom` default | `right`), children (the body, which scrolls).

## Don't

- Don't nest an `ActionBar` in the footer.
- Don't use a Popover or Dialog for a choice on a phone.
