# SeverityBadge

A severity, drawn the same way everywhere: the **name** on the stop's tinted ground with a 3px
mark inlaid on the left edge. Never the index.

Optionally the 5-pip position bar, which shows how far up the scale this stop sits — pips up to
and including it are lit in its mark color, the rest are `ds-sev-off`.

## What the consumer provides

- `severity` — `info` | `low` | `medium` | `high` | `critical`.
- `size` — `default` (22px: lists, panels, detail headers) or `sm` (20px: overlaid on a `Card`
  thumbnail, or inline in a dense table row).
- `pips` (default false) — add the position bar. Detail panels only; a card row has no room.

Colors come from `ds-sev-<stop>`, `-bg` and `-ink`; the order and the names come from a single
module, not from the call site.

## Unset is not a stop

`null` renders **nothing** — no badge, no placeholder word. Where a row must still show the
column, draw the mark area in `ds-sev-off` and leave the label empty. Do not invent a sixth stop
called "None": it would sort into the scale and change what the ramp means.

## Don't

- Don't render the index instead of the name.
- Don't recolor one stop; the three tokens per stop are the whole design.
- Don't use a severity color for anything that is not a severity.
