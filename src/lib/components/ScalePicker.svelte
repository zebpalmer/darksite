<!--
@component
ScalePicker — pick a stop on an ordinal scale: the stops in scale order, each with a 3px mark
stripe, so the row reads as the ramp. A radio group (←/→ move and select, Home/End jump).

Selected: the stop's tinted ground and ink with its mark as the border. Suggested: a dashed
border, not applied. Unknown: its stripe is dashed, and it sits after the ordered stops. Idle:
ds-bg-3 with the stripe at 55%. 40px tall, 48 on touch.

It answers to its own width, by the number of cells n: key caps hide below 104px a column (n ×
104px, or `columns` × 104px with a fixed `columns`), then the row folds to two balanced rows
(ceil(n / 2) columns) below n × 80px, and with seven or more cells to three rows (ceil(n / 3)
columns) when two rows would still be under 80px a cell. Never truncating names.

- `scale`, `value` (bindable; `null` is unset), `onchange(value)`, `suggested`, `max` (stops
  above it are hidden, not disabled; unknown stays), `keycaps` (show 1–9, and the unknown key unless
  the scale gives it none),
  `counts` (per stop), `columns` (`auto` | a number), `controlled` (a click only calls
  `onchange`), `label` (default: the scale's name), `class`. In a Field, pass `id`,
  `aria-labelledby={f.labelId}` and `aria-describedby={f.describedBy}` so the Field names it.
-->
<script lang="ts" generics="V extends string">
	import KeyCap from './KeyCap.svelte';
	import type { Scale } from '../scale.js';

	interface Props {
		scale: Scale<V>;
		value?: V | null;
		onchange?: (value: V) => void;
		suggested?: V | null;
		max?: V | null;
		keycaps?: boolean;
		counts?: Partial<Record<V, number>>;
		columns?: 'auto' | number;
		controlled?: boolean;
		label?: string;
		id?: string;
		'aria-labelledby'?: string;
		'aria-describedby'?: string;
		class?: string;
	}

	let {
		scale,
		value = $bindable(null),
		onchange,
		suggested = null,
		max = null,
		keycaps = false,
		counts,
		columns = 'auto',
		controlled = false,
		label,
		id,
		'aria-labelledby': labelledBy,
		'aria-describedby': describedBy,
		class: className = ''
	}: Props = $props();

	const stops = $derived(scale.options(max));
	const values = $derived(stops.map((s) => s.value));
	const stop = $derived(value && values.includes(value) ? value : values[0]);
	const els: Partial<Record<string, HTMLButtonElement>> = $state({});

	function choose(v: V) {
		if (!controlled) value = v;
		onchange?.(v);
		els[v]?.focus();
	}

	function onkeydown(event: KeyboardEvent) {
		const at = values.indexOf(stop);
		let next = -1;
		if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (at + 1) % values.length;
		else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp')
			next = (at - 1 + values.length) % values.length;
		else if (event.key === 'Home') next = 0;
		else if (event.key === 'End') next = values.length - 1;
		if (next < 0) return;
		event.preventDefault();
		choose(values[next]);
	}
</script>

<div
	class="ds-scalepicker {className}"
	data-columns={columns === 'auto' ? 'auto' : 'fixed'}
	data-count={stops.length}
	data-across={columns === 'auto' ? stops.length : columns}
>
	<div
		class="row"
		role="radiogroup"
		{id}
		aria-label={labelledBy ? undefined : (label ?? scale.name)}
		aria-labelledby={labelledBy}
		aria-describedby={describedBy}
		tabindex="-1"
		style:--n={stops.length}
		style:--cols={columns === 'auto' ? undefined : columns}
		{onkeydown}
	>
		{#each stops as s (s.value)}
			{@const key = scale.key(s.value)}
			{@const count = counts?.[s.value]}
			<button
				bind:this={els[s.value]}
				type="button"
				role="radio"
				class="stop"
				aria-checked={value === s.value}
				aria-keyshortcuts={keycaps && key ? key : undefined}
				title={keycaps && key ? `${s.label} (${key})` : undefined}
				tabindex={s.value === stop ? 0 : -1}
				data-suggested={suggested === s.value && value !== s.value ? '' : undefined}
				data-unknown={scale.isUnknown(s.value) ? '' : undefined}
				style:--mark={s.mark}
				style:--bg={s.bg}
				style:--ink={s.ink}
				onclick={() => choose(s.value)}
			>
				<span class="name">{s.label}</span>
				{#if count !== undefined}<span class="count">{count.toLocaleString()}</span>{/if}
				{#if keycaps && key}<span class="kc"><KeyCap keys={key} decorative /></span>{/if}
			</button>
		{/each}
	</div>
</div>

<style>
	.ds-scalepicker {
		container-type: inline-size;
		min-width: 0;
	}
	.row {
		display: grid;
		grid-template-columns: repeat(var(--cols, var(--n)), minmax(0, 1fr));
		gap: 4px;
	}
	.row:focus {
		outline: none;
	}
	/* Key caps hide below 104px a column: the cells in one row (`data-across`), which is every cell
	   with auto columns and the fixed count with `columns`. Then the auto row folds, per cell count
	   (docs/severity.md, "Custom scales"). */
	@container (max-width: 104px) {
		[data-across='1'] .kc {
			display: none;
		}
	}
	@container (max-width: 208px) {
		[data-across='2'] .kc {
			display: none;
		}
	}
	@container (max-width: 312px) {
		[data-across='3'] .kc {
			display: none;
		}
	}
	@container (max-width: 416px) {
		[data-across='4'] .kc {
			display: none;
		}
	}
	@container (max-width: 520px) {
		[data-across='5'] .kc {
			display: none;
		}
	}
	@container (max-width: 624px) {
		[data-across='6'] .kc {
			display: none;
		}
	}
	@container (max-width: 728px) {
		[data-across='7'] .kc {
			display: none;
		}
	}
	@container (max-width: 832px) {
		[data-across='8'] .kc {
			display: none;
		}
	}
	@container (max-width: 936px) {
		[data-across='9'] .kc {
			display: none;
		}
	}
	@container (max-width: 1040px) {
		[data-across='10'] .kc {
			display: none;
		}
	}
	@container (max-width: 160px) {
		[data-columns='auto'][data-count='2'] .row {
			--cols: 1;
		}
	}
	@container (max-width: 240px) {
		[data-columns='auto'][data-count='3'] .row {
			--cols: 2;
		}
	}
	@container (max-width: 320px) {
		[data-columns='auto'][data-count='4'] .row {
			--cols: 2;
		}
	}
	@container (max-width: 400px) {
		[data-columns='auto'][data-count='5'] .row {
			--cols: 3;
		}
	}
	@container (max-width: 480px) {
		[data-columns='auto'][data-count='6'] .row {
			--cols: 3;
		}
	}
	@container (max-width: 560px) {
		[data-columns='auto'][data-count='7'] .row {
			--cols: 4;
		}
	}
	@container (max-width: 640px) {
		[data-columns='auto'][data-count='8'] .row {
			--cols: 4;
		}
	}
	@container (max-width: 720px) {
		[data-columns='auto'][data-count='9'] .row {
			--cols: 5;
		}
	}
	@container (max-width: 800px) {
		[data-columns='auto'][data-count='10'] .row {
			--cols: 5;
		}
	}
	@container (max-width: 319px) {
		[data-columns='auto'][data-count='7'] .row {
			--cols: 3;
		}
	}
	@container (max-width: 319px) {
		[data-columns='auto'][data-count='8'] .row {
			--cols: 3;
		}
	}
	@container (max-width: 399px) {
		[data-columns='auto'][data-count='9'] .row {
			--cols: 3;
		}
	}
	@container (max-width: 399px) {
		[data-columns='auto'][data-count='10'] .row {
			--cols: 4;
		}
	}
	.stop {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		min-width: 0;
		height: 40px;
		padding: 0 8px 3px;
		overflow: hidden;
		border: 1px solid transparent;
		border-radius: var(--ds-radius-sm);
		background: var(--ds-bg-3);
		color: var(--ds-text-2);
		font-family: var(--font-sans);
		font-size: var(--ds-text-sm);
		white-space: nowrap;
		cursor: pointer;
	}
	@media (pointer: coarse) {
		.stop {
			height: 48px;
		}
	}
	.stop::after {
		content: '';
		position: absolute;
		inset: auto 0 0;
		height: 3px;
		background: var(--mark);
		opacity: 0.55;
	}
	.stop[data-unknown]::after {
		background: repeating-linear-gradient(to right, var(--mark) 0 6px, transparent 6px 10px);
	}
	.stop:hover {
		background: var(--ds-bg-4);
		color: var(--ds-text-1);
	}
	.stop[aria-checked='true'] {
		border-color: var(--mark);
		background: var(--bg);
		color: var(--ink);
	}
	.stop[aria-checked='true']::after {
		opacity: 1;
	}
	.stop[data-suggested] {
		border: 1px dashed var(--mark);
	}
	.count {
		font-size: var(--ds-text-xs);
		font-variant-numeric: tabular-nums;
	}
</style>
