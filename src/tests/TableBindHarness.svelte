<script lang="ts">
	import { Table, type TableColumn, type TableSort } from '#lib';
	interface Row {
		id: string;
		name: string;
	}
	const rows: Row[] = [
		{ id: 'r1', name: 'Alpha' },
		{ id: 'r2', name: 'Bravo' }
	];
	const columns: TableColumn<Row>[] = [{ key: 'name', label: 'Name', sortable: true }];
	// One sort and one selection per tab, bound to entries that do not exist yet.
	const sorts: Record<string, TableSort | null | undefined> = $state({});
	const picks: Record<string, Set<string> | undefined> = $state({});
	const tab = 'open';
</script>

<Table
	{rows}
	{columns}
	rowKey={(r) => r.id}
	label="Records"
	selectable
	bind:sort={sorts[tab]}
	bind:selected={picks[tab]}
/>
<output data-testid="sort"
	>{sorts[tab] ? `${sorts[tab].key} ${sorts[tab].direction}` : 'none'}</output
>
<output data-testid="picks">{picks[tab] ? [...picks[tab]].join(',') : 'none'}</output>
