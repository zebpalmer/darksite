<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import { SvelteSet } from 'svelte/reactivity';
	import { Card, Grid, PageHeader } from '#lib';
	import { thumb } from '../thumbs.js';

	const picks = [
		{ id: 'p1', title: 'Loading dock, east', n: 5 },
		{ id: 'p2', title: 'Stairwell B', n: 6 },
		{ id: 'p3', title: 'Plant room', n: 7 }
	];
	const selected = new SvelteSet<string>(['p2']);
	const toggle = (id: string) => (selected.has(id) ? selected.delete(id) : selected.add(id));
</script>

<svelte:head><title>Card · darksite</title></svelte:head>
<PageHeader title="Card" />
<div class="demo">
	<Grid label="Cards">
		<Card
			href="#a"
			title="Site walkthrough, north wing"
			thumbnail={thumb(1)}
			duration={1325}
			severity="medium"
			meta="Field team · 3 days ago"
			rating={4}
		/>
		<Card
			href="#b"
			title="Quarterly inspection"
			thumbnail={thumb(2)}
			duration={3725}
			progress={0.42}
			favorite
			meta="Inspections · Oct 2"
		/>
		<Card
			href="#c"
			title="Roof survey photos"
			thumbnail={thumb(3)}
			kind="gallery"
			imageCount={48}
			severity="high"
			meta="Surveys · 1 week ago"
		/>
		<Card
			href="#d"
			title="A record whose title is long enough to need truncating"
			thumbnail={thumb(4)}
			duration={84}
			meta="Archive"
		/>
		<Card href="#e" title="Missing thumbnail" duration={610} meta="Falls back to an icon tile" />
		<Card
			href="#f"
			title="Broken thumbnail"
			kind="gallery"
			thumbnail="data:image/png;base64,AAAA"
			imageCount={7}
			meta="Falls back too"
		/>
	</Grid>
	<h2>Select mode</h2>
	<Grid label="Selectable cards">
		{#each picks as p (p.id)}
			<Card
				href="#{p.id}"
				title={p.title}
				thumbnail={thumb(p.n)}
				duration={300 + p.n * 60}
				role="checkbox"
				aria-checked={selected.has(p.id)}
				onclick={(e) => {
					e.preventDefault();
					toggle(p.id);
				}}
				onkeydown={(e) => {
					if (e.key === ' ') {
						e.preventDefault();
						toggle(p.id);
					}
				}}
			>
				{#snippet overlay()}
					{#if selected.has(p.id)}<span class="check"><Check size={14} aria-hidden="true" /></span
						>{/if}
				{/snippet}
			</Card>
		{/each}
	</Grid>
	<p class="out">selected={[...selected].join(', ') || 'none'}</p>
</div>

<style>
	.check {
		position: absolute;
		top: 6px;
		left: 6px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: var(--ds-accent);
		color: var(--ds-accent-contrast);
	}
</style>
