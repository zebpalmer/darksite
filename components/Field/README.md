# Field

A label, a control and its help or error, wired for accessibility. Every form control in the system
sits in one.

The children snippet receives `{ id, describedBy, invalid }` — spread it onto the control and the
`for`/`id` pair, the `aria-describedby` and the invalid state are all correct:

```svelte
<Field label="Owner" error={err}>
  {#snippet children(f)}
    <Input id={f.id} aria-describedby={f.describedBy} invalid={f.invalid} />
  {/snippet}
</Field>
```

## What the consumer provides

- `label` (13px `ds-text-2`), `help` (12px `ds-text-3`), `error` (a 12px `ds-danger-text` message
  with an icon; it **replaces** help while present and sets the control's `invalid`), `required`
  (a `ds-danger-text` star), `disabled` (dims the whole field to 45%).
- `tip` — the field's explanation as a `HelpTip` beside the label instead of a sentence under the
  control. It still describes the control for a screen reader. **Prefer `tip` over `help`**: this
  system does not put explanatory sentences under controls.
- `layout` — `stack` (label above; the default, and forced on phones and touch) or `row` (a 96px
  label column beside the control, for a dense fields pane).
- `accessory` snippet — the right end of the label row: a key-cap hint, a "Clear" link.
- `under` snippet — content below the control: suggestion chips, alternatives, a revert row.
- `id` (generated otherwise), `class`.

## Don't

- Don't write an explanatory sentence under a control — use `tip`.
- Don't set `aria-describedby` yourself; take it from the snippet.
