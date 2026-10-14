<script lang="ts">
	import { Meter } from '#lib';
</script>

<svelte:head><title>Meter · darksite</title></svelte:head>
<h1>Meter</h1>
<div class="col">
	<Meter
		label="Records by state"
		segments={[
			{ label: 'Open', value: 185 },
			{ label: 'In progress', value: 78 },
			{ label: 'Blocked', value: 24 }
		]}
	/>
	<Meter
		label="Import"
		kind="progress"
		max={400}
		segments={[
			{ label: 'Done', value: 260, tone: 'success' },
			{ label: 'Failed', value: 12, tone: 'danger' }
		]}
	/>
	<Meter label="Storage" max={100} segments={[{ label: 'Used', value: 71 }]} legend={false} />
	<div class="row">
		{#each [1, 2, 3, 4, 5] as n (n)}<span
				style="display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--ds-text-2)"
				><span style="width:28px;height:8px;border-radius:2px;background:var(--ds-cat-{n})"
				></span>ds-cat-{n}</span
			>{/each}
	</div>
</div>
<p>
	Categorical colors by position, or a semantic tone when a segment means one. At most three
	segments.
</p>

<style>
	h1 {
		margin: 0 0 var(--ds-space-6);
		font-size: var(--ds-text-xl);
		font-weight: 500;
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--ds-space-2);
		margin-bottom: var(--ds-space-4);
	}
	.col {
		display: flex;
		flex-direction: column;
		gap: var(--ds-space-4);
		max-width: 720px;
	}
	p {
		color: var(--ds-text-3);
		font-size: var(--ds-text-xs);
	}
</style>
