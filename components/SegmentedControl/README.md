# SegmentedControl

Pick one of 2–7 mutually exclusive options. Grid density, Card/Bulk, a rating floor, a
three-way Include / Don't care / Exclude. **Never a dropdown for these** — and never for severities,
which have their own `SeverityPicker`.

It is a real radio group: one tab stop, ←/→ move *and* select, Home/End jump to the ends.

The container is `ds-bg-2` with a `ds-border-subtle` edge, `ds-radius-md` and 2px of padding; the
selected segment is `ds-bg-4` with `ds-text-1`, the rest `ds-text-3`. Wider than its container, the
strip scrolls sideways rather than letting labels overprint each other.

## What the consumer provides

`options` — `{ value, label, icon?, keycap?, count?, disabled?, title? }[]`. `label` is required
even with an icon: it is the accessible name, and `iconOnly` only hides it visually.
Then `value` (bindable), `onchange(value)`, `label` (the group's `aria-label`), `size` (`dense` 22
| `default` 26 inside the padded strip; 38 on touch, giving the 44px target), `full` (stretch the
segments and ellipsize their labels), `iconOnly`, `id`, `aria-labelledby`, `aria-describedby`,
`class`. Generic over the value type. `label` is required unless `aria-labelledby` names the group.

## In a Field

Let the Field's label name the group — a `<label for>` names only a single native control, so a
group takes the label's id instead:

```svelte
<Field label="View" tip="How the queue is shown">
  {#snippet children(f)}
    <SegmentedControl id={f.id} aria-labelledby={f.labelId} aria-describedby={f.describedBy}
      bind:value={view} {options} />
  {/snippet}
</Field>
```

## Don't

- Don't use it for more than seven options — that is a `Combobox`.
- Don't use it for severities.
- Don't hide the label on an icon-only segment without passing `label`.
