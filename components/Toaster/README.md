# Toaster

Renders the system's toast queue. **Mounted once**, in the root layout. Pages never render toasts
themselves — they call the store:

```js
import { toasts } from 'darksite';

toasts.push({ message, tone, action: { label, keycap, onAction }, duration, countdown, id, onDismiss });
toasts.success('Saved as your default');
toasts.error('Could not reach the server'); // also .info, .warning, .dismiss(id), .clear()
```

Durations default to 10s with an action, 8s for an error and 4s otherwise. Pushing an `id` that is
already showing replaces that toast — "Archived 3 records" updates in place instead of stacking.
An action's `keycap` works as a hotkey while the toast shows, except while the user is typing or
when another handler already took the key (`defaultPrevented`). A page that owns the same key calls
`preventDefault()` in its handler, or the app mounts `<Toaster hotkeys={false}>` — the binding goes,
the cap stays.

`duration: null` makes a toast **sticky**: it stays until it is dismissed or its action runs, and
shows no countdown. Keep it for something the user must not miss and can act on later.

## Props

- `store` — the queue to render (default: the app's `toasts`).
- `hotkeys` (default true) — run a toast's action from its key cap.
- `topmost` (default true) — while a `Dialog` or `Sheet` is open, the queue moves into it so a toast
  stays visible and usable above the modal (see [`docs/shell.md`](../../docs/shell.md#above-a-modal-topmost)).

Each toast is `ds-bg-4` with `ds-elev-2`, a tone icon, the message, and — when it has an action —
an action button with its key cap, an m:ss countdown in mono `ds-text-2`, and a 2px `ds-accent` bar draining
over the toast's lifetime (pass `countdown: false` to drop both). **Never more than two stacked**;
the store enforces it.

Bottom-right on desktop at 380px wide, lifted above `ds-chrome-bottom` and above any `ActionBar`'s
published height. Full-width above the tab bar on phones.

## Announcing

A screen reader hears every toast, not just a sighted user: the Toaster keeps two live regions that
exist before any toast does — `role="status"` (polite) for results and information, `role="alert"`
(assertive) for failures — and speaks each new or changed toast into one of them once, with its
action and key ("Archived 3 records. Undo: z"). They travel with the queue into an open modal, so
a dialog does not silence them.
The countdown is `aria-hidden` — announcing every tick would drown the message.

## What belongs in a toast

A result, in plain past tense: "Removed Urgent", "Saved as your default". A background action's outcome
is a toast too, not an inline status line. An action toast is the system's undo.

## What does not

A **long-lived** undo is not a toast — it belongs in the view's own `ActionBar`, where it survives.
Nor is a toast the place for an error the user must act on; that is a `Field error` or a Dialog.

## Don't

- Don't mount a second Toaster.
- Don't stack three.
- Don't use a toast to ask a question.

## On the server

`toasts` is one queue per JavaScript module instance. In the browser that is the app; on a server
it would be shared by every request, so push toasts from the browser only — from event handlers and
effects, never during server rendering or in a `load` function.
