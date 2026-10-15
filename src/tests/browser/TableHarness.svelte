<script lang="ts">
	import { Table, type TableColumn } from '#lib';
	interface Row {
		id: string;
		name: string;
		owner: string;
	}
	const rows: Row[] = [
		{ id: '1', name: 'Alpha', owner: 'Field team' },
		{ id: '2', name: 'Bravo', owner: 'Ops desk' }
	];
	const columns: TableColumn<Row>[] = [
		{ key: 'name', label: 'Name' },
		{ key: 'owner', label: 'Owner', priority: 2 }
	];
</script>

<div style="width: 360px"><Table {rows} {columns} rowKey={(r) => r.id} label="Narrow" /></div>
<div style="width: 900px"><Table {rows} {columns} rowKey={(r) => r.id} label="Wide" /></div>
