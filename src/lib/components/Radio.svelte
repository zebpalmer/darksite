<!--
@component
Radio — a native `<input type="radio">` in the system's look: the Checkbox geometry, round. For a
choice inside a form where a SegmentedControl would not fit (more than seven options, or long
labels). Give every radio in a set the same `name` and bind the same `group`.

- `group` (bindable): the selected value of the set. `value`: this radio's value.
- `label`, `hideLabel`, `name`, `disabled` (45%), `invalid` (a danger edge — the error itself
  belongs to the group: put the set in a fieldset with the message), `onchange(value)`.
-->
<script lang="ts" generics="V extends string | number">
	import type { Snippet } from 'svelte';

	interface Props {
		group?: V;
		value: V;
		label: string;
		hideLabel?: boolean;
		name: string;
		disabled?: boolean;
		invalid?: boolean;
		id?: string;
		onchange?: (value: V) => void;
		class?: string;
		children?: Snippet;
	}

	let {
		group = $bindable(),
		value,
		label,
		hideLabel = false,
		name,
		disabled = false,
		invalid = false,
		id,
		onchange,
		class: className = '',
		children
	}: Props = $props();

	function change() {
		group = value;
		onchange?.(value);
	}
</script>

<label class="ds-radio {className}" data-disabled={disabled ? '' : undefined}>
	<span class="box">
		<input
			type="radio"
			{id}
			{name}
			{value}
			{disabled}
			checked={group === value}
			data-invalid={invalid ? '' : undefined}
			aria-label={hideLabel ? label : undefined}
			onchange={change}
		/>
	</span>
	{#if !hideLabel}<span class="text">{#if children}{@render children()}{:else}{label}{/if}</span>{/if}
</label>

<style>
	.ds-radio {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: 32px;
		color: var(--ds-text-1);
		font-size: var(--ds-text-md);
		line-height: var(--ds-lh-md);
		cursor: pointer;
	}
	@media (pointer: coarse) {
		.ds-radio {
			min-height: var(--ds-h-touch);
		}
	}
	.ds-radio[data-disabled] {
		opacity: 0.45;
		cursor: not-allowed;
	}
	.box {
		display: inline-flex;
		flex: none;
	}
	input {
		appearance: none;
		display: grid;
		place-content: center;
		width: 16px;
		height: 16px;
		margin: 0;
		border: 1px solid var(--ds-border-strong);
		border-radius: var(--ds-radius-full);
		background: var(--ds-bg-3);
		cursor: inherit;
		transition: border-color var(--ds-dur-fast) var(--ds-ease-out);
	}
	input::before {
		content: '';
		width: 8px;
		height: 8px;
		border-radius: var(--ds-radius-full);
		background: var(--ds-accent-contrast);
		transform: scale(0);
		transition: transform var(--ds-dur-fast) var(--ds-ease-out);
	}
	input:hover:not(:disabled) {
		border-color: var(--ds-text-3);
	}
	input:checked {
		background: var(--ds-accent);
		border-color: var(--ds-accent);
	}
	input:checked::before {
		transform: scale(1);
	}
	input[data-invalid] {
		border-color: var(--ds-danger);
	}
</style>
