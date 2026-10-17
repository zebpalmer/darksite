# Dialog

**Confirmations only** — a question that blocks the action the user just asked for:
delete these records, discard this draft, "Remove both?", "No severity set". Not for forms and
not for reference info; those are `Sheet` and `Popover`. On phones it presents as a bottom sheet.
The one exception is the **hero** (below): a welcome or sign-up moment.

Built on a dialog primitive that gives you: focus trap, Esc, scroll lock, focus returns to the
trigger, and the role — `alertdialog` for a danger question, `dialog` for a default-tone
confirmation or one that asks for a note (the `role` prop overrides). The content mounts **only while open**, so a Dialog opened over a
Sheet is not left `aria-hidden` by the Sheet's modal layer.

`ds-bg-3` at `ds-radius-lg` with `ds-elev-3`, 400px wide, 16px padding. The title is
`ds-text-heading` (falling back to `ds-text-1`).

## What the consumer provides

- `open` (bindable), `title`, `description` (the consequence, in plain words), children (extra
  body).
- `confirmLabel` (default "Confirm"), `confirmingLabel` (an "-ing" verb while the async
  `onconfirm` runs: "Deleting"), `cancelLabel` (default "Cancel").
- `tone` — `danger` (a filled `danger-solid` confirm; the default) or `default` (primary; the
  default for a hero).
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
- `size` — `default` (400px), `wide` (up to 1040px, scrolling) for a side-by-side comparison
  (never for a form), or `hero` (520px, centered; below).
- `mark` snippet and `markLabel` — the hero only: an icon or logo above the title (below).

## The hero

`size="hero"` is for a welcome or sign-up moment: the first visit to a product, an invitation to
subscribe, the start of a trial. A heading, a sentence or two, and either a short form (an email
address, a name) or just the two actions. It keeps everything else a Dialog does — the top layer,
the modal stack, the focus trap, Esc, focus returning to the trigger.

- 520px wide with 32px padding; the title at `ds-text-2xl`, the description at `ds-text-lg`, both
  centered. A form in the body keeps its labels on the left.
- **A mark** — the `mark` snippet puts an icon or a logo centered above the title, in
  `ds-text-2` (a Lucide icon takes it as `currentColor`; a logo keeps its own colors). Size it in
  the snippet: a 40px icon, a logo up to about 64px tall. It is **decorative** — `aria-hidden`,
  since the title already says what the moment is — unless `markLabel` names it ("Acme"), which
  makes it an image with that name. Only the hero shows a mark; the other sizes ignore it, because a
  confirmation's question is the whole message and an icon would compete with it (a danger tone
  already says the action is serious).
- **The actions stack full width on every viewport**, the primary on top (36px) and Cancel under
  it as a quiet **ghost** button: the text in `ds-text-2`, no fill until hover, the same name, and
  the same way out — Esc and the scrim still cancel. The markup follows that order, so Tab reaches
  the primary first.
- `tone` defaults to `default`, so the confirm is a primary button and the role is `dialog`.
- Below 768px it is a full-width bottom sheet like `Sheet`'s: a grab handle, the top corners
  rounded, the slower rise, and the safe area kept clear.
- The cancel button is the way out: label it for the moment ("Not now"), not "Cancel".

```svelte
<Dialog bind:open size="hero" title="Get the weekly digest"
  description="One email a week with what changed, and nothing else."
  confirmLabel="Subscribe" cancelLabel="Not now" initialFocus="field"
  confirmDisabled={!valid} onconfirm={() => subscribe(email)}>
  {#snippet mark()}<Mail size={40} />{/snippet}
  <Field label="Email">
    {#snippet children(f)}<Input bind:value={email} id={f.id} type="email" />{/snippet}
  </Field>
</Dialog>
```

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

- Don't use a Dialog for a form or for information. One or two note fields is the limit, a hero's
  short form included.
- Don't open a hero on every visit, or over a work view; it is for a moment that happens once.
- Don't put a Dialog over a work surface that could answer inline.
- Don't use `danger-solid` anywhere else.
