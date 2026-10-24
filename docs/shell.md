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

```ts
import type { NavItem } from 'darksite';

const nav: NavItem[] = [
	{ id: 'records', label: 'Records', href: '/records', icon: Boxes, group: 'library', badge: 12 },
	{ id: 'alerts', label: 'Alerts', href: '/alerts', icon: Bell, group: 'library', badge: true },
	{ id: 'settings', label: 'Settings', href: '/settings', icon: Settings, group: 'admin' }
];
```

`badge` is a count, `true` for a dot, or `false`/`null` for nothing; `groupItems` orders the list
by group and `badgeText` formats a count (`140` reads `99+`).

**Items a role cannot use are removed, not disabled.** A disabled nav item advertises something
the viewer cannot have and invites a support question. If they cannot go there, it is not there.

`NavItem` has no role or permission field: darksite does not know the product's access model, so
filtering is the consumer's job. Keep the rule beside the list and hand every surface the
filtered result:

```ts
const rules: Record<string, (viewer: Viewer) => boolean> = {
	settings: (viewer) => viewer.roles.includes('admin')
};
const visible = $derived(nav.filter((item) => rules[item.id]?.(viewer) ?? true));
```

## Rail or top bar

`AppShell` draws the one navigation list in one of two shapes, chosen by `nav`:

- **`rail`** (the default): a `NavRail` beside the page, and a `TabBar` on phones. For a product
  people work in all day, with many destinations — the rail holds a dozen without strain and can
  collapse to icons.
- **`top`**: a `TopNav` bar across the top, for a product with a few top-level sections. Items
  without a group are links in the bar; each group becomes a menu of links ("Records ▾"); an item's
  `section` lays its group's menu out in columns under headings, and its `description` is a second
  line under the link. On phones
  the bar keeps the product name and a menu button that opens a `Sheet` with every destination,
  grouped, and the account block. `navActions` fills the bar's right end (a sign-in, a mode
  picker); the account block sits there too, in its compact form. A global search belongs in
  `headerActions`: on a page with no level-1 header the TopNav holds it, and on a phone it
  collapses to an icon beside the menu button. `contentWidth` caps the page and the bar's contents
  at one width for a site that reads better centered.

Either shape takes an optional `footer` (a version, a few links) under every page but a full-bleed
one. Pick by the number of destinations and how people move between them, not by whether the
product is public: a public site can have a rail, and an admin tool with four sections a top bar.

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
- **Widths are the override point.** A product may set `--ds-rail-w-expanded` to widen the
  expanded rail for longer labels (240px, say). The collapsed `--ds-rail-w` stays at 56px, so the
  40×36 items still fit.
- The collapse state is **remembered per viewer** (`rememberAs`, or a full `storageKey` to keep a
  key the product already uses). With no stored preference it starts expanded at `expandAt`
  (default `ds-bp-rail`, 1440px) and collapsed below; `expandAt={false}` starts it collapsed at any
  width and keeps the toggle. Width animates over `ds-dur-base`, and not at all under reduced
  motion.
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

## Header actions

A shell-wide control that should share the line with each page's title instead of taking a row of
its own — typically global search — is `AppShell`'s `headerActions` snippet. Every level-1
`PageHeader` renders it right-aligned, ahead of the page's own actions, so the page's primary
button stays right-most; `/` focuses its first field. On phones, or when the header lacks room, it
collapses to an icon button that opens a full-width row under the header (so does `/`); Esc or a
navigation closes it. A page with no level-1 `PageHeader` shows it in the `TopBar` instead (or a
slim bar the shell adds); `headerActionsFallback={false}` turns that off. Details are in the
`AppShell` card.

Give a shell-wide search one home: `headerActions`, a `TopBar` or the rail's search slot. A search
across several kinds of thing (people, records, docs) is a `SearchPalette`, opened from a Button in
the bar and by `searchShortcut`; then the bar's search is its trigger, not a field.

## Stacking order

Assign these centrally, not at each call site:

