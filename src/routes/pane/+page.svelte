<script lang="ts">
	import { Button, Pane, Table, type TableColumn } from '#lib';
	type Row = { id: string; name: string; owner: string | null; count: number };
	const rows: Row[] = [
		{ id: '1', name: 'Record 001', owner: 'Field team', count: 12 },
		{ id: '2', name: 'Record 002', owner: null, count: 4 },
		{ id: '3', name: 'Record 003', owner: 'A. Rivera', count: 31 }
	];
	const columns: TableColumn<Row>[] = [
		{ key: 'name', label: 'Name' },
		{ key: 'owner', label: 'Owner' },
		{ key: 'count', label: 'Items', align: 'end', width: '80px' }
	];
</script>

<svelte:head><title>Pane · darksite</title></svelte:head>
<h1>Pane</h1>
<div class="col">
	<Pane title="Recently changed" meta="3 records" tip="Records changed in the last 24 hours.">
		{#snippet end()}<Button variant="ghost" size="dense" href="/table">View all</Button>{/snippet}
		<Table {rows} {columns} rowKey={(r) => r.id} label="Recently changed" />
		{#snippet footer()}Updated just now{/snippet}
	</Pane>
	<Pane title="Notes" padded>
		<p style="margin: 0; color: var(--ds-text-2); font-size: var(--ds-text-md)">
			A padded body for prose or a form. Unpadded, a table sits flush.
		</p>
	</Pane>
</div>

<style>
	h1 {
		margin: 0 0 var(--ds-space-6);
		font-size: var(--ds-text-xl);
		font-weight: 500;
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
