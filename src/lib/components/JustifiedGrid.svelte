<!--
@component
JustifiedGrid — the image grid: rows that fill the width exactly, images at their own aspect ratio
with no crop, near a target row height. The last row is not stretched. A pane narrower than 520px
gets rows at 70% of the target. The layout is `justifyRows` (justify.ts); this component only
measures its width and renders it.

It carries the infinite-scroll sentinel: with `hasMore`, an observer 800px ahead of the end calls
`onLoadMore`.

- `items`, `key(item)`, `aspect(item)` (width ÷ height), `density` (`s` 160 | `m` 220 | `l` 300
  target height), `rowHeight` (overrides it), `gap` (px, default 6), `tile` snippet — receives
  `(item, index, { width, height })` — `hasMore`, `loadingMore`, `onLoadMore`, `label`,
  `onLayout(rows)`, `class`.
-->
<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';

	import Spinner from './Spinner.svelte';
	import { justifyRows, type JustifiedRow } from '../justify.js';

	interface Props {
		items: readonly T[];
		key: (item: T) => string | number;
		aspect: (item: T) => number;
		density?: 's' | 'm' | 'l';
		rowHeight?: number;
		gap?: number;
		tile: Snippet<[T, number, { width: number; height: number }]>;
		hasMore?: boolean;
		loadingMore?: boolean;
		onLoadMore?: () => void;
		label?: string;
		onLayout?: (rows: JustifiedRow[]) => void;
		class?: string;
	}

	let {
		items,
		key,
		aspect,
		density = 'm',
		rowHeight,
		gap = 6,
		tile,
		hasMore = false,
		loadingMore = false,
		onLoadMore,
		label = 'Images',
		onLayout,
		class: className = ''
	}: Props = $props();

	const TARGET = { s: 160, m: 220, l: 300 };
	let width = $state(0);
	let sentinel: HTMLDivElement | undefined = $state();

	const target = $derived((rowHeight ?? TARGET[density]) * (width > 0 && width < 520 ? 0.7 : 1));
	const rows = $derived(justifyRows(items.map(aspect), { width, target, gap }));

	$effect(() => {
		onLayout?.(rows);
	});

	$effect(() => {
		if (!sentinel || !hasMore || loadingMore || typeof IntersectionObserver === 'undefined') return;
		const io = new IntersectionObserver(
			(entries) => {
				if (entries.some((e) => e.isIntersecting)) onLoadMore?.();
			},
			{ rootMargin: '800px 0px' }
		);
		io.observe(sentinel);
		return () => io.disconnect();
	});
</script>

<div class="ds-justified {className}" bind:clientWidth={width}>
	<div class="rows" role="list" aria-label={label} style:gap="{gap}px">
		{#each rows as row, r (r)}
			<div class="row" style:gap="{gap}px" style:height="{row.height}px">
				{#each row.boxes as box (key(items[box.index]))}
					<div class="tile" role="listitem" style:width="{box.width}px" style:height="{box.height}px">
						{@render tile(items[box.index], box.index, { width: box.width, height: box.height })}
					</div>
				{/each}
			</div>
		{/each}
	</div>
	{#if hasMore}<div bind:this={sentinel} class="sentinel" aria-hidden="true"></div>{/if}
	{#if loadingMore}<div class="more"><Spinner size={16} label="Loading more" /></div>{/if}
</div>

<style>
	.ds-justified {
		min-width: 0;
	}
	.rows {
		display: flex;
		flex-direction: column;
	}
	.row {
		display: flex;
	}
	.tile {
		flex: none;
		overflow: hidden;
		border-radius: var(--ds-radius-sm);
		background: var(--ds-bg-3);
	}
	.tile > :global(*) {
		display: block;
		width: 100%;
		height: 100%;
	}
	.tile :global(img) {
		object-fit: cover;
	}
	.sentinel {
		height: 1px;
	}
	.more {
		display: flex;
		justify-content: center;
		padding: 16px;
	}
</style>