| Layer | Token | z-index |
|---|---|---|
| A sticky table header inside its scroller | `--ds-z-raised` | 1 |
| Sticky `PageHeader`, sticky `ActionBar`, the phone `TabBar` | `--ds-z-sticky` | 20 |
| `TopBar` | `--ds-z-topbar` | 21 |
| `HelpTip`, the collapsed `NavRail` label tooltip | `--ds-z-tooltip` | 50 |
| `Popover`, the `Combobox` list | `--ds-z-popover` | 60 |
| `Toaster` | `--ds-z-toast` | 70 |
| The `AppShell` skip link | `--ds-z-skip` | 90 |

`Dialog` and `Sheet` are native modal `<dialog>` elements in the browser's top layer, above every
z-index, so they need no token; neither does their scrim (`::backdrop`). A product's own layer
reuses one of these tokens, or sits between two of them as a `calc()` of one, never a literal.

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

### Above a modal: `topmost`

A z-index cannot lift anything above an open `Dialog` or `Sheet`. Both are native modal
`<dialog>`s in the browser's top layer, and while one is open the HTML spec makes everything
outside the topmost modal's subtree **inert** — a higher z-index, or a popover shown later, can
still paint above it but cannot be clicked, focused or reached by a screen reader. Inertness follows
the DOM tree, not the paint order, so the only spec-correct fix is to put the element inside the
modal.

That is what the `topmost` attachment does. While a modal is open it moves the element into the
topmost open modal dialog; when that modal closes it moves to the next one down, and when none is
open it goes back to its own place. Inside the dialog it is part of the focus trap, so Tab reaches
it, and its live regions are announced.

```svelte
<script>
	import { topmost } from 'darksite';
</script>

<div>
	<aside class="update-notice" {@attach topmost}>A new version is available. …</aside>
</div>
```

- The **`Toaster`** uses it by default (`topmost={false}` opts out), so a toast pushed while a
  Sheet is open shows above the Sheet and its action still works.
- Use it for **app-level persistent notices** that must stay reachable whatever is open: an update
  prompt, a lost-connection notice, a privacy screen. Not for page content.
- The element keeps its `position: fixed` geometry: a modal dialog is in the top layer, so a fixed
  descendant still positions against the viewport. That holds only while the dialog element has no
  `transform`, `filter`, `will-change: transform` or `contain` — so `Dialog` and `Sheet` animate
  their inner panel, never the dialog element. Don't add those to a dialog through `class`.
- Attach it to an element whose parent is a plain element you render, not to a component's or an
  `{#if}` block's first or last node: the element travels, a placeholder keeps its place.

### The modal stack

Every `Dialog` and `Sheet` registers while open, so the app can ask what is open:

```js
import { modals } from 'darksite';

modals.open; // a modal or sheet is open
modals.count; // how many
modals.dirty; // an open Dialog or Sheet was given `dirty`
```

All three are reactive and read-only. Use `modals.dirty` to postpone a reload, an update or a
navigation while the user is mid-edit, and `onbeforeclose` on the `Sheet` or `Dialog` itself to
keep it open (return `false`) while you ask. A modal of your own that calls `showModal()` joins
the stack with `trackModal(dialog, { dirty })`, which returns the function that leaves it.

A `Menu` or a desktop `Popover` is a non-modal popover, not a modal, so it does not count and
does not make the page inert.

### A modal that is not a `<dialog>`

`trackModal` and `topmost` take any element, not only a `<dialog>`. A full-screen viewer drawn as a
`position: fixed` element that covers the page — rather than with `showModal()` — can join the
stack with `trackModal(el)` while it is open: `modals.open` and `modals.dirty` then count it, and
`topmost` moves the Toaster and any other notice into it, so they paint above the viewer inside its
stacking context instead of under its z-index. The same rule as a dialog's holds: the element must
have no `transform`, `filter`, `will-change: transform` or `contain`, or a fixed notice inside it
positions against it rather than the viewport.

What such an element does not get is a dialog's modality: nothing outside it is inert, so focus,
Esc and the screen reader's view of the page behind are its own job. Prefer a `<dialog>` with
`showModal()` (or `Lightbox`) when you can; use this for a viewer that cannot be one.
