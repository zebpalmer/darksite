# Menu

A short list of actions on one thing: a detail page's **Actions** menu, a row's overflow menu.
`role="menu"` with `menuitem`s, opened from a `Button`.

**Non-modal**, like `Popover`: Esc or a press outside closes it. It opens in the browser's top
layer, so no `overflow: hidden` ancestor can clip it, positioned beside its trigger and kept in the
viewport. Below 768px it rises from the bottom as a sheet with 44px rows and a scrim.

## Keys

↓ / ↑ move (wrapping), Home / End jump, a letter jumps to the next item starting with it, Enter or
Space activates, Esc closes and returns focus to the trigger, Tab closes and moves on. From the
trigger, ↓ / Enter / Space open on the first item and ↑ on the last.

## Items

32px rows (44 on touch): a 16px leading icon, the label, and an optional trailing `KeyCap`.
`{ separator: true }` draws a rule; `{ group: 'Title' }` starts a titled group (12px `ds-text-3`,
sentence case, announced as a group).

- **Danger** (`tone: 'danger'`) — `ds-danger-text`. Its `onselect` opens the `Dialog` that
  confirms it; the menu never deletes directly.
- **Disabled** — stays visible and focusable, at 45%, with its `reason` as the tooltip and the
  accessible description. In an actions menu the reason is the useful part. (Navigation is
  different: there, an item a role cannot use is removed.)
- **Needs a note** (`needsNote`) — a small trailing icon, announced as "(asks for a note)", so the
  operator knows before choosing it.

Activating an item closes the menu and returns focus to the trigger **before** `onselect` runs, so a
Dialog it opens takes focus cleanly.

## What the consumer provides

`trigger` snippet — it receives the attributes to spread onto your Button
(`{#snippet trigger(attrs)}<Button {...attrs}>Actions</Button>{/snippet}`); `items`
(`{ id, label, icon?, keycap?, tone?, disabled?, reason?, needsNote?, onselect }`, plus separators
and groups); `label` (the menu's accessible name); `open` (bindable); `placement` (default
`bottom-end`); `class`.

## Don't

- Don't nest submenus.
- Don't remove an action a role cannot use without saying why — disable it with its reason.
- Don't put navigation in a Menu; that is the rail or a `SideNav`.
- Don't use a Menu for a choice of value — that is a `SegmentedControl`, `Radio` or `Combobox`.
