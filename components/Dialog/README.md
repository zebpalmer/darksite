# Dialog

**Confirmations only** — a question that blocks the action the user just asked for:
delete these records, discard this draft, "Remove both?", "No severity set". Not for forms and
not for reference info; those are `Sheet` and `Popover`. On phones it presents as a bottom sheet.

Built on a dialog primitive that gives you: focus trap, Esc, scroll lock, `role="alertdialog"`,
focus returns to the trigger. The content mounts **only while open**, so a Dialog opened over a
Sheet is not left `aria-hidden` by the Sheet's modal layer.

`ds-bg-3` at `ds-radius-lg` with `ds-elev-3`, 400px wide, 16px padding.

## What the consumer provides

- `open` (bindable), `title`, `description` (the consequence, in plain words), children (extra
  body).
- `confirmLabel` (default "Confirm"), `confirmingLabel` (an "-ing" verb while the async
  `onconfirm` runs: "Deleting"), `cancelLabel` (default "Cancel").
- `tone` — `danger` (a filled `danger-solid` confirm; the default) or `default` (primary).
- `onconfirm()` — may return any value or a promise: the dialog closes when it resolves and stays
  open with the error shown if it throws. `oncancel()`.
- `dirty` — the body holds unsaved input (read app-wide as `modals.dirty`). `onbeforeclose()` runs
  before Esc, the scrim or Cancel closes the dialog; return `false` to keep it open.
- `initialFocus` — `cancel` (default), `confirm` (for a confirm the user just asked for), or
  `content` (the dialog itself, for a body with its own keys, where Enter must not press Cancel).
  Explicit, so choice buttons in `children` never take focus first.
- `finalFocus` — where focus lands on close, when returning to the trigger would be wrong.
- `showConfirm` (default true) — false leaves only Cancel, for a dialog whose **choices are its
  body**.
- `confirmDisabled` (default false) — the confirm waits for the body, as when a bulk delete makes
  the user type `confirm`.
- `size` — `default` (400px) or `wide` (up to 1040px, scrolling) for a side-by-side comparison.
  Never for a form.

## Don't

- Don't use a Dialog for a form or for information.
- Don't put a Dialog over a work surface that could answer inline.
- Don't use `danger-solid` anywhere else.
