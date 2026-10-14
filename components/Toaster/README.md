# Toaster

Renders the system's toast queue. **Mounted once**, in the root layout. Pages never render toasts
themselves — they call the store:

```js
toasts.push({ message, tone, action: { label, keycap, onAction }, duration, countdown, onDismiss });
toasts.success('Saved as your default');
```

Each toast is `ds-bg-4` with `ds-elev-2`, a tone icon, the message, and — when it has an action —
an action button with its key cap, an m:ss countdown in mono `ds-text-2`, and a 2px `ds-accent` bar draining
over the toast's lifetime (pass `countdown: false` to drop both). **Never more than two stacked**;
the store enforces it.

Bottom-right on desktop at 380px wide, lifted above `ds-chrome-bottom` and above any `ActionBar`'s
published height. Full-width above the tab bar on phones.

## Announcing

Each toast is its own live region, so a screen reader hears it and not just a sighted user:
`role="status"` (polite) for results and information, `role="alert"` (assertive) for failures.
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
