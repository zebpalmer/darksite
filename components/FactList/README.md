# FactList

Label–value pairs for a detail pane: the facts about one record. A native description list
(`<dl>`, with a `<dt>` and `<dd>` per pair), so assistive technology reads each label with its
value.

## Geometry

Each pair is one row: the label in 13px `ds-text-3` in a 128px column (`--ds-facts-label`), the
value in 14px `ds-text-1` beside it, 6px of vertical padding and no dividers. Values wrap rather
than truncate — a fact is read, not scanned. `mono` values (identifiers, serials, hashes, paths)
take the mono face with tabular figures.

The list lays itself out from **its own width** (a container query, never the viewport):

- **560px and wider:** two columns of pairs (`columns={2}`, the default). A `wide` fact — a note,
  an address — spans both.
- **Below 560px:** one column.
- **Below 320px:** each label stacks above its value.

`columns={1}` keeps one column at any width.

## In a Pane

Put it straight in an **unpadded** `Pane`: the pane hands it its inset (`--ds-facts-inset: 14px`
at the sides, `--ds-facts-inset-block: 8px` above and below, which with each pair's 6px puts the
first label 14px under the header), the same way it hands a `Table` its inset. A `padded` Pane sets
both back to 0, so a FactList among prose or a form lines up with them. Outside a pane both are 0;
set them on a wrapper to inset the list elsewhere.

```svelte
<Pane title="Details">
  <FactList {items} />
</Pane>
```

## Missing values

A `null`, `undefined` or `''` value renders the `Missing` mark: an em dash in `ds-text-3`,
announced as "No value". Override the mark with `missing`.

## What the consumer provides

`items` — `{ key?, label, value?, mono?, tip?, wide?, cell? }[]`. `key` defaults to `label` and must be unique, so give repeated labels a `key`; `tip`
puts a `HelpTip` beside the label; `cell` is a snippet for a value that is not text (a
`StatusBadge`, a link, a person), receiving `{ item, value }` — so one snippet can format several
items. Then `columns`, `cell` (a fallback snippet for every item without its own, receiving the
same `{ item, value }`), `missing`, `class`.

```svelte
{#snippet date({ value })}{#if value}{formatDate(value)}{:else}<Missing />{/if}{/snippet}

<FactList items={[
  { label: 'Opened', value: record.opened, cell: date },
  { label: 'Due', value: record.due, cell: date }
]} />
```

An item's own `cell` runs even when its value is empty, so a snippet that formats a value should
render `<Missing />` for an empty one.

Format values before passing them: `formatDate` for a calendar date, `formatMoney`,
`formatNumber`, a label map for stored codes.

## Don't

- Don't use it for rows of many records — that is a `Table`.
- Don't put controls in it; editing a record is a `Sheet` with `Field`s.
- Don't write sentences as labels. A label is a noun: "Owner", "Due".
