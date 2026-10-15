<script lang="ts" module>
	export interface SelectOption {
		value: string;
		label: string;
		disabled?: boolean;
	}
</script>

<!--
@component
Select — a native `<select>` in the control look, with a chevron. Native on purpose: every
platform's own picker, keyboard and screen-reader support come for free, and on a phone the
system sheet opens. For a long list to search, or to create a value, use Combobox; for 2–7
options always visible, SegmentedControl.

It takes the same Field contract as Input: spread `{ id, describedBy, invalid }` onto it.

- `options` (`{ value, label, disabled? }[]`) and/or `groups` (`{ label, options }[]`, as
  `<optgroup>`s), `value` (bindable), `placeholder` (a first, unselectable choice shown while
  nothing is chosen; default "Choose…" when `value` is empty), `invalid`, `size` (`dense` |
  `default`), `element` (bindable ref), `class`, and any other `<select>` attribute.
-->
<script lang="ts">
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import type { HTMLSelectAttributes } from 'svelte/elements';

	import { strings } from '../strings.svelte.js';

	interface Props extends Omit<HTMLSelectAttributes, 'value' | 'class' | 'size'> {
		options?: readonly SelectOption[];
		groups?: readonly { label: string; options: readonly SelectOption[] }[];
		value?: string;
		placeholder?: string;
		invalid?: boolean;
		size?: 'dense' | 'default';
		describedBy?: string;
		element?: HTMLSelectElement;
		class?: string;
	}

	let {
		options = [],
		groups = [],
		value = $bindable(''),
		placeholder,
		invalid = false,
		size = 'default',
		describedBy,
		element = $bindable(),
		class: className = '',
		...rest
	}: Props = $props();

	const prompt = $derived(placeholder ?? (value ? undefined : strings.chooseOption));
</script>

<span class="ds-select {className}" data-size={size}>
	<select
		bind:this={element}
		bind:value
		class="ds-control"
		aria-invalid={invalid ? 'true' : undefined}
		aria-describedby={describedBy ?? rest['aria-describedby']}
		{...rest}
	>
		{#if prompt}<option value="" disabled>{prompt}</option>{/if}
		{#each options as o (o.value)}<option value={o.value} disabled={o.disabled}>{o.label}</option>{/each}
		{#each groups as g (g.label)}
			<optgroup label={g.label}>
				{#each g.options as o (o.value)}<option value={o.value} disabled={o.disabled}>{o.label}</option>{/each}
			</optgroup>
		{/each}
	</select>
	<span class="chevron" aria-hidden="true"><ChevronDown size={16} /></span>
</span>

<style>
	.ds-select {
		position: relative;
		display: flex;
		align-items: center;
		min-width: 0;
	}
	select {
		padding-right: 32px;
		appearance: none;
		cursor: pointer;
	}
	@media (pointer: fine) {
		[data-size='dense'] select {
			height: var(--ds-h-dense);
		}
	}
	.chevron {
		position: absolute;
		right: 10px;
		display: inline-flex;
		color: var(--ds-text-3);
		pointer-events: none;
	}
</style>
