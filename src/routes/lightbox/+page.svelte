<script lang="ts">
	import Info from '@lucide/svelte/icons/info';
	import { Button, JustifiedGrid, Lightbox, PageHeader, Switch, type LightboxItem } from '#lib';
	import { thumb } from '../thumbs.js';

	const shapes = [
		[3, 2],
		[2, 3],
		[1, 1],
		[16, 9],
		[4, 3],
		[3, 4]
	];
	const photos = Array.from({ length: 18 }, (_, i) => {
		const [w, h] = shapes[i % shapes.length];
		return { id: i, w: w * 400, h: h * 400 };
	});
	const items: LightboxItem[] = photos.map((p) => ({
		src: thumb(p.id + 30, p.w, p.h),
		alt: `Photo ${p.id + 1}`,
		width: p.w,
		height: p.h
	}));

	let open = $state(false);
	let index = $state(0);
	let loop = $state(false);
	let details = $state(false);
</script>

<svelte:head><title>Lightbox · darksite</title></svelte:head>
<PageHeader title="Lightbox" count={items.length}>
	{#snippet actions()}
		<Switch label="Loop" bind:checked={loop} />
	{/snippet}
</PageHeader>
<div class="demo">
	<p>
		Open any image. ← and → step, + and − zoom, 0 fits, Esc closes and returns focus here.
		Double-click to zoom and drag to pan; on touch, swipe, pinch, double-tap, or swipe down to
		close.
	</p>
	<JustifiedGrid
		items={photos}
		key={(p) => p.id}
		aspect={(p) => p.w / p.h}
		density="s"
		label="Photos"
	>
		{#snippet tile(p, i, box)}
			<button
				type="button"
				class="open"
				aria-label="Open {items[i].alt}"
				onclick={() => {
					index = i;
					open = true;
				}}
			>
				<img src={thumb(p.id + 30, Math.round(box.width), Math.round(box.height))} alt="" />
			</button>
		{/snippet}
	</JustifiedGrid>
</div>

<Lightbox {items} bind:open bind:index {loop}>
	{#snippet caption(item)}{item.alt}{#if details}
			· {item.width} × {item.height} px{/if}{/snippet}
	{#snippet actions()}
		<Button
			variant="icon"
			icon={Info}
			label="Details"
			pressed={details}
			onclick={() => (details = !details)}
		/>
	{/snippet}
</Lightbox>

<style>
	.open {
		display: block;
		width: 100%;
		height: 100%;
		padding: 0;
		border: 0;
		background: none;
		cursor: zoom-in;
	}
	.open img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.open:focus-visible {
		outline-offset: -2px;
	}
</style>
