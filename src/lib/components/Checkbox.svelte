<!--
@component
Checkbox — a native `<input type="checkbox">` in the system's look. 16px box at ds-radius-xs; the
hit area is 32px on desktop and 44px on touch while the box stays 16px. Checked and mixed fill with
ds-accent and draw the tick or dash in ds-accent-contrast.

- `checked` (bindable): `true` | `false` | `'mixed'`. Mixed sets the native `indeterminate`; a
  click on a mixed box checks it.
- `label`: the visible label, or the accessible name when `hideLabel` is set (a table's selection
  column). `children` may replace the visible label text.
- `name`, `value`, `disabled` (45%), `invalid` (danger edge), `onchange(checked, event)`.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		checked?: boolean | 'mixed';
		label: string;
		hideLabel?: boolean;
		name?: string;
		value?: string;
		disabled?: boolean;
		invalid?: boolean;
		id?: string;
		onchange?: (checked: boolean, event: Event & { currentTarget: HTMLInputElement }) => void;
		onclick?: (event: MouseEvent & { currentTarget: HTMLInputElement }) => void;
		class?: string;
		children?: Snippet;
	}

	let {
		checked = $bindable(false),
		label,
		hideLabel = false,
		name,
		value,
		disabled = false,
		invalid = false,
		id,
		onchange,
		onclick,
		class: className = '',
		children
	}: Props = $props();

	let input: HTMLInputElement | undefined = $state();

	$effect(() => {
		if (input) input.indeterminate = checked === 'mixed';
	});

	function change(event: Event & { currentTarget: HTMLInputElement }) {
		checked = event.currentTarget.checked;
		onchange?.(event.currentTarget.checked, event);
	}
</script>

<label class="ds-check {className}" data-disabled={disabled ? '' : undefined} data-bare={hideLabel ? '' : undefined}>
	<span class="box">
		<input
			bind:this={input}
			type="checkbox"
			{id}
			{name}
			{value}
			{disabled}
			checked={checked === true}
			aria-checked={checked === 'mixed' ? 'mixed' : undefined}
			aria-invalid={invalid ? 'true' : undefined}
			aria-label={hideLabel ? label : undefined}
			onchange={change}
			{onclick}
		/>
		<svg class="tick" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" /></svg>
		<svg class="dash" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 8h8" /></svg>
	</span>
	{#if !hideLabel}<span class="text">{#if children}{@render children()}{:else}{label}{/if}</span>{/if}
</label>

<style>
	.ds-check {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: 32px;
		color: var(--ds-text-1);
		font-size: var(--ds-text-md);
		line-height: var(--ds-lh-md);
		cursor: pointer;
	}
	.ds-check[data-bare] {
		justify-content: center;
		min-width: 32px;
	}
	@media (pointer: coarse) {
		.ds-check {
			min-height: var(--ds-h-touch);
		}
		.ds-check[data-bare] {
			min-width: var(--ds-h-touch);
		}
	}
	.ds-check[data-disabled] {
		opacity: 0.45;
		cursor: not-allowed;
	}
	.box {
		position: relative;
		display: inline-flex;
		flex: none;
		width: 16px;
		height: 16px;
	}
	input {
		appearance: none;
		width: 16px;
		height: 16px;
		margin: 0;
		border: 1px solid var(--ds-border-strong);
		border-radius: var(--ds-radius-xs);
		background: var(--ds-bg-3);
		cursor: inherit;
		transition:
			background-color var(--ds-dur-fast) var(--ds-ease-out),
			border-color var(--ds-dur-fast) var(--ds-ease-out);
	}
	input:hover:not(:disabled) {
		border-color: var(--ds-text-3);
	}
	input:is(:checked, :indeterminate, [aria-checked='mixed']) {
		background: var(--ds-accent);
		border-color: var(--ds-accent);
	}
	input[aria-invalid='true'] {
		border-color: var(--ds-danger);
	}
	svg {
		position: absolute;
		inset: 0;
		width: 16px;
		height: 16px;
		fill: none;
		stroke: var(--ds-accent-contrast);
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
		pointer-events: none;
		visibility: hidden;
	}
	/* aria-checked="mixed" draws the dash before hydration sets the indeterminate property. */
	input:checked:not(:indeterminate, [aria-checked='mixed']) ~ .tick,
	input:is(:indeterminate, [aria-checked='mixed']) ~ .dash {
		visibility: visible;
	}
</style>
