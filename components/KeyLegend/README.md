# KeyLegend

Every hotkey a view has, grouped, each a `KeyCap` beside its label. It is drawn from the **same
binding table** the view's key handler uses (`hotkeys.ts`), so the legend cannot drift from the
keys.

Put it in a `Popover` titled "Keyboard shortcuts" — which becomes a `Sheet` on phones by itself.
What opens it is the view's choice; `?` is the convention, bound in the same table.

## Binding tables

A view declares its keys as data:

```ts
import { buildHotkeyMap, installHotkeys, type HotkeyBinding } from 'darksite';

const bindings: HotkeyBinding<'next' | 'prev' | 'edit' | 'legend'>[] = [
  { keys: ['j', 'down'], action: 'next', label: 'Next record', group: 'Move' },
  { keys: ['k', 'up'], action: 'prev', label: 'Previous record', group: 'Move' },
  { keys: 'e', action: 'edit', label: 'Edit', group: 'Record', when: () => selected !== null },
  { keys: '?', action: 'legend', label: 'Show shortcuts', group: 'Help' }
];
const map = buildHotkeyMap(bindings);   // map.conflicts: test that it is empty
$effect(() => installHotkeys(map, run, { enabled: () => !dialogOpen }));
```

- **`keys`** follow the one token grammar (`shift+enter`, `g`, `?`, `ctrl+k`). A letter wears shift
  as a prefix — `g` and `shift+g` are different keys, and CapsLock changes neither. A punctuation
  key is its own character: `?`, not `shift+/`.
- **`when`** makes a binding live only while it returns true. Two bindings may share a key only if
  both carry `when`; otherwise `buildHotkeyMap` reports a **conflict**, comparing spellings
  canonically (`esc` and `escape` are one key). Keep a unit test that `conflicts` is empty.
- **`resolveHotkey(event, map)`** is pure: it returns the binding or `null`. It skips a press
  already handled (`defaultPrevented`), an IME composition, and anything typed into a text field
  unless the binding sets `allowWhileTyping` (`escape` to leave the field).
- **`installHotkeys(map, handler, { target, enabled, capture })`** listens on the window (or a
  given element) and returns the cleanup; a handled press is `preventDefault`ed unless the handler
  returns `false`. **`hotkeys(map, handler, options)`** is the same as an attachment, for keys that
  belong to one pane: `<section tabindex="-1" {@attach hotkeys(map, run)}>`.
- **`hidden`** leaves a binding out of the legend (a second path to an action already listed).

## What the consumer provides

`bindings` (the table, or the map), `order` (group names in legend order; others follow in table
order, ungrouped last), `activeOnly` (leave out bindings whose `when` is false right now),
`columns` (default true: groups flow into two columns when there is room), `label` (default
"Keyboard shortcuts"), `class`.

The caps are **content**, so they always show — also with key hints off and on phones.

## Don't

- Don't write a legend by hand next to a handler that has its own list. One table.
- Don't bind a key the browser or the OS owns (`ctrl+r`, `meta+w`, `ctrl+tab`).
- Don't ship a table with conflicts; resolve them, or make the bindings conditional.
