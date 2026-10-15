<!--
@component
Stepper — a number nudged up and down: − value +, in the `.ds-control` look. The field is a
`spinbutton`: ↑/↓ step, PageUp/PageDown take a big step, Home/End jump to `min`/`max`, and a typed
value is clamped and snapped to the step when it is committed (Enter or leaving the field). The
− and + buttons are for the pointer and stay out of the tab order.

- `value` (bindable), `min`, `max`, `step` (default 1), `bigStep` (default 10 steps), `label`
  (the field's name; required), `hideLabel` (default true: the label is the accessible name
  only), `onchange(value)`, `size` (`dense` 28 | `default` 32; 44 on touch), `disabled`,
  `width` (of the value field, CSS; default `6ch`), `name`, `id`, `class`.
-->
<script lang="ts">
	import Minus from '@lucide/svelte/icons/minus';
	import Plus from '@lucide/svelte/icons/plus';

	interface Props {
		value?: number;
		min?: number;
		max?: number;
		step?: number;
		bigStep?: number;
		label: string;
		hideLabel?: boolean;
		onchange?: (value: number) => void;
		size?: 'dense' | 'default';
		disabled?: boolean;
		width?: string;
		name?: string;
		id?: string;
		class?: string;
	}

	let {
		value = $bindable(0),
		min,
		max,
		step = 1,
		bigStep,
		label,
		hideLabel = true,
		onchange,
		size = 'default',
		disabled = false,
		width = '6ch',
		name,
		id,
		class: className = ''
	}: Props = $props();

	const uid = $props.id();
	const inputId = $derived(id ?? `${uid}-input`);
	const decimals = $derived(String(step).split('.')[1]?.length ?? 0);
	const big = $derived(bigStep ?? step * 10);
	let draft = $state<string | null>(null);
	const text = $derived(draft ?? String(value));

	function clamp(n: number): number {
		const base = min ?? 0;
		let v = base + Math.round((n - base) / step) * step;
		v = Number(v.toFixed(decimals));
		if (min !== undefined && v < min) v = min;
		if (max !== undefined && v > max) v = max;
		return v;
	}

	function set(n: number) {
		const next = clamp(n);
		draft = null;
		if (next !== value) {
			value = next;
			onchange?.(next);
		}
	}

	function commit() {
		if (draft === null) return;
		const n = Number(draft.trim().replace(/,/g, ''));
		if (draft.trim() === '' || !Number.isFinite(n)) draft = null;
		else set(n);
	}

	function onkeydown(event: KeyboardEvent) {
		let next: number | undefined;
		if (event.key === 'ArrowUp') next = value + step;
		else if (event.key === 'ArrowDown') next = value - step;
		else if (event.key === 'PageUp') next = value + big;
		else if (event.key === 'PageDown') next = value - big;
		else if (event.key === 'Home' && min !== undefined) next = min;
		else if (event.key === 'End' && max !== undefined) next = max;
		else if (event.key === 'Enter') {
			commit();
			return;
		} else if (event.key === 'Escape' && draft !== null) {
			event.preventDefault();
			draft = null;
			return;
		}
		if (next === undefined) return;
		event.preventDefault();
		commit();
		set(next);
	}
</script>

<span class="ds-stepper {className}" data-size={size}>
	{#if !hideLabel}<label class="text" for={inputId}>{label}</label>{/if}
	<span class="ds-control box" data-disabled={disabled ? '' : undefined}>
		<button
			type="button"
			class="btn"
			tabindex="-1"
			aria-label="Decrease"
			aria-controls={inputId}
			disabled={disabled || (min !== undefined && value <= min)}
			onclick={() => set(value - step)}><Minus size={16} aria-hidden="true" /></button
		>
		<input
			id={inputId}
			{name}
			type="text"
			inputmode={min !== undefined && min >= 0 ? (decimals ? 'decimal' : 'numeric') : 'text'}
			role="spinbutton"
			autocomplete="off"
			aria-label={hideLabel ? label : undefined}
			aria-valuenow={value}
			aria-valuemin={min}
			aria-valuemax={max}
			{disabled}
			value={text}
			style:width
			oninput={(e) => (draft = e.currentTarget.value)}
			onblur={commit}
			{onkeydown}
		/>
		<button
			type="button"
			class="btn"
			tabindex="-1"
			aria-label="Increase"
			aria-controls={inputId}
			disabled={disabled || (max !== undefined && value >= max)}
			onclick={() => set(value + step)}><Plus size={16} aria-hidden="true" /></button
		>
	</span>
</span>

<style>
	.ds-stepper {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		max-width: 100%;
	}
	.text {
		color: var(--ds-text-2);
		font-size: var(--ds-text-sm);
	}
	.box {
		--h: var(--ds-h-default);
		display: inline-flex;
		align-items: stretch;
		width: auto;
		height: var(--h);
		padding: 0;
		overflow: hidden;
	}
	[data-size='dense'] .box {
		--h: var(--ds-h-dense);
	}
	@media (pointer: coarse) {
		.ds-stepper .box,
		.ds-stepper[data-size] .box {
			--h: var(--ds-h-touch);
		}
	}
	.box:focus-within {
		border-color: var(--ds-accent);
	}
	.box[data-disabled] {
		opacity: 0.45;
	}
	input {
		min-width: 3ch;
		margin: 0;
		padding: 0 4px;
		border: 0;
		background: none;
		color: inherit;
		font: inherit;
		font-variant-numeric: tabular-nums;
		text-align: center;
	}
	/* The ring is drawn on the whole control rather than on the bare field inside it. */
	input:focus-visible {
		outline: none;
	}
	.box:has(input:focus-visible) {
		outline: 2px solid var(--ds-focus);
		outline-offset: 2px;
	}
	input:disabled {
		cursor: not-allowed;
	}
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex: none;
		width: var(--h);
		margin: 0;
		padding: 0;
		border: 0;
		background: none;
		color: var(--ds-text-2);
		cursor: pointer;
		transition: background-color var(--ds-dur-fast) var(--ds-ease-out);
	}
	.btn:hover:not(:disabled) {
		background: var(--ds-bg-4);
		color: var(--ds-text-1);
	}
	.btn:disabled {
		color: var(--ds-text-3);
		cursor: not-allowed;
	}
</style>
