# Textarea

Multi-line text in the control look: `ds-bg-3`, a `ds-border` edge at `ds-radius-sm`, 14px text, at
least 80px tall and resizable vertically. Hover, focus, invalid and disabled match `Input`.

It takes the same `Field` contract as `Input`:

```svelte
<Field label="Note" tip="Kept with the record's history.">
  {#snippet children(f)}
    <Textarea bind:value={note} id={f.id} describedBy={f.describedBy} invalid={f.invalid} />
  {/snippet}
</Field>
```

## What the consumer provides

`value` (bindable), `rows` (default 3), `invalid`, `mono` (paths, logs), `resize` (`vertical`
default | `none`), `describedBy`, `element` (a bindable ref), `class`, and any other `<textarea>`
attribute.

## Don't

- Don't use it for a single line; that is an `Input`.
- Don't set a font size: on a touch screen the global 16px rule keeps iOS from zooming.
