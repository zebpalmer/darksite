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

**One `Toaster`**, mounted once at the root. Pages never render toasts themselves.
