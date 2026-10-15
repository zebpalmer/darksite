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
(`⇧Enter`, `Space`, `g`). A control with a cap also sets `aria-keyshortcuts`, so the shortcut is
announced and not merely drawn.

**Overlay and page-key etiquette:**

- Page hotkeys are ignored while focus is in an `input` or `textarea`.
- A handler that takes a key calls `preventDefault()`, and a global binding skips a key that is
  already `defaultPrevented`. A toast's key cap is a global binding: a page that owns the same key
  either calls `preventDefault()` in its own handler or mounts `<Toaster hotkeys={false}>`.
- `Popover` is non-modal, so page keys keep working while one is open.
- Esc closes the topmost overlay first. A `Combobox` swallows Esc only while its list is open, so
  the page's own Esc still works when it is closed.
- `Dialog` traps focus, locks scroll, is an `alertdialog`, and returns focus to its trigger.
  `initialFocus` is explicit (`cancel` by default) so a choice button in the body never steals it.
