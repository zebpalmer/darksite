# Stat

A headline number for a dashboard or a report summary: a `label` (13px `ds-text-2`), the `value`
(24/500, tabular figures), an optional `unit` or "of N" (13px `ds-text-3`), and **one** `meta` line
(12px `ds-text-3`) that breaks the number down ("185 open · 78 in progress · 24 blocked").

`ds-bg-2` with a `ds-border-subtle` edge at `ds-radius-md`, 12px by 14px padding. No shadow, no
icon, no sparkline.

- **As a link** — `href` makes the whole tile a link: hover `ds-bg-3`, the focus ring. A stat that
  links nowhere should be rare.
- **Attention** — `severity` adds that stop's 3px leading stripe and a `SeverityBadge` in the meta
  line.
- **A level on the app's own scale** — `scale` (from `defineScale`) and `level` (a stop on it) add
  that stop's 3px leading stripe, the same way: dashed for the scale's unknown stop, which has no
  place on the ramp. Beside a `value` of its own, the stop's `ScaleBadge` goes in the meta line
  ("Coverage 92% · Likely"). **Leave `value` out and the stop's name is the value**: a "Status"
  stat reads "Good" on the stop's stripe, with no badge to say it twice. The name is always
  written, so the color is never the only signal. A level that is unset (`null`) or not on the
  scale shows no stripe and no badge, and a tile with no value of its own then shows the missing
  mark. `severity` wins over a level; give a tile one or the other.

  Severity and a scale level are the only ways to color a Stat.
- **A breakdown by level** — `scale` and `levels`, a list of `{ level, value }`, put a count per
  stop in the meta line: a tile "Needs attention: 6" reads "Medium 2 · Critical 4", each entry the
  stop's `ScaleBadge` and its count (`ds-text-2`, tabular), separated by a dot. Every badge names its
  stop, so the color is never the only signal.
  - **Order** comes from the scale, not the call site: lowest first, the unknown stop last. An
    entry whose level is not on the scale is dropped. A count of zero is shown, so leave a level
    out when it has none, unless the zero is the news.
  - **In a narrow tile** the entries wrap onto a second line, whole — a count is never cut off or
    truncated — and no line starts with a dot.
  - **The stripe** still comes from `severity` or `level` alone, never from the list: say which stop
    the tile stands for. For the worst one present, pass
    `level={scale.highest(levels.map((l) => l.level))}`.
  - `levels` **replace** the meta line's single badge (the severity's or the level's), since the
    list already shows that stop.
  - A `meta` follows the entries as the last one ("· since 09:00"), and it is the one that
    truncates.
  - To count severities, pass `scale={severityScale}`.

  ```svelte
  <Stat label="Needs attention" value={6} scale={severityScale} level="critical"
    levels={[{ level: 'medium', value: 2 }, { level: 'critical', value: 4 }]} />
  ```
- **A row** — put several in a `StatRow`: two to four across by the row's own width (2 below 560px,
  3 below 800px, then 4). Give it a `label` to name the group. For a row of five — four counts and
  their total — set `max={5}`: 2 below 560px, 3 below 960px, then all five, so the fifth never
  sits alone on a second line. For three, set `max={3}`: one per line below 480px, then all three
  across, so no empty slot is left at the end.

- **Headline** — `variant="headline"` is for a public page's key figures: the value at 28px in
  the headline-number weight (650, the one weight above 500 in the system), with the label under it
  in 13px `ds-text-2`. The label is still first in the markup, so it is read before the number.

A number `value` is localized (`12,408`); pass a string to format it yourself. A `null`,
`undefined` or `''` value shows the `Missing` mark (an em dash, announced "No value") and drops the
unit; `missing` changes the mark. Zero is a value, not a missing one.

## What the consumer provides

`label`, `value`, `unit`, `of`, `missing`, `meta` (text or a snippet), `href`, `severity`,
`scale` and `level`, `levels` (`StatLevel[]`: `{ level, value }`), `variant` (`default` | `headline`), `class`. On `StatRow`: `label`, `max` (`4` default | `3` |
`5`), `class`.

## Don't

- Don't put two numbers in `value`.
- Don't write a sentence in `meta`.
- Don't color a Stat any other way than `severity` or a scale `level`.
- Don't break a count down in `meta` text when it is by level; that is `levels`, so each stop is
  named and drawn the same way everywhere.
