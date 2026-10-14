# Timeline

An audit or activity history, on a detail page or a dashboard.

## Entries

Each row is a sentence: actor, verb, object — "A. Rivera assigned R-00412 to M. Lund". The object
is text, or parts where `{ code }` marks an identifier, which renders in mono. An optional `detail`
line follows in 13px `ds-text-3`. A **system actor** — a sync job, an import — sets `source`
instead of `actor` and shows as a `SourceBadge`.

The **time** sits on the right: relative under seven days ("6 min ago"), an absolute date after
that, with the exact date, time and time zone in a tooltip — the system's dates-and-times rule.

## Batching

Consecutive entries with the same actor, verb and `batchKey` collapse into one row — "M. Lund set
55 records to Ready" — with a "Show 55" disclosure for the individual entries. `batchSummary`
words the collapsed object (default "N items").

## Length

The timeline shows a recent slice — `limit` rows, with a batch counting as one — and a "Show all"
link to the full history (`allHref`). Never an unbounded list.

## What the consumer provides

`entries` (newest first: `{ id, at, actor?, source?, verb, object?, detail?, batchKey? }`),
`limit` (default 10), `allHref`, `batchSummary(entries)`, `entry` snippet (custom rendering of a
single entry), `now`, `label` (default "History").

## Don't

- Don't show raw stored codes as the verb or object — map them to words once, in one place.
- Don't render the whole history inline.
