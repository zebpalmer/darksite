# Severity

The system's one ordered scale: **Info, Low, Medium, High, Critical**. Use it for anything that
ranks — a risk level, an alert class, a data-classification level, a review outcome — and use it
the same way everywhere, because an ordered scale is only readable if it never moves.

| Stop | Mark token | Cut from |
|---|---|---|
| Info | `ds-sev-info` | a cool slate of its own, so the mildest stop is not a positive judgment |
| Low | `ds-sev-low` | the success ramp — the same color as `ds-success` |
| Medium | `ds-sev-medium` | the warning ramp — the same color as `ds-warning` |
| High | `ds-sev-high` | the error ramp — the same color as `ds-danger` in both themes |
| Critical | `ds-sev-critical` | a plum past the end of the error ramp: the one stop worse than danger |

Low, Medium and High are the same colors as the `ds-success`, `ds-warning` and `ds-danger` marks in
both themes. A solid danger button does not use the mark: its ground is `ds-danger-fill`, kept
lighter so its label stays readable.

Each stop has three tokens: `ds-sev-<stop>` (the mark), `-bg` (the tinted ground) and `-ink` (text
on that ground, at least 4.5:1 in both themes). `ds-sev-off` is an unlit pip.

## Rules

- **Always the name, never the index.** Digits appear only on the 1–5 key caps, and the picker only
  shows them: binding the keys is the page's job (`hotkeys`).
- **Cards:** `SeverityBadge size="sm"`, with its 3px left mark. **Pickers:** `SeverityPicker`,
  segments in order with a 3px bottom mark. **Detail panels:** `SeverityBadge pips` — the badge
  plus the 5-pip position bar. **Table rows:** `rowSeverity` draws the stop's mark as a 3px leading
  stripe, and a `SeverityBadge` in a cell carries the word.
- **Selected** = the stop's `-bg` and `-ink` with its mark as the border. **Suggested** = a dashed
  mark border. **Idle** = neutral with the mark stripe at 55%.
- **Order and names come from one module**, not from each call site. Never write your own list.
- **Never use a severity color for anything that is not a severity.** That is what makes the
  scale legible at a glance.
- **`null` means unset**, and it looks unset: no badge, and `ds-sev-off` where a mark would be.
  Do not invent a sixth stop for "none".

## Hue is not the signal

The colors run cool → green → amber → red → plum, so the scale reads as a ramp in **lightness and
hue together**. But the badge and the picker segment **always carry the word**, so no meaning
rests on color alone, and Low/High are never a green and a red told apart by hue only.

Keep that property if you re-color the scale: a stop may change hue, but it must keep its word,
its ≥4.5:1 ink, and its position in the order.

## If you need more than five stops

Extend the ramp **past Critical** rather than subdividing the middle, and give every new stop its
own three tokens. Adding a stop between Medium and High re-colors everything already rated, which
is exactly the kind of silent change an ordered scale cannot survive.

## Custom scales

Severity is one instance of a general **ordinal scale**: ordered stops, each with a name and the
same three color roles. An app that needs another ordered scale — a priority P1–P4, a confidence
from Remote to Certain, a clearance level — defines it once with `defineScale` and draws it with
`ScaleBadge` and `ScalePicker`. `SeverityBadge` and `SeverityPicker` are those two components over
the built-in `severityScale`.

```ts
import { defineScale } from 'darksite';

export const priority = defineScale({
	name: 'Priority', // the picker's accessible label
	stops: [
		// lowest first; 2–9 stops
		{ value: 'p4', label: 'P4', mark: 'var(--app-p4)', bg: 'var(--app-p4-bg)', ink: 'var(--app-p4-ink)' },
		{ value: 'p3', label: 'P3', mark: 'var(--app-p3)', bg: 'var(--app-p3-bg)', ink: 'var(--app-p3-ink)' },
		{ value: 'p2', label: 'P2', mark: 'var(--app-p2)', bg: 'var(--app-p2-bg)', ink: 'var(--app-p2-ink)' },
		{ value: 'p1', label: 'P1', mark: 'var(--app-p1)', bg: 'var(--app-p1-bg)', ink: 'var(--app-p1-ink)' }
	],
	unknown: { value: 'untriaged', label: 'Untriaged' } // optional
});
```

The scale object is the one module the order and names come from: `label(v)`, `rank(v)` (1-based;
0 for unset and unknown), `vars(v)` (the three CSS values), `key(v)` and `fromKey(key, max)` (the
1–9 key caps; unknown is `0`, or no key at all with `unknown: { …, key: null }`), `options(max)` (what a picker shows under a ceiling), `highest(list)`
and `compare(a, b)`.

**Rules**

- **Extend past the end, never between stops.** A new stop goes above the highest (or below the
  lowest) with its own three colors. A stop inserted between two others re-ranks everything
  already rated.
- **Never reuse severity colors** for a custom scale, and never the `ds-sev-*` tokens. Give it its
  own colors (custom properties the app defines), ideally a hue severity does not use, so a
  priority never reads as a severity at a glance. The unlit pip defaults to the neutral
  `ds-border`.
- **The words carry it**, as with severity: a badge and a segment always show the name, never the
  index; key caps are the only digits.
- **`null` is unset**: no badge, no "None" stop. Unset sorts below the lowest stop.
- **Unknown is a stop, not unset.** It means "assessed, and cannot say". It is drawn with a
  **dashed mark** — the badge's left edge, the segment's bottom stripe — and it sits after the
  ordered stops. It has no rank: it is never under a `max` ceiling (the picker always offers it),
  never the `highest`, and it lights no pips. Its colors default to neutral roles
  (`ds-text-3`, `ds-bg-3`, `ds-text-2`). A dashed *border* on a segment still means suggested;
  the two never look alike.
- **At most nine ordered stops** (plus unknown). Beyond that it is not a scale people can read at
  a glance; use a `Combobox`.

**How the picker folds.** It answers to its own width, by the number of cells *n* it shows (the
stops under the ceiling, plus unknown). Key caps hide below *n* × 104px — or, with a fixed
`columns`, below `columns` × 104px, the width of the columns actually shown. Below *n* × 80px the
row folds to two balanced rows of ceil(*n*/2) columns: 4 + 4 for eight, 5 + 4 for nine, 3 + 2 for
severity's five. With seven or more cells, when even two rows would leave a cell under 80px, it
folds again to three rows of ceil(*n*/3) columns (3 + 3 + 3 for nine). Names never truncate.
`columns` fixes the count instead.

**Check your colors.** `scripts/check-contrast.mjs` checks the severity tokens in every theme;
darksite cannot check colors it does not own. A custom scale needs the same pairs: each stop's
ink on its ground at 4.5:1 (7:1 in the high-contrast theme), and each mark at 3:1 on `ds-bg-1`
and `ds-bg-3`. `checkScaleContrast` checks exactly those, in the browser, once per theme:

```ts
import { checkScaleContrast } from 'darksite';

const failing = checkScaleContrast(priority, { within: appRoot }).filter((r) => !r.ok);
```

In a test, pass `resolve` (a CSS value → a color, for example from your own theme map) instead
of reading the document.
