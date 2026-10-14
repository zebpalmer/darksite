# Stat

A headline number for a dashboard or a report summary: a `label` (13px `ds-text-2`), the `value`
(24/500, tabular figures), an optional `unit` or "of N" (13px `ds-text-3`), and **one** `meta` line
(12px `ds-text-3`) that breaks the number down ("185 open · 78 in progress · 24 blocked").

`ds-bg-2` with a `ds-border-subtle` edge at `ds-radius-md`, 12px by 14px padding. No shadow, no
icon, no sparkline.

- **As a link** — `href` makes the whole tile a link: hover `ds-bg-3`, the focus ring. A stat that
  links nowhere should be rare.
- **Attention** — `severity` adds that stop's 3px leading stripe and a `SeverityBadge` in the meta
  line. It is the only way to color a Stat.
- **A row** — put several in a `StatRow`: two to four across by the row's own width (2 below 560px,
  3 below 800px, then 4). Give it a `label` to name the group.

A number `value` is localized (`12,408`); pass a string to format it yourself.

## What the consumer provides

`label`, `value`, `unit`, `of`, `meta` (text or a snippet), `href`, `severity`, `class`.

## Don't

- Don't put two numbers in `value`.
- Don't write a sentence in `meta`.
- Don't color a Stat any other way than `severity`.
