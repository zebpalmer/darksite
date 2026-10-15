<!--
@component
Rating — a star rating, 1 to `max` (5 by default). An input is a radio group: one tab stop,
←/→ (and ↑/↓) step, Home/End jump to the ends, Delete or Backspace clears; choosing the current
value again clears it too. `readonly` is a display: one image named "4 of 5 stars".

- `value` (bindable, `null` = unrated), `max`, `label` (the group's name; required), `onchange`,
  `readonly`, `disabled`, `clearable` (default true), `clearLabel` (shows an explicit Clear
  button beside the stars when set and something is rated), `size` (`dense` 24 | `default` 32;
  44 per star on touch), `showValue` (the "4/5" readout), `class`.
-->
<script lang="ts">
	import Star from '@lucide/svelte/icons/star';

	import Button from './Button.svelte';

	interface Props {
		value?: number | null;
		max?: number;
		label: string;
		onchange?: (value: number | null) => void;
		readonly?: boolean;
		disabled?: boolean;
		clearable?: boolean;
		clearLabel?: string;
		size?: 'dense' | 'default';
		showValue?: boolean;
		class?: string;
	}

	let {
		value = $bindable(null),
		max = 5,
		label,
		onchange,
		readonly = false,
		disabled = false,
		clearable = true,
		clearLabel,
		size = 'default',
		showValue = false,
		class: className = ''
	}: Props = $props();

	const stars = $derived(Array.from({ length: Math.max(1, Math.floor(max)) }, (_, i) => i + 1));
	const current = $derived(value && value >= 1 ? Math.min(Math.round(value), stars.length) : 0);
	let hovered = $state<number | null>(null);
	const shown = $derived(readonly || disabled ? current : (hovered ?? current));
	const buttons: HTMLButtonElement[] = $state([]);
	const iconSize = $derived(size === 'dense' ? 16 : 20);
	const summary = $derived(current ? `${current} of ${stars.length} stars` : 'Not rated');

	function set(next: number | null, focus = true) {
		if (readonly || disabled) return;
		if (next !== value) {
			value = next;
			onchange?.(next);
		}
		if (focus) buttons[(next ?? 1) - 1]?.focus();
	}

	function pick(n: number) {
		set(n === current && clearable ? null : n);
	}

	function onkeydown(event: KeyboardEvent) {
		const n = stars.length;
		let next: number | null | undefined;
		if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = Math.min(n, current + 1);
		else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown')
			next = Math.max(1, current - 1);
		else if (event.key === 'Home') next = 1;
		else if (event.key === 'End') next = n;
		else if ((event.key === 'Delete' || event.key === 'Backspace') && clearable) next = null;
		if (next === undefined) return;
		event.preventDefault();
		set(next);
	}
</script>

{#if readonly}
	<span
		class="ds-rating {className}"
		data-size={size}
		data-readonly=""
		role="img"
		aria-label="{label}: {summary}"
	>
		{#each stars as n (n)}
			<span class="star" data-on={n <= shown ? '' : undefined}>
				<Star size={iconSize} fill={n <= shown ? 'currentColor' : 'none'} aria-hidden="true" />
			</span>
		{/each}
		{#if showValue && current}<span class="value" aria-hidden="true">{current}/{stars.length}</span
			>{/if}
	</span>
{:else}
	<span class="ds-rating {className}" data-size={size}>
		<span
			class="stars"
			role="radiogroup"
			aria-label={label}
			aria-disabled={disabled ? 'true' : undefined}
			tabindex="-1"
			{onkeydown}
			onmouseleave={() => (hovered = null)}
		>
			{#each stars as n, i (n)}
				<button
					bind:this={buttons[i]}
					type="button"
					role="radio"
					class="star"
					data-on={n <= shown ? '' : undefined}
					aria-checked={n === current}
					aria-label="{n} {n === 1 ? 'star' : 'stars'}"
					tabindex={n === (current || 1) ? 0 : -1}
					{disabled}
					onmouseenter={() => (hovered = n)}
					onclick={() => pick(n)}
				>
					<Star size={iconSize} fill={n <= shown ? 'currentColor' : 'none'} aria-hidden="true" />
				</button>
			{/each}
		</span>
		{#if showValue && current}<span class="value" aria-hidden="true">{current}/{stars.length}</span
			>{/if}
		{#if clearLabel && clearable && current && !disabled}
			<Button variant="ghost" size="dense" onclick={() => set(null, false)}>{clearLabel}</Button>
		{/if}
	</span>
{/if}

<style>
	.ds-rating {
		--star: 32px;
		display: inline-flex;
		align-items: center;
		gap: 8px;
		max-width: 100%;
	}
	.ds-rating[data-size='dense'] {
		--star: 24px;
	}
	.ds-rating[data-readonly] {
		gap: 0;
	}
	/* Touch: 44px per star whatever the size; the size rule above out-ranks a bare .ds-rating. */
	@media (pointer: coarse) {
		.ds-rating:not([data-readonly]),
		.ds-rating[data-size]:not([data-readonly]) {
			--star: var(--ds-h-touch);
		}
	}
	.stars {
		display: inline-flex;
		align-items: center;
	}
	.stars:focus {
		outline: none;
	}
	.star {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex: none;
		width: var(--star);
		height: var(--star);
		margin: 0;
		padding: 0;
		border: 0;
		border-radius: var(--ds-radius-sm);
		background: none;
		color: var(--ds-text-3);
		transition: color var(--ds-dur-fast) var(--ds-ease-out);
	}
	[data-readonly] .star {
		width: auto;
		height: auto;
		padding: 1px;
	}
	button.star {
		cursor: pointer;
	}
	button.star:hover:not(:disabled) {
		background: var(--ds-bg-4);
	}
	button.star:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}
	.star[data-on] {
		color: var(--ds-accent);
	}
	.star:focus-visible {
		outline-offset: -2px;
	}
	.value {
		color: var(--ds-text-3);
		font-size: var(--ds-text-sm);
		font-variant-numeric: tabular-nums;
	}
</style>
