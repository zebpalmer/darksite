# ChoiceTiles

Pick **one** of a set of things that each carry a line of state: the unit to work on, the site to
report from, the queue to take items from, the operator on shift. Each tile is the thing's name, one
meta line saying what it holds or is doing now, and an optional state badge — so the choice and its
consequence are read together.

A real radio group: one tab stop (the chosen tile, or the first enabled one), the arrow keys move
*and* select, Home and End jump to the ends, disabled tiles are skipped.

## Geometry

The tiles sit in a grid driven by the group's **own width**: as many columns as fit at `min` (160px
by default), stretching to fill the row. No viewport breakpoints. A tile is `ds-bg-2` with a
`ds-border` edge at `ds-radius-md`; hover `ds-bg-4`. It is **56px** tall with a meta line, 44px
without, and at least 44px on touch.

- **Label** in `body` at 500, `ds-text-1`; **meta** in `meta`, `ds-text-3` (`ds-text-2` when
  chosen). Both are one line with an ellipsis and a `title`.
- **Icon** (optional, Lucide) 18px in `ds-text-2`, `ds-accent-text` when chosen.
- **Status** (optional) is a `StatusBadge` at the trailing edge: "In use", "Service".
- **Chosen** is `ds-accent-tint` with a `ds-accent` edge and a 16px check in `ds-accent-text`, so
  the choice is never carried by color alone.

## ChoiceTiles, SegmentedControl, Radio or Combobox

| The options… | Use |
|---|---|
| are 2–7 short words, a setting or a view | `SegmentedControl` |
| are things with a state worth reading before choosing, up to a screenful | `ChoiceTiles` |
| sit in a form with long labels | `Radio` in a fieldset |
| are many, or searched | `Combobox` |

## What the consumer provides

`options` (`ChoiceTile[]`: `{ value, label, meta?, icon?, status?: { label, tone? }, disabled? }`),
`value` (bindable), `onchange(value)`, `label` (the group's name), `id`, `aria-labelledby`,
`aria-describedby` (from a `Field`), `min` (px), `class`. A value is a string, a number, a boolean
or `null`, each distinct.

## Don't

- Don't use it for several choices at once — that is checkboxes or `Chip`s.
- Don't put a second line of meta or a control inside a tile; the tile is the control.
- Don't use it for navigation; a tile that goes somewhere is a `LinkCard`.
- Don't make a screen of more than about a dozen tiles; past that, it is a `Combobox`.
