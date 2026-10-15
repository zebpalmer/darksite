# ScaleBadge

A stop on an ordinal scale, drawn the same way everywhere: the **name** on the stop's tinted
ground with a 3px mark inlaid on the left edge. Never the index. `SeverityBadge` is this badge
over the built-in `severityScale`; use `ScaleBadge` for a scale the app defines with
`defineScale` (see "Custom scales" in [`severity.md`](../../docs/severity.md)).

Optionally the position bar: one pip per ordered stop, lit in the stop's mark up to and including
it, the rest in the scale's unlit color (`ds-border` unless the scale says otherwise).

## What the consumer provides

- `scale` — a `Scale` from `defineScale`.
- `value` — a value on the scale, or `null` (unset).
- `size` — `default` (22px: lists, panels, detail headers) or `sm` (20px: overlaid on a `Card`
  thumbnail, or inline in a dense table row).
- `pips` (default false) — add the position bar. Detail panels only. 84px for five stops, wider
  for more, up to 128px.
- `class`.

Colors come from the scale's stops; the order and the names come from the scale, not from the
call site.

## States

- **A stop** — its `bg` and `ink` with the solid inlaid `mark`.
- **Unknown** — the scale's unknown stop: its mark is **dashed**, and it lights no pips, because
  it has no position on the ramp.
- **Unset** (`null`) — renders **nothing**. Do not invent a "None" stop.

## Don't

- Don't render the index instead of the name.
- Don't give a custom scale severity colors, or a severity a custom scale.
- Don't use the unknown stop for "not assessed yet"; that is `null`.
