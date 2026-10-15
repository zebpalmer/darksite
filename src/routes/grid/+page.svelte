<script lang="ts">
	import { Card, Grid, PageHeader, SegmentedControl } from '#lib';
	import { thumb } from '../thumbs.js';
	let density = $state<'s' | 'm' | 'l'>('m');
</script>

<svelte:head><title>Grid · darksite</title></svelte:head>
<PageHeader title="Grid" count={24}>
	{#snippet actions()}
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
	<p>Columns follow the pane, not the viewport. Narrower than 520px, it goes 2-up.</p>
	<Grid {density} label="Records">
		{#each { length: 24 } as _, i (i)}
			<Card
				href="#{i}"
				title="Record {i + 1}"
				thumbnail={thumb(i + 20)}
				duration={60 + i * 97}
				meta="Field team"
			/>
		{/each}
	</Grid>
</div>
