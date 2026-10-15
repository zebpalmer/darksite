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
(bindable), `rememberAs` (a key; the state is kept in this viewer's browser), `product` and `mark`
(the brand at the top), `footer` snippet (receives `{ expanded }`), `version`, `label` (the
`<nav>`'s name, default "Primary"). Inside `AppShell` you pass these to the shell instead.

## Don't

- Don't disable an item a role cannot use — remove it.
- Don't put search here. Search belongs in `TopBar`, where it is on every page.
- Don't use an absolutely positioned tooltip on the collapsed rail; it will clip.
