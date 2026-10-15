# Dialog

**Confirmations only** — a question that blocks the action the user just asked for:
delete these records, discard this draft, "Remove both?", "No severity set". Not for forms and
not for reference info; those are `Sheet` and `Popover`. On phones it presents as a bottom sheet.

Built on a dialog primitive that gives you: focus trap, Esc, scroll lock, focus returns to the
trigger, and the role — `alertdialog` for a danger question, `dialog` for a default-tone
confirmation or one that asks for a note (the `role` prop overrides). The content mounts **only while open**, so a Dialog opened over a
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
- `initialFocus` — `cancel` (default), `confirm` (for a confirm the user just asked for), `field`
  (the first input, textarea or select in the body, for a confirmation that asks for a note), or
  `content` (the dialog itself, for a body with its own keys, where Enter must not press Cancel).
  Explicit, so choice buttons in `children` never take focus first.
- `finalFocus` — where focus lands on close, when returning to the trigger would be wrong.
- `showConfirm` (default true) — false leaves only Cancel, for a dialog whose **choices are its
  body**.
- `confirmDisabled` (default false) — the confirm waits for the body, as when a bulk delete makes
  the user type `confirm`.
- `size` — `default` (400px) or `wide` (up to 1040px, scrolling) for a side-by-side comparison.
  Never for a form.

## A confirmation that asks for a note

Some confirmations must record why: "Archive this record?" with a required reason. That is still a
confirmation, not a form — the question is the title, the consequence the description, and the
**children hold one or two `Field`s** (a short `Input`, or a `textarea class="ds-control"` for a
longer note). More than two fields is a form, and a form is a `Sheet`.

```svelte
<Dialog bind:open title="Archive this record?" description="It leaves every queue."
  tone="default" confirmLabel="Archive" confirmDisabled={!note.trim()} initialFocus="field"
  onconfirm={() => archive(note)}>
  <Field label="Note" required>
    {#snippet children(f)}
      <Input bind:value={note} id={f.id} aria-describedby={f.describedBy} />
    {/snippet}
  </Field>
</Dialog>
```

- `initialFocus="field"` starts in the note; `confirmDisabled` holds the confirm until it is valid.
- The panel is a `<form>` whose submit is the confirm button, so **Enter in a single-line field
  confirms** (and does nothing while `confirmDisabled`). Enter in a `textarea` is a new line. The
  form is `novalidate`: say what is wrong with a `Field error`, not the browser's bubble.
- A button inside `children` must be `type="button"` — `Button`'s default — or it confirms.
- Menu items that lead here carry `needsNote`, so the operator knows before choosing.

## Don't

- Don't use a Dialog for a form or for information. One or two note fields is the limit.
- Don't put a Dialog over a work surface that could answer inline.
- Don't use `danger-solid` anywhere else.
