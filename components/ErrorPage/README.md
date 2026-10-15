# ErrorPage

The **focused page** for a failed route ([`layout.md`](../../docs/layout.md)): one centered column,
vertically centered when short. A 24px `ds-text-3` icon, the status code in mono, a title, one
sentence, and at most two actions. Built for `+error.svelte`:

```svelte
<ErrorPage status={page.status} homeHref="/" onretry={() => location.reload()} />
```

## Copy

Without a `title` or `message`, the status picks neutral defaults (`errorCopy(status)`): 404 is
"Page not found", 403 "No access", 401 "Signed out", 429 "Too many requests", 503 "Unavailable",
408/504 "Took too long", `0` "Offline", anything else "Something went wrong".

When you write your own:

- **Say what happened and what to do next**, in one sentence: "The report could not be built. Try
  again."
- **Never blame the viewer**, never joke, never apologize at length. No "Oops", no exclamation
  marks.
- **Don't confirm what the viewer cannot see.** A record they have no access to is "Page not
  found", the same as one that does not exist.
- **No stack traces, no raw codes from a server.** A reference for support (`detail`, such as a
  request id) is fine, in mono `ds-text-3`.
- The code above the title is only the HTTP status, and only when there is one.

## Actions

`onretry` shows **Try again** (primary — it is the one thing to do); `homeHref` shows **Go home**
(`homeLabel` renames it). A 404 or 403 offers only the way home, since trying again will not
help. `actions` replaces both with your own.

## What the consumer provides

`status`, `title`, `message`, `onretry`, `homeHref`, `homeLabel`, `actions` snippet, `detail`,
`icon`, `class`.

## Don't

- Don't show it inside a pane for a failed fetch — that is an `EmptyState` or an inline error.
- Don't render the shell's navigation around a fatal error that the shell itself caused.
