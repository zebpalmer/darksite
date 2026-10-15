<script lang="ts" module>
	import type { IconComponent } from '../types.js';

	export interface SegmentOption<T> {
		value: T;
		label: string;
		icon?: IconComponent;
		keycap?: string;
		count?: number;
		disabled?: boolean;
		title?: string;
	}
</script>

<!--
@component
SegmentedControl — pick one of 2–7 mutually exclusive options. A radio group: one tab stop, ←/→
move and select, Home/End jump to the ends. Never a dropdown for these, and never for severities
(SeverityPicker).

- `options` (`{ value, label, icon?, keycap?, count?, disabled?, title? }[]`; `label` is required
  even with `iconOnly`), `value` (bindable), `onchange(value)`, `label` (the group's name),
  `size` (`dense` | `default`; 38 inside the strip on touch), `full`, `iconOnly`, `class`.
- In a Field, name the group by the Field's label instead: `id={f.id}
  aria-labelledby={f.labelId} aria-describedby={f.describedBy}` (then `label` may be omitted).
-->
<script lang="ts" generics="T extends string | number">
	import KeyCap from './KeyCap.svelte';

	interface Props {
		options: readonly SegmentOption<T>[];
		value?: T;
		onchange?: (value: T) => void;
		/** The group's name. Required unless `aria-labelledby` names it. */
		label?: string;
		id?: string;
		'aria-labelledby'?: string;
		'aria-describedby'?: string;
		size?: 'dense' | 'default';
		full?: boolean;
		iconOnly?: boolean;
		class?: string;
	}

	let {
		options,
		value = $bindable(),
		onchange,
		label,
		id,
		'aria-labelledby': labelledBy,
		'aria-describedby': describedBy,
		size = 'default',
		full = false,
		iconOnly = false,
		class: className = ''
	}: Props = $props();

	const enabled = $derived(options.filter((o) => !o.disabled));
	const stop = $derived(
		options.find((o) => o.value === value && !o.disabled)?.value ?? enabled[0]?.value
	);
	const buttons: HTMLButtonElement[] = $state([]);

	function choose(option: SegmentOption<T>) {
		if (option.disabled) return;
		if (option.value !== value) {
			value = option.value;
			onchange?.(option.value);
		}
		buttons[options.indexOf(option)]?.focus();
	}

	function onkeydown(event: KeyboardEvent) {
		if (!enabled.length) return;
		const at = enabled.findIndex((o) => o.value === stop);
		let next = -1;
		if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (at + 1) % enabled.length;
		else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp')
			next = (at - 1 + enabled.length) % enabled.length;
		else if (event.key === 'Home') next = 0;
		else if (event.key === 'End') next = enabled.length - 1;
		if (next < 0) return;
		event.preventDefault();
		choose(enabled[next]);
	}
</script>

<div
	class="ds-segmented {className}"
	role="radiogroup"
	{id}
	aria-label={labelledBy ? undefined : label}
	aria-labelledby={labelledBy}
	aria-describedby={describedBy}
	data-size={size}
	data-full={full ? '' : undefined}
	tabindex="-1"
	{onkeydown}
>
	{#each options as option, i (option.value)}
		<button
			bind:this={buttons[i]}
			type="button"
			role="radio"
			class="seg"
			aria-checked={option.value === value}
			aria-label={iconOnly ? option.label : undefined}
			aria-keyshortcuts={option.keycap}
			title={option.title ?? (iconOnly ? option.label : undefined)}
			tabindex={option.value === stop ? 0 : -1}
			disabled={option.disabled}
			onclick={() => choose(option)}
		>
			{#if option.icon}<option.icon size={14} aria-hidden="true" />{/if}
			{#if !iconOnly}<span class="text">{option.label}</span>{/if}
			{#if option.count !== undefined}<span class="count">{option.count.toLocaleString()}</span
				>{/if}
			{#if option.keycap}<KeyCap keys={option.keycap} decorative />{/if}
		</button>
	{/each}
</div>

<style>
	.ds-segmented {
		display: inline-flex;
		max-width: 100%;
		gap: 2px;
		padding: 2px;
		overflow-x: auto;
		border: 1px solid var(--ds-border-subtle);
		border-radius: var(--ds-radius-md);
		background: var(--ds-bg-2);
		scrollbar-width: none;
	}
	.ds-segmented:focus {
		outline: none;
	}
	[data-full] {
		display: flex;
		width: 100%;
	}
	.seg {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		flex: none;
		height: 26px;
		padding: 0 10px;
		border: 0;
		border-radius: var(--ds-radius-sm);
		background: transparent;
		color: var(--ds-text-3);
		font-family: var(--font-sans);
		font-size: var(--ds-text-sm);
		white-space: nowrap;
		cursor: pointer;
	}
	[data-size='dense'] .seg {
		height: 22px;
		padding: 0 8px;
		font-size: var(--ds-text-xs);
	}
	@media (pointer: coarse) {
		.ds-segmented .seg {
			height: 38px;
			padding: 0 12px;
		}
	}
	[data-full] .seg {
		flex: 1 1 0;
		min-width: 0;
	}
	[data-full] .text {
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.seg:hover:not(:disabled) {
		color: var(--ds-text-1);
	}
	.seg[aria-checked='true'] {
		background: var(--ds-bg-4);
		color: var(--ds-text-1);
	}
	.seg:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}
	.count {
		color: var(--ds-text-3);
		font-size: var(--ds-text-xs);
		font-variant-numeric: tabular-nums;
	}
	/* At 0 the ring fits the strip's 2px padding, which would clip it further out. */
	.seg:focus-visible {
		outline-offset: 0;
	}
</style>
