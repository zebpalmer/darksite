# ConnectionStatus

The quiet state of the app's link to its server. It sits in the `TopBar`'s actions or the
`NavRail`'s `status` slot, and **renders nothing while everything is connected and sent** — an app
that is working says nothing about it.

For an app that keeps working through a dropped connection — saving changes on the device and
sending them later — and for any app whose server can be briefly unreachable, such as during a
deploy.

## States

The worst one shows:

| State | When | Look |
|---|---|---|
| Not saved | the server refused one or more changes (`failed`) | a ghost `Button`, "2 not saved", in `ds-text-1` with an alert icon; it opens the panel below |
| Offline | the device has no connection | a wifi-off icon, "Offline", then "· 3 waiting" when changes are kept |
| Reconnecting | online, but the app is retrying the server | a `Spinner` and "Reconnecting", fading in after 400ms so one quick retry never flickers |
| Syncing | queued changes are being sent now | a `Spinner` and "Syncing · 2" |
| Waiting | changes are kept, not yet sent | an upload icon and "1 waiting" |

Every state but Not saved is a status line in `ds-text-2` at 13px, 32px tall — not a control, so it
does not grow on touch.

It reads only the text roles — no warning or danger colors — so it takes the colors of the bar or
rail it sits in, whatever the brand's chrome; the icon and the words carry the state.

## The Not saved panel

A `Popover` (a `Sheet` on phones) titled "Not saved", listing each refused change: its `label` in
`ds-text-1`, its `reason` under it in `ds-text-2`, and an icon `Button` to dismiss it ("Dismiss
Move R-00412"). With `onretry`, a Retry button sits at the foot. When the device is also offline or
holding changes, one line above the list says so.

A refused change is never retried on its own: the server said no, so a person decides.

## In a collapsed rail

`compact` draws the icon alone — the Not saved trigger becomes an icon `Button` — with the words in
the tooltip and, through the live region, to screen readers. In the `NavRail`'s `status` slot, pass
the slot's own `expanded` and `tip`:

```svelte
<NavRail {items}>
  {#snippet status({ expanded, tip })}
    <ConnectionStatus compact={!expanded} {tip} queued={queue.length} failed={queue.rejected} />
  {/snippet}
</NavRail>
```

## Announcements

One polite live region, always present, carries the state as words — "Offline, 3 changes waiting
to sync" — so a screen reader hears each change without the visible line being read twice.

## What the consumer provides

`online` (omit it to follow the browser's `navigator.onLine` and its `online` / `offline` events),
`reconnecting`, `syncing`, `queued` (a count), `failed` (`ConnectionFailure[]`: `{ id, label,
reason? }`), `onretry`, `ondismiss(id)`, `compact`, `tip` (the rail slot's), `class`. Every word comes from `strings`.

```svelte
<ConnectionStatus
  queued={queue.length}
  syncing={queue.sending}
  reconnecting={api.retrying}
  failed={queue.rejected}
  ondismiss={(id) => queue.drop(id)}
  onretry={() => queue.flush()}
/>
```

## Don't

- Don't show it while everything is fine; "Online" is noise.
- Don't use a toast for a lasting condition — offline lasts, a toast does not.
- Don't use it for a system-wide outage everyone must see; that is a `Banner`.
- Don't retry refused changes automatically.
