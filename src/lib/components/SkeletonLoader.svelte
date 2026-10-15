<!--
@component
SkeletonLoader — a placeholder with the same geometry as the real thing: ds-bg-3 blocks on a slow
1.6s opacity pulse, static under reduced motion. The way to load content whose shape is known.

- `variant`: `line` (one 12px text line) | `block` (a sized box) | `card` (a media Card) |
  `entity` (an EntityCard row) | `grid` (a whole `Grid` of card placeholders — `count` of them,
  8 by default — honoring `density`, `min` and `--ds-grid-min` exactly as the real Grid does; a
  `min` of 260 or more draws entity rows).
- `width` / `height` (for `line` and `block`), `count` (repeat), `label` (screen-reader status,
  "Loading" by default; pass `null` when an ancestor already announces loading).
-->
<script lang="ts">
	import { strings } from '../strings.svelte.js';
	import Grid from './Grid.svelte';

	interface Props {
		variant?: 'line' | 'block' | 'card' | 'entity' | 'grid';
		density?: 's' | 'm' | 'l';
		min?: number;
		gap?: string;
		width?: string;
		height?: string;
		count?: number;
		label?: string | null;
		class?: string;
	}

	let {
		variant = 'line',
		width,
		height,
		count,
		density,
		min,
		gap,
		label = strings.loading,
		class: className = ''
	}: Props = $props();

	const items = $derived(
		Array.from({ length: Math.max(1, count ?? (variant === 'grid' ? 8 : 1)) }, (_, i) => i)
	);
	const rows = $derived(min !== undefined && min >= 260);
</script>

{#snippet card()}
	<span class="card" aria-hidden="true">
		<span class="blk thumb"></span>
		<span class="blk ln" style="width: 80%"></span>
		<span class="blk ln" style="width: 55%"></span>
	</span>
{/snippet}

{#snippet entity()}
	<span class="entity" aria-hidden="true">
		<span class="blk av"></span>
		<span class="col">
			<span class="blk ln" style="width: 60%"></span>
			<span class="blk ln" style="width: 40%"></span>
		</span>
	</span>
{/snippet}

{#if variant === 'grid'}
	<div class="ds-skeleton {className}" role={label ? 'status' : undefined}>
		{#if label}<span class="ds-sr-only">{label}</span>{/if}
		<Grid {density} {min} {gap}>
			{#each items as i (i)}
				{#if rows}{@render entity()}{:else}{@render card()}{/if}
			{/each}
		</Grid>
	</div>
{:else}
	<span class="ds-skeleton {className}" role={label ? 'status' : undefined}>
		{#if label}<span class="ds-sr-only">{label}</span>{/if}
		{#each items as i (i)}
			{#if variant === 'card'}
				{@render card()}
			{:else if variant === 'entity'}
				{@render entity()}
			{:else if variant === 'block'}
				<span
					class="blk"
					style:width={width ?? '100%'}
					style:height={height ?? '120px'}
					aria-hidden="true"
				></span>
			{:else}
				<span class="blk ln" style:width={width ?? '100%'} style:height={height} aria-hidden="true"
				></span>
			{/if}
		{/each}
	</span>
{/if}

<style>
	.ds-skeleton {
		display: contents;
	}
	.blk {
		display: block;
		border-radius: 3px;
		background: var(--ds-bg-3);
		animation: ds-pulse 1.6s ease-in-out infinite;
	}
	.ln {
		height: 12px;
	}
	.card {
		display: flex;
		flex-direction: column;
		gap: 6px;
		min-width: 0;
	}
	.thumb {
		aspect-ratio: 16 / 9;
		border-radius: var(--ds-radius-sm);
	}
	.entity {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px;
		border-radius: var(--ds-radius-md);
		border: 1px solid var(--ds-border-subtle);
		background: var(--ds-bg-2);
	}
	.av {
		flex: none;
		width: 56px;
		height: 56px;
		border-radius: var(--ds-radius-sm);
	}
	.col {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
</style>
