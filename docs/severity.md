# Severity

The system's one ordered scale: **Info, Low, Medium, High, Critical**. Use it for anything that
ranks — a risk level, an alert class, a data-classification level, a review outcome — and use it
the same way everywhere, because an ordered scale is only readable if it never moves.

| Stop | Mark token | Cut from |
|---|---|---|
| Info | `ds-sev-info` | a cool slate of its own, so the mildest stop is not a positive judgment |
| Low | `ds-sev-low` | the success ramp |
| Medium | `ds-sev-medium` | the warning ramp |
| High | `ds-sev-high` | the error ramp: the same color as `ds-danger` in dark, one stop deeper in light |
| Critical | `ds-sev-critical` | a plum past the end of the error ramp: the one stop worse than danger |

High and `ds-danger` part company in light on purpose. High's mark is a mark, so in light it takes
`color-error-600` to hold 3:1 on the grounds (3.7:1 and up). `ds-danger` is also a *fill* — the
solid danger button, under `ds-danger-contrast` text — and on `color-error-600` that text would drop
to 4.4:1, so `ds-danger` stays on `color-error-500` in both themes.

Each stop has three tokens: `ds-sev-<stop>` (the mark), `-bg` (the tinted ground) and `-ink` (text
on that ground, at least 4.5:1 in both themes). `ds-sev-off` is an unlit pip.

## Rules

- **Always the name, never the index.** Digits appear only on the 1–5 key caps.
- **Cards:** `SeverityBadge size="sm"`, with its 3px left mark. **Pickers:** `SeverityPicker`,
  segments in order with a 3px bottom mark. **Detail panels:** `SeverityBadge pips` — the badge
  plus the 5-pip position bar.
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
