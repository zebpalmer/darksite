<script lang="ts">
	import { Card, Carousel, PageHeader, SegmentedControl, Switch } from '#lib';
	import { thumb } from '../thumbs.js';

	interface Clip {
		id: number;
		title: string;
		duration: number;
	}
	const make = (from: number, n: number): Clip[] =>
		Array.from({ length: n }, (_, k) => ({
			id: from + k,
			title: `Record ${from + k + 1}`,
			duration: 45 + (from + k) * 83
		}));

	const recent = make(0, 18);
	const flagged = make(40, 7);
	let density = $state<'s' | 'm' | 'l'>('m');
	let loading = $state(false);
</script>

<svelte:head><title>Carousel · darksite</title></svelte:head>
<PageHeader title="Carousel">
	{#snippet actions()}
		<Switch label="Loading" bind:checked={loading} />
		<SegmentedControl
			label="Density"
			bind:value={density}
			options={[
				{ value: 's', label: 'S' },
				{ value: 'm', label: 'M' },
				{ value: 'l', label: 'L' }
			]}
		/>
	{/snippet}
</PageHeader>
<div class="demo">
	<p>
		Tab lands on one tile; ← and → move along the row, Home and End jump to its ends. With a mouse,
		the scroll buttons appear on hover. On touch, swipe.
	</p>
	<div class="rows">
		<Carousel
			items={recent}
			key={(c) => c.id}
			title="Recent"
			count={240}
			href="#all"
			{density}
			{loading}
		>
			{#snippet tile(c)}
				<Card
					href="#{c.id}"
					title={c.title}
					thumbnail={thumb(c.id + 5)}
					duration={c.duration}
					meta="Field team"
				/>
			{/snippet}
		</Carousel>

		<Carousel
			items={flagged}
			key={(c) => c.id}
			title="Flagged for review"
			count={flagged.length}
			{density}
			{loading}
		>
			{#snippet tile(c)}
				<Card
					href="#{c.id}"
					title={c.title}
					thumbnail={thumb(c.id + 11)}
					duration={c.duration}
					severity="high"
					meta="Inspections"
				/>
			{/snippet}
		</Carousel>

		<Carousel items={[]} key={(c: Clip) => c.id} title="Shared with you" {density}>
			{#snippet tile(c)}<Card href="#{c.id}" title={c.title} />{/snippet}
			{#snippet empty()}Nothing shared yet.{/snippet}
		</Carousel>
	</div>

	<h2>In a narrow pane</h2>
	<p>A pane under 520px shows a little over two tiles, whatever the density.</p>
	<div class="narrow">
		<Carousel items={recent} key={(c) => c.id} title="Recent" level={3} href="#all" {density}>
			{#snippet tile(c)}
				<Card href="#n{c.id}" title={c.title} thumbnail={thumb(c.id + 5)} duration={c.duration} />
			{/snippet}
		</Carousel>
	</div>
</div>

<style>
	.rows {
		display: flex;
		flex-direction: column;
		gap: var(--ds-space-8);
	}
	.narrow {
		max-width: 380px;
		padding: var(--ds-space-3);
		border: 1px dashed var(--ds-border-strong);
		border-radius: var(--ds-radius-md);
	}
</style>
