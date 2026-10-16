# StatusBadge

A static, non-interactive state: a lifecycle stage, a hold, a marker such as "Primary". 22px tall
— it is not a control, so it does not grow on touch — with 7px inline padding, `ds-radius-xs`,
12/500 text and an optional 14px leading icon.

## Tones

| Tone | Look | For |
|---|---|---|
| `neutral` (default) | a `ds-border` edge, `ds-text-2` | ordinary states: Draft, Queued |
| `accent` | a `ds-accent` edge, `ds-accent-text` | a marker: Primary, Default |
| `success` · `warning` · `danger` | the role's `-tint` ground and `-text` ink | Ready · On hold · Failed |
| `muted` | a subtle edge, `ds-text-3` | out of service: Retired, Archived |

**Never severity colors.** An ordered scale is a `SeverityBadge`.

## Duration

`since` renders "· 12 days" after the label in mono — for a hold, or any state that ages — and
puts the exact start in the tooltip. Screen readers hear "On hold, for 12 days".

## Due dates

`until` counts against a due date, in whole days in the viewer's time zone: "· in 3 days",
"· in 1 day", "· due today", then "· 1 day overdue", "· 2 days overdue". A bare calendar date
(`'2026-10-17'`) is that day wherever the viewer is. The tooltip holds the due date; screen readers
hear "Review, due in 3 days".

**The overdue tone rule:** with `until` and no `tone`, the badge takes its tone from the date —
`danger` once overdue, `warning` on the due day, `neutral` before. An explicit `tone` always wins,
for a state whose own tone matters more (a `success` "Done" never turns red). The words carry the
meaning; the tone only helps the eye find it.

## What the consumer provides

`label` (or children), `tone`, `icon`, `since`, `until`, `now` (the reference time for both;
defaults to now), `class`.

## Don't

- Don't make it clickable; a clickable state is a `Chip`.
- Don't give it a dashed edge; dashed means not confirmed.
