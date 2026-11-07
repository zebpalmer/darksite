<script lang="ts" module>
	import type { IconComponent } from '../types.js';

	export interface ChoiceTile<T> {
		value: T;
		label: string;
		/** One line under the label: what this choice holds or is doing now. */
		meta?: string;
		icon?: IconComponent;
		/** A state shown at the tile's trailing edge, as a StatusBadge. */
		status?: {
			label: string;
			tone?: 'neutral' | 'accent' | 'info' | 'success' | 'warning' | 'danger' | 'muted';
		};
		disabled?: boolean;
	}
</script>

<!--
@component
ChoiceTiles — pick one of a set of things that each carry a line of state: the device to work on,
the site to report from, the queue to take items from. A radio group of tiles, laid out by the
group's own width: one tab stop, the arrow keys move and select, Home/End jump to the ends.

- `options` (`{ value, label, meta?, icon?, status?: { label, tone? }, disabled? }[]`), `value`
  (bindable), `onchange(value)`, `label` (the group's name), `id`, `aria-labelledby`,
  `aria-describedby`, `min` (a tile's minimum width in px, default 160), `class`.
- A tile is 56px tall with its meta line (44px without), and at least 44px on touch. The selected
  tile takes `ds-accent-tint` with an accent edge and a check.
-->
<script lang="ts" generics="T extends string | number | boolean | null">
	import Check from '@lucide/svelte/icons/check';
	import StatusBadge from './StatusBadge.svelte';

	interface Props {
		options: readonly ChoiceTile<T>[];
		value?: T;
		onchange?: (value: T) => void;
		/** The group's name. Required unless `aria-labelledby` names it. */
		label?: string;
		id?: string;
		'aria-labelledby'?: string;
		'aria-describedby'?: string;
		min?: number;
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
		min = 160,
		class: className = ''
	}: Props = $props();

	const enabled = $derived(options.filter((o) => !o.disabled));
	// The tile that holds the tab stop. Found as an option, not a value, since `null` is a value.
	const stop = $derived((options.find((o) => o.value === value && !o.disabled) ?? enabled[0])?.value);
	const buttons: HTMLButtonElement[] = $state([]);

	function choose(option: ChoiceTile<T>) {
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
	class="ds-choicetiles {className}"
	role="radiogroup"
	{id}
	aria-label={labelledBy ? undefined : label}
	aria-labelledby={labelledBy}
	aria-describedby={describedBy}
	style:--tile-min="{min}px"
	tabindex="-1"
	{onkeydown}
>
	{#each options as option, i (option.value)}
		{@const checked = option.value === value}
		<button
			bind:this={buttons[i]}
			type="button"
			role="radio"
			class="tile"
			aria-checked={checked}
			tabindex={option.value === stop ? 0 : -1}
			disabled={option.disabled}
			data-meta={option.meta ? '' : undefined}
			onclick={() => choose(option)}
		>
			{#if option.icon}<span class="icon"><option.icon size={18} aria-hidden="true" /></span>{/if}
			<span class="text">
				<span class="label" title={option.label}>{option.label}</span>
				{#if option.meta}<span class="meta" title={option.meta}>{option.meta}</span>{/if}
			</span>
			{#if option.status}<StatusBadge label={option.status.label} tone={option.status.tone} />{/if}
			<span class="check" aria-hidden="true">{#if checked}<Check size={16} />{/if}</span>
		</button>
	{/each}
</div>

<style>
	.ds-choicetiles {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(var(--tile-min), 100%), 1fr));
		gap: 8px;
		min-width: 0;
	}
	.tile {
		display: flex;
		align-items: center;
		gap: 10px;
		min-width: 0;
		min-height: 44px;
		padding: 6px 10px 6px 12px;
		border: 1px solid var(--ds-border);
		border-radius: var(--ds-radius-md);
		background: var(--ds-bg-2);
		color: var(--ds-text-1);
		font: inherit;
		text-align: start;
		cursor: pointer;
		transition:
			background-color var(--ds-dur-fast) var(--ds-ease-out),
			border-color var(--ds-dur-fast) var(--ds-ease-out);
	}
	.tile[data-meta] {
		min-height: 56px;
	}
	.tile:hover:not(:disabled) {
		background: var(--ds-bg-4);
	}
	/* Muted text stops at ds-bg-3; from ds-bg-4 up the meta steps to ds-text-2. */
	.tile:hover:not(:disabled) .meta {
		color: var(--ds-text-2);
	}
	.tile[aria-checked='true'] {
		border-color: var(--ds-accent);
		background: var(--ds-accent-tint);
	}
	.tile:disabled {
		cursor: not-allowed;
		opacity: 0.45;
	}
	.icon {
		display: inline-flex;
		flex: none;
		color: var(--ds-text-2);
	}
	.tile[aria-checked='true'] .icon,
	.check {
		color: var(--ds-accent-text);
	}
	.text {
		display: flex;
		flex: 1;
		flex-direction: column;
		min-width: 0;
	}
	.label,
	.meta {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.label {
		font-size: var(--ds-text-md);
		line-height: var(--ds-lh-md);
		font-weight: 500;
	}
	.meta {
		color: var(--ds-text-3);
		font-size: var(--ds-text-sm);
		line-height: var(--ds-lh-sm);
	}
	.tile[aria-checked='true'] .meta {
		color: var(--ds-text-2);
	}
	.check {
		display: inline-flex;
		flex: none;
		width: 16px;
	}
	@media (pointer: coarse) {
		.tile {
			min-height: var(--ds-h-touch);
		}
	}
</style>
