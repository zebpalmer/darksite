<script lang="ts" module>
	/** A labeled stop under a Slider's track. */
	export interface SliderTick {
		value: number;
		/** Default: the value, through `format`. */
		label?: string;
	}
</script>

<!--
@component
Slider — a value picked from a range by dragging: a threshold, a zoom level, a time window. Built on
the native `<input type="range">`, so the keyboard (←/→ and ↑/↓ by a step, PageUp/PageDown, Home
and End), forms and assistive technology work as the platform does. A 4px `ds-bg-5` track with an
accent fill up to a 16px accent thumb (24px on touch, in a 44px row), optionally the value beside it
and labeled ticks under it.

Sit it in a `Field` and spread the Field's `{ id, describedBy, invalid }` onto it; outside one, give
it a `label`.

- `value` (bindable), `min` (default 0), `max` (default 100), `step` (default 1), `ticks` (numbers,
  or `{ value, label? }`; labeled stops under the track), `showValue` (the value in mono beside the
  track), `format(value)` (for the shown value and tick labels), `valuetext(value)` (what a screen
  reader hears; default: a tick's label at that value, else `format`), `label`, `id`,
  `describedBy`, `invalid`, `disabled`, `name`, `oninput(value)`, `onchange(value)` (on release),
  `class`.

A precise number is an `Input` or a `Stepper`; a choice among a few named options is a
`SegmentedControl`.
-->
<script lang="ts">
	interface Props {
		value?: number;
		min?: number;
		max?: number;
		step?: number;
		ticks?: readonly (number | SliderTick)[];
		showValue?: boolean;
		format?: (value: number) => string;
		valuetext?: (value: number) => string;
		label?: string;
		id?: string;
		describedBy?: string;
		invalid?: boolean;
		disabled?: boolean;
		name?: string;
		oninput?: (value: number) => void;
		onchange?: (value: number) => void;
		class?: string;
	}

	let {
		value = $bindable(0),
		min = 0,
		max = 100,
		step = 1,
		ticks = [],
		showValue = false,
		format = (v: number) => v.toLocaleString(),
		valuetext,
		label,
		id,
		describedBy,
		invalid = false,
		disabled = false,
		name,
		oninput,
		onchange,
		class: className = ''
	}: Props = $props();

	const uid = $props.id();
	const inputId = $derived(id ?? `${uid}-range`);
	const span = $derived(max > min ? max - min : 1);
	const ratio = (v: number) => Math.min(1, Math.max(0, (v - min) / span));
	const stops = $derived(
		ticks.map((t) => {
			const tick = typeof t === 'number' ? { value: t } : t;
			return { value: tick.value, label: tick.label ?? format(tick.value), at: ratio(tick.value) };
		})
	);
	const spoken = $derived(
		valuetext?.(value) ?? stops.find((s) => s.value === value)?.label ?? format(value)
	);
</script>

<div
	class="ds-slider {className}"
	data-disabled={disabled ? '' : undefined}
	data-ticks={stops.length ? '' : undefined}
	style:--at={ratio(value)}
>
	<div class="track">
		<span class="rail" aria-hidden="true"><span class="fill"></span></span>
		<input
			id={inputId}
			type="range"
			{name}
			{min}
			{max}
			{step}
			{disabled}
			aria-label={label}
			aria-describedby={describedBy}
			aria-invalid={invalid ? 'true' : undefined}
			aria-valuetext={spoken}
			bind:value
			oninput={(e) => oninput?.(Number(e.currentTarget.value))}
			onchange={(e) => onchange?.(Number(e.currentTarget.value))}
		/>
		{#if stops.length}
			<span class="ticks" aria-hidden="true">
				{#each stops as stop (stop.value)}
					<span
						class="tick"
						data-edge={stop.at === 0 ? 'start' : stop.at === 1 ? 'end' : undefined}
						style:--at={stop.at}>{stop.label}</span
					>
				{/each}
			</span>
		{/if}
	</div>
	{#if showValue}<output class="value" for={inputId}>{format(value)}</output>{/if}
</div>

<style>
	.ds-slider {
		--thumb: 16px;
		--row: var(--ds-h-default);
		display: flex;
		align-items: flex-start;
		gap: 12px;
		min-width: 0;
		width: 100%;
	}
	@media (pointer: coarse) {
		.ds-slider {
			--thumb: 24px;
			--row: var(--ds-h-touch);
		}
	}
	.ds-slider[data-disabled] {
		opacity: 0.45;
	}
	.track {
		position: relative;
		flex: 1;
		min-width: 0;
		height: var(--row);
	}
	[data-ticks] .track {
		margin-bottom: 20px;
	}
	/* The thumb's center travels from half a thumb in to half a thumb from the end. */
	.rail {
		position: absolute;
		top: calc(50% - 2px);
		left: 0;
		right: 0;
		height: 4px;
		border-radius: var(--ds-radius-full);
		background: var(--ds-bg-5);
		pointer-events: none;
	}
	.fill {
		display: block;
		width: calc(var(--thumb) / 2 + (100% - var(--thumb)) * var(--at));
		height: 100%;
		border-radius: inherit;
		background: var(--ds-accent);
	}
	input {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		margin: 0;
		background: transparent;
		appearance: none;
		-webkit-appearance: none;
		cursor: pointer;
	}
	input:disabled {
		cursor: not-allowed;
	}
	/* The ring goes on the thumb, not on the whole row. */
	input:focus-visible {
		outline: none;
	}
	input::-webkit-slider-runnable-track {
		height: 100%;
		background: transparent;
	}
	input::-moz-range-track {
		background: transparent;
	}
	input::-webkit-slider-thumb {
		width: var(--thumb);
		height: var(--thumb);
		/* Centers the thumb on the row: the track pseudo-element is the row's full height. */
		margin-top: calc((var(--row) - var(--thumb)) / 2);
		border: 0;
		border-radius: 50%;
		background: var(--ds-accent);
		-webkit-appearance: none;
		appearance: none;
	}
	input::-moz-range-thumb {
		width: var(--thumb);
		height: var(--thumb);
		border: 0;
		border-radius: 50%;
		background: var(--ds-accent);
	}
	input:focus-visible::-webkit-slider-thumb {
		outline: 2px solid var(--ds-focus);
		outline-offset: 2px;
	}
	input:focus-visible::-moz-range-thumb {
		outline: 2px solid var(--ds-focus);
		outline-offset: 2px;
	}
	input:hover:not(:disabled)::-webkit-slider-thumb {
		background: var(--ds-accent-strong);
	}
	input:hover:not(:disabled)::-moz-range-thumb {
		background: var(--ds-accent-strong);
	}
	.ticks {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		height: 20px;
		pointer-events: none;
	}
	.tick {
		position: absolute;
		top: 2px;
		left: calc(var(--thumb) / 2 + (100% - var(--thumb)) * var(--at));
		color: var(--ds-text-3);
		font-size: var(--ds-text-xs);
		line-height: var(--ds-lh-xs);
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
		transform: translateX(-50%);
	}
	.tick[data-edge='start'] {
		left: 0;
		transform: none;
	}
	.tick[data-edge='end'] {
		left: auto;
		right: 0;
		transform: none;
	}
	.value {
		flex: none;
		min-width: 4ch;
		color: var(--ds-text-1);
		font-family: var(--font-mono);
		font-size: var(--ds-text-sm);
		line-height: var(--row);
		font-variant-numeric: tabular-nums;
		text-align: end;
	}
</style>
