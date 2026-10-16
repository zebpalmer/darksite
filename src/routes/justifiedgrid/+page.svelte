<script lang="ts">
	import { JustifiedGrid, PageHeader, SegmentedControl } from '#lib';
	import { thumb } from '../thumbs.js';

	interface Photo {
		id: number;
		w: number;
		h: number;
	}
	const shapes = [
		[3, 2],
		[2, 3],
		[1, 1],
		[16, 9],
		[4, 3],
		[3, 4],
		[21, 9],
		[4, 5]
	];
	const make = (from: number, n: number): Photo[] =>
		Array.from({ length: n }, (_, k) => {
			const [w, h] = shapes[(from + k) % shapes.length];
			return { id: from + k, w: w * 100, h: h * 100 };
		});

	let photos = $state(make(0, 40));
	let loadingMore = $state(false);
	let density = $state<'s' | 'm' | 'l'>('m');

	function loadMore() {
		if (loadingMore || photos.length >= 160) return;
		loadingMore = true;
		setTimeout(() => {
			photos = [...photos, ...make(photos.length, 40)];
			loadingMore = false;
		}, 600);
	}
</script>

<svelte:head><title>JustifiedGrid · darksite</title></svelte:head>
<PageHeader title="JustifiedGrid" count={photos.length}>
	{#snippet actions()}
		<SegmentedControl
			label="Row height"
			bind:value={density}
			options={[
				{ value: 's', label: 'S' },
				{ value: 'm', label: 'M' },
				{ value: 'l', label: 'L' }
			]}
		/>
	{/snippet}
</PageHeader>
<JustifiedGrid
	items={photos}
	key={(p) => p.id}
	aspect={(p) => p.w / p.h}
	{density}
	hasMore={photos.length < 160}
	{loadingMore}
	onLoadMore={loadMore}
	label="Photos"
>
	{#snippet tile(p, _i, box)}
		<img
			src={thumb(p.id + 3, Math.round(box.width), Math.round(box.height))}
			alt="Photo {p.id + 1}"
			loading="lazy"
		/>
		<span class="pill">{p.w / 100}:{p.h / 100}</span>
	{/snippet}
</JustifiedGrid>

<style>
	/* An overlay: the tile positions it, no wrapper needed. */
	.pill {
		position: absolute;
		right: 6px;
		bottom: 6px;
		padding: 1px 6px;
		border-radius: var(--ds-radius-sm);
		background: var(--ds-media-scrim);
		color: var(--ds-on-media);
		font-family: var(--font-mono);
		font-size: var(--ds-text-xs);
		line-height: var(--ds-lh-xs);
	}
</style>
