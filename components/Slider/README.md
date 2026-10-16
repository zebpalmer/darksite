# Slider

A value picked from a range by dragging: a threshold, a zoom level, a time window, a level of
detail. Built on the native `<input type="range">`, so the keyboard (← / → and ↑ / ↓ by a step,
PageUp / PageDown, Home and End), forms and assistive technology work as the platform does.

## Geometry

A 4px `ds-bg-5` track with rounded ends, an accent fill up to a 16px accent thumb, in a 32px row.
Under `(pointer: coarse)` the thumb is 24px and the row 44px. The focus ring sits on the thumb.

- **`showValue`**: the value beside the track in 13px mono with tabular figures, in an `<output>`.
- **`ticks`**: labeled stops under the track (12px `ds-text-3`), each under the thumb's position at
  its value; the first and last align to the ends rather than overhanging them. Give a tick a
  `label` to name it ("Normal"), or let `format` write its value.

## Accessibility

Sit it in a `Field` and pass the Field's `id`, `describedBy` and `invalid`; outside one, give it a
`label`. A screen reader hears `valuetext(value)`, or a tick's label at that value, or the formatted
value: "Normal", "1.5×".

## What the consumer provides

`value` (bindable), `min` (default 0), `max` (default 100), `step` (default 1), `ticks` (numbers or
`{ value, label? }`), `showValue`, `format(value)`, `valuetext(value)`, `label`, `id`,
`describedBy`, `invalid`, `disabled`, `name`, `oninput(value)`, `onchange(value)` (on release),
`class`.

```svelte
<Field label="Zoom">
  {#snippet children(f)}
    <Slider id={f.id} describedBy={f.describedBy} bind:value={zoom} min={0.5} max={2} step={0.25}
      ticks={[0.5, 1, 1.5, 2]} format={(v) => `${v}×`} showValue />
  {/snippet}
</Field>
```

## Don't

- Don't use it for a precise number; that is an `Input` or a `Stepper`.
- Don't use it for a few named options; that is a `SegmentedControl`.
- Don't act on every `oninput` when acting is expensive; act on `onchange`.
