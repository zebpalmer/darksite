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
