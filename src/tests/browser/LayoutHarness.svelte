<script lang="ts">
	import { Button, PageHeader, Stat, StatRow } from '#lib';
</script>

<div style="width: 360px" data-testid="long">
	<PageHeader title="Records awaiting review" count={1284}>
		{#snippet actions()}
			<Button>Export</Button>
			<Button variant="primary">New record</Button>
		{/snippet}
	</PageHeader>
</div>
<div style="width: 360px" data-testid="short">
	<PageHeader title="Records" count={1284}>
		{#snippet actions()}<Button variant="primary">New record</Button>{/snippet}
	</PageHeader>
</div>
<div style="width: 1000px" data-testid="five">
	<StatRow max={5}>
		{#each ['Queued', 'In review', 'Approved', 'Returned', 'Total'] as label (label)}
			<Stat {label} value={3} />
		{/each}
	</StatRow>
</div>
<div style="width: 900px" data-testid="five-narrow">
	<StatRow max={5}>
		{#each ['Queued', 'In review', 'Approved', 'Returned', 'Total'] as label (label)}
			<Stat {label} value={3} />
		{/each}
	</StatRow>
</div>
