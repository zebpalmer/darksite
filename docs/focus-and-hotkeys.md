# Focus and hotkeys

These tools are used all day with a keyboard. Focus is never invisible and a hotkey is never secret.

**The focus ring is global and unlayered:**

```css
:focus:not(:focus-visible) { outline: none }
:focus-visible { outline: 2px solid var(--ds-focus); outline-offset: 2px }
```

It is unlayered on purpose — it has to beat any component library that resets outlines on its
inputs. Never remove it. A primitive may adjust the **offset** only: a `Card` thumbnail uses
3px, a `SegmentedControl` option 0, a `Tabs` tab -2px, a `HelpTip` 1px. For a control that cannot
use `outline`, `ds-focus-ring` is the same ring as a box-shadow.

**Every hotkey is visible** as a `KeyCap` next to the control it drives — the `keycap` prop on
`Button`, `Chip`, a `SegmentedControl` option or a toast action. Those are *hint* caps: they hide
when the user turns hints off (a per-user preference, `<html data-hints="off">`) and on phones.
A cap that **is** the content, as in a hotkey legend, passes `hint={false}` so it always shows.

**Key names follow one token grammar** (`shift+enter`, `space`, `g`), rendered by one formatter
(`⇧Enter`, `Space`, `g`). `+` joins the grammar, so the plus and minus keys are spelled `plus`
and `minus`; a lone `+` (or `shift++`) is read as `plus` too, and shows as `+`. A control with a
cap also sets `aria-keyshortcuts`, so the shortcut is announced and not merely drawn.

**A view's keys are a table, not a switch statement.** Declare them as data —
`{ keys, action, label, group, when? }` — and build the map once with `buildHotkeyMap`, which
reports any key claimed twice (`esc` and `escape` count as one). `installHotkeys` (or the
`hotkeys` attachment, for a pane) wires the map to a handler, and `KeyLegend` lists the same table
in a `Popover`, so the legend never drifts from the keys. Keep a unit test that the map has no
conflicts. A letter wears shift as a prefix — `g` and `shift+g` are two keys, and CapsLock changes
neither — while a punctuation key is its own character (`?`, not `shift+/`).

**A key that focuses a field** — `/` for search — is the `focusShortcut` attachment on the field's
container: it focuses the first field inside, under the same etiquette as page hotkeys below.
`TopBar` and the shell's header actions use it.

**Overlay and page-key etiquette:**

- Page hotkeys are ignored while focus is in an `input`, `textarea`, `select` or editable region,
  and when something earlier already handled the press (`defaultPrevented`). A binding that must
  work from a field — `escape` to leave it — says so with `allowWhileTyping`.
- A handler that takes a key calls `preventDefault()`. A toast's key cap is a global binding: a page
  that owns the same key either calls `preventDefault()` in its own handler or mounts
  `<Toaster hotkeys={false}>`.
- Never bind a key the browser or the OS owns (`ctrl+r`, `meta+w`, `ctrl+tab`).
- `Popover` is non-modal, so page keys keep working while one is open.
- Esc closes the topmost overlay first. A `Combobox` swallows Esc only while its list is open, so
  the page's own Esc still works when it is closed.
- `Dialog` traps focus, locks scroll, is an `alertdialog`, and returns focus to its trigger.
  `initialFocus` is explicit (`cancel` by default) so a choice button in the body never steals it.
