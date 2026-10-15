<!--
@component
SeverityPicker — the severity variant of SegmentedControl: the stops in scale order, each with a
3px mark stripe, so the row reads as the ramp. A radio group (←/→ move and select).

Selected: the stop's tinted ground and ink with its mark as the border. Suggested: a dashed mark
border, not applied. Idle: ds-bg-3 with the stripe at 55%. 40px tall, 48 on touch. It answers to
its own width: key caps hide first, then the row folds to a 3-column grid, never truncating names.

- `value` (bindable; `null` is unset), `onchange(severity)`, `suggested`, `max` (stops above it
  are hidden, not disabled), `keycaps` (show 1–5 as key caps), `counts` (per stop), `columns`
  (`auto` | `5` | `3`), `controlled` (a click only calls `onchange`), `label`, `class`.
-->
<script lang="ts">
	import KeyCap from './KeyCap.svelte';
	import { SEVERITIES, severityLabel, severityRank, severityVars, type Severity } from '../severity.js';

	interface Props {
		value?: Severity | null;
		onchange?: (severity: Severity) => void;
		suggested?: Severity | null;
		max?: Severity;
		keycaps?: boolean;
		counts?: Partial<Record<Severity, number>>;
		columns?: 'auto' | 5 | 3;
		controlled?: boolean;
		label?: string;
		class?: string;
	}

	let {
		value = $bindable(null),
		onchange,
		suggested = null,
		max,
		keycaps = false,
		counts,
		columns = 'auto',
		controlled = false,
		label = 'Severity',
		class: className = ''
	}: Props = $props();

	const stops = $derived(SEVERITIES.filter((s) => !max || severityRank(s) <= severityRank(max)));
	const stop = $derived(value && stops.includes(value) ? value : stops[0]);
	const els: Partial<Record<Severity, HTMLButtonElement>> = $state({});

	function choose(s: Severity) {
		if (!controlled) value = s;
		onchange?.(s);
		els[s]?.focus();
	}

	function onkeydown(event: KeyboardEvent) {
		const at = stops.indexOf(stop);
		let next = -1;
		if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (at + 1) % stops.length;
		else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp')
			next = (at - 1 + stops.length) % stops.length;
		else if (event.key === 'Home') next = 0;
		else if (event.key === 'End') next = stops.length - 1;
		if (next < 0) return;
		event.preventDefault();
		choose(stops[next]);
	}
</script>

<div class="ds-sevpicker {className}" data-columns={columns}>
	<div class="row" role="radiogroup" aria-label={label} tabindex="-1" {onkeydown}>
		{#each stops as s (s)}
			{@const v = severityVars(s)}
			{@const key = String(severityRank(s))}
			<button
				bind:this={els[s]}
				type="button"
				role="radio"
				class="stop"
				aria-checked={value === s}
				aria-keyshortcuts={keycaps ? key : undefined}
				title={keycaps ? `${severityLabel(s)} (${key})` : undefined}
				tabindex={s === stop ? 0 : -1}
				data-suggested={suggested === s && value !== s ? '' : undefined}
				style:--mark={v.mark}
				style:--bg={v.bg}
				style:--ink={v.ink}
				onclick={() => choose(s)}
			>
				<span class="name">{severityLabel(s)}</span>
				{#if counts?.[s] !== undefined}<span class="count">{counts[s]!.toLocaleString()}</span>{/if}
				{#if keycaps}<span class="kc"><KeyCap keys={key} decorative /></span>{/if}
			</button>
		{/each}
	</div>
</div>

<style>
	.ds-sevpicker {
		container-type: inline-size;
		min-width: 0;
	}
	.row {
		display: grid;
		grid-template-columns: repeat(var(--cols, 5), minmax(0, 1fr));
		gap: 4px;
	}
	.row:focus {
		outline: none;
	}
	[data-columns='3'] .row {
		--cols: 3;
	}
	@container (max-width: 520px) {
		.kc {
			display: none;
		}
	}
	@container (max-width: 400px) {
		[data-columns='auto'] .row {
			--cols: 3;
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
		opacity: 0.8;
	}
</style>
