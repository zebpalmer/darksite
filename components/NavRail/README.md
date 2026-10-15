# NavRail

The primary navigation, on `ds-bg-0`, full height, at `ds-bp-phone` and above. Below that it is
replaced by `TabBar`.

Items come from the **single navigation list** ([`shell.md`](../../docs/shell.md)), so the rail, the phone sheet and the
group headings never disagree.

## Collapsed and expanded

- **Collapsed** `ds-rail-w` (56px): 40×36 icon items. The label is one **fixed-position** tooltip
  — fixed rather than absolute, so a scrolling item list cannot clip it. It appears after ~300ms
  on hover and immediately on keyboard focus.
- **Expanded** `ds-rail-w-expanded` (208px): 32px rows with icon, label and badge, and the
  product's name beside its mark at the top.
- The width animates over `ds-dur-base`, and not at all under reduced motion.

The state is **remembered per viewer**. With nothing stored it starts expanded at `ds-bp-rail` and
collapsed below, so a laptop is tidy and a wide display is legible without anyone configuring
either.

The stored state is only known in the browser, so a server-rendered page paints the rail collapsed
and settles after hydration — without animating, since only a toggle animates. To paint the right
width from the start, keep the choice in a cookie as well and pass it as `expanded`.

### Keeping it collapsed

`pinned` hides the toggle and holds the rail at `expanded`. For a rail that is **always
collapsed** — a work view that needs every pixel — pass both and no `rememberAs`:

```svelte
<NavRail {items} expanded={false} pinned />          <!-- or AppShell railExpanded={false} railPinned -->
```

## Slots

Each slot receives `{ expanded, tip }`. `tip(label)` returns hover and focus handlers that show the
rail's own fixed tooltip while it is collapsed; spread them on the control.

- **`search`** — under the brand. Collapsed, an icon `Button` that opens the app's search (a
  command palette, a search page); expanded, the same button at full width or a search field.
  For apps without a `TopBar`; when there is one, search belongs there.
- **`status`** — in the footer above the toggle: a connection or sync state. Collapsed, a dot or
  icon with its words in `ds-sr-only` and the tooltip; expanded, the words beside it.
- **`badge`** — receives `{ item, expanded }` and replaces an item's count or dot: at the icon's
  corner collapsed, at the row's end expanded. It sits inside the item's link, so it must not be
  interactive; give it `ds-sr-only` words if it means something.

```svelte
<NavRail {items}>
  {#snippet search({ expanded, tip })}
    <Button variant={expanded ? 'secondary' : 'icon'} icon={Search} label="Search" full={expanded}
      onclick={openPalette} {...tip('Search')} />
  {/snippet}
</NavRail>
```

## Structure

Groups separated by a hairline and, when expanded, an 11px uppercase `ds-text-3` label. Active =
`ds-bg-4` + `ds-text-1` + a 2px `ds-accent` bar on the leading edge.

The item list **scrolls** on a short window and the current item scrolls into view; the bottom
block — notifications, the account avatar, the collapse toggle, the build version — stays put.

## What the consumer provides

```svelte
<NavRail {items} {groups} {current} product="Acme" {mark} rememberAs="main" bind:expanded>
  {#snippet footer({ expanded })}<AccountBlock compact={!expanded} />{/snippet}
</NavRail>
```

`items` (`NavItem[]`: `{ id, label, href, icon?, group?, badge? }`, where `badge` is a count or
`true` for a dot), `groups` (ordered `{ id, label }`), `current` (the active id), `expanded`
(bindable), `pinned`, `rememberAs` (a key; the state is kept in this viewer's browser), `product` and `mark`
(the brand at the top), `footer` snippet (receives `{ expanded }`), `search`, `status` and `badge` snippets, `version`, `label` (the
`<nav>`'s name, default "Primary"). Inside `AppShell` you pass these to the shell instead.

## Don't

- Don't disable an item a role cannot use — remove it.
- Don't put a search field here when there is a `TopBar` — search belongs there, on every page.
  The `search` slot is for apps without one.
- Don't use an absolutely positioned tooltip on the collapsed rail; it will clip.
