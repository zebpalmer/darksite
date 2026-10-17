<script lang="ts">
	import { Table, type TableColumn } from '#lib';
	let { widths = {} }: { widths?: Record<string, string> } = $props();
	const rows = [{ id: '1', name: 'Alpha', score: 98, state: 'Ready' }];
	type Row = (typeof rows)[number];
	const columns: TableColumn<Row>[] = $derived([
		{ key: 'name', label: 'Name', sortable: true, width: widths.name },
		{
			key: 'score',
			label: 'Reliability',
			sortable: true,
			align: 'end',
			tip: 'How often it answers',
			width: widths.score
		},
		{ key: 'state', label: 'Status', sortable: true, width: widths.state }
	]);
</script>

<div style="width: 1200px">
	<Table
		{rows}
		{columns}
		rowKey={(r) => r.id}
		label="Heads"
		sort={{ key: 'name', direction: 'asc' }}
	/>
</div>
