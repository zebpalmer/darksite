<script lang="ts">
	import {
		ActionBar,
		ActiveFilters,
		Button,
		FilterRail,
		PageHeader,
		Table,
		WorkView,
		type FilterSection,
		type FilterValue,
		type TableColumn
	} from '#lib';

	type Row = { id: string; name: string; queue: string; owner: string; count: number };
	const queues = ['Intake', 'Review', 'Done'];
	const owners = ['Field team', 'Ops desk', 'A. Rivera'];
	const all: Row[] = Array.from({ length: 80 }, (_, i) => ({
		id: `r${i}`,
		name: `Record ${String(i + 1).padStart(3, '0')}`,
		queue: queues[i % 3],
		owner: owners[i % 3 === 0 ? 0 : (i % 2) + 1],
		count: (i * 37) % 400
	}));
	const sections: FilterSection[] = [
		{
			key: 'queue',
			label: 'Queue',
			options: queues.map((q) => ({
				value: q,
				label: q,
				count: all.filter((r) => r.queue === q).length
			}))
		},
		{ key: 'q', label: 'Name contains', type: 'text' }
	];
	const columns: TableColumn<Row>[] = [
		{ key: 'name', label: 'Name' },
		{ key: 'queue', label: 'Queue', priority: 2 },
		{ key: 'owner', label: 'Owner', priority: 3 },
		{ key: 'count', label: 'Items', align: 'end', width: '96px' }
	];

	let value = $state<FilterValue>({});
	let selected = $state(new Set<string>());
	const rows = $derived(
		all.filter(
			(r) =>
				(!value.queue?.length || value.queue.includes(r.queue)) &&
				(!value.q?.length || r.name.toLowerCase().includes(value.q[0].toLowerCase()))
		)
	);
</script>

<svelte:head><title>WorkView · darksite</title></svelte:head>

<WorkView label="Records">
	{#snippet header()}
		<PageHeader title="Records" count={rows.length}>
			{#snippet actions()}<Button variant="primary">New record</Button>{/snippet}
		</PageHeader>
	{/snippet}
	{#snippet rail()}<FilterRail {sections} bind:value />{/snippet}
	{#snippet top()}<ActiveFilters {sections} bind:value />{/snippet}
	<Table {rows} {columns} rowKey={(r) => r.id} label="Records" selectable bind:selected />
	{#snippet footer()}
		<ActionBar label="Bulk actions">
			<span class="meta">{selected.size} selected</span>
			<span class="grow"></span>
			<Button disabled={!selected.size}>Move</Button>
			<Button variant="primary" disabled={!selected.size}>Mark done</Button>
		</ActionBar>
	{/snippet}
</WorkView>

<style>
	.meta {
		color: var(--ds-text-3);
		font-size: var(--ds-text-sm);
	}
</style>
