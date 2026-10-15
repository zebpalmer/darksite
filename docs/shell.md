# Shell and navigation

The application frame: the rail, the phone tab bar, the secondary nav, the top bar, and the
stacking order everything sits in. Page composition is [`layout.md`](layout.md); this is the furniture around
it.

The frame is built from `AppShell`, `NavRail`, `TabBar`, `SideNav` and `TopBar` — see their cards.

## One navigation list

**Every destination comes from one list**, in a handful of named groups. The rail, the phone
sheet, the group headings and any command palette all derive from it. A new destination is one
entry plus its icon.

Resist a second source of truth for navigation. The moment a rail hard-codes its items and the
phone menu hard-codes its own, they drift, and the drift is invisible until someone cannot reach
a page on their phone.

```js
{ id: 'records', label: 'Records', href: '/records', icon: Boxes,
  group: 'library', role: 'viewer', badge: () => counts.pending }
```

**Items a role cannot use are removed, not disabled.** A disabled nav item advertises something
the viewer cannot have and invites a support question. If they cannot go there, it is not there.

## The rail

`ds-bg-0`, full height, at `ds-bp-phone` and above.

- **Collapsed** `ds-rail-w` (56px): 40×36 icon items, labels as one fixed-position tooltip —
  fixed, so a scrolling list never clips it. Hover after ~300ms, keyboard focus immediately.
- **Expanded** `ds-rail-w-expanded` (208px): 32px rows with icon, label and badge, and the
  product's name beside its mark at the top.
- **Active** = `ds-bg-4` + `ds-text-1` + a 2px `ds-accent` bar on the leading edge.
- **Groups** are separated by a hairline and, when expanded, an 11px uppercase `ds-text-3` label.
- The item list **scrolls** on a short window and the current item scrolls into view; the bottom
  block — notifications, the account avatar, the collapse toggle, the build version — stays put.
- The collapse state is **remembered per viewer**. With no stored preference it starts expanded at
  `ds-bp-rail` and collapsed below. Width animates over `ds-dur-base`, and not at all under
  reduced motion.
- **Always collapsed:** a product that wants the 56px rail everywhere passes `expanded={false}`
  with `pinned` (on `AppShell`, `railExpanded={false} railPinned`) and no `rememberAs`. `pinned`
  removes the toggle, so the viewer cannot widen it either.
- **Slots:** `search` (under the brand), `status` (in the footer, above the toggle) and `badge`
  (per item, replacing the count or dot). The `search` and `status` slots get a `tip(label)` helper
  so a collapsed control shows the rail's own fixed tooltip, the same as an item. A search slot is
  for an app with no `TopBar`; with one, search lives there.

## Phones

A tab bar of **at most five cells** (`ds-tabbar-h` plus the bottom safe-area inset). Four
destinations and a **More** cell that opens a `Sheet` containing everything else under the same
group headings, plus the account panel.

Five is a hard ceiling: below about 64px a cell cannot hold a legible label, and an unlabeled
tab bar is a guessing game.

## Secondary nav

A settings or admin area gets a `SideNav`: 200px, grouped, sticky, its own scroll, 32px rows and
11px uppercase group titles. It sits **beside** the page, not above it, so the page keeps its full
`PageHeader`.

The one exception is a few sibling **data views** that need the full width: those use `Tabs` in
links mode inline in the `PageHeader` (the test is in [`which-primitive.md`](which-primitive.md)).

Below `ds-bp-phone` it becomes a full-width native `<select>` under the top bar. A 200px column
and a 375px phone cannot both be right, and a select is the one control every phone renders well.

## Top bar

An optional strip above the content column for things that belong to **every** page in a section:
search, a global create action, a scope or filter selector. 48px on content routes, or a slim
40px where it only carries search.

It sits **outside** the padded column, so `PageHeader` keeps its flush geometry underneath. The
shell publishes its height as `--ds-topbar-h` for panes that need to size themselves against it.

If a control is not relevant on every page in the section, it does not belong here — it belongs in
that page's `PageHeader` actions.

## Stacking order

Assign these centrally, not at each call site:

| Layer | z-index |
|---|---|
| Sticky `PageHeader`, sticky `ActionBar` | 20 |
| `Combobox` list | 40 |
| `Popover` | 50 |
| Overlay scrim | 60 |
| `Dialog`, `Sheet` | 61 |
| `Toaster` | 70 |

Raise a third-party positioner explicitly when its library writes `z-index: auto` inline — a
popover opened above a sticky header rendering *underneath* it is the classic symptom.

A **`Banner`** sits in the flow above the `TopBar` and pushes content down, so it needs no layer.

## Update available

When a new version of the app has loaded in the background and is waiting, say so with the
shell's `banner` slot — not a toast, which would expire, and not a dialog, which would interrupt:

```svelte
{#snippet banner()}
  {#if updateReady}
    <Banner id="update" tone="info" message="A new version is available." dismissible remember={false}>
      {#snippet action()}<Button size="dense" onclick={reload}>Reload</Button>{/snippet}
    </Banner>
  {/if}
{/snippet}
```

- `tone="info"`, one sentence, **one action: Reload**. No version numbers or release notes in it.
- Dismissible, but **never forever** (`remember={false}`): put away, it returns on the next load
  while the update still waits. Once the update is applied, the condition is gone and so is the
  banner.
- Reload applies the update at once. If the page holds unsaved edits, ask first with a `Dialog`.
- How the app learns an update is waiting — a service worker, a polled version file — is the
  app's business; the shell only shows the notice.

**One `Toaster`**, mounted once at the root. Pages never render toasts themselves.
