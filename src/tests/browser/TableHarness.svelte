<script lang="ts">
	import { Table, type TableColumn } from '#lib';
	interface Row {
		id: string;
		name: string;
		owner: string;
		state: string;
		queue: string;
	}
	const rows: Row[] = [
		{ id: '1', name: 'Alpha', owner: 'Field team', state: 'Ready', queue: 'North' },
		{ id: '2', name: 'Bravo', owner: 'Ops desk', state: 'On hold', queue: 'South' }
	];
	const columns: TableColumn<Row>[] = [
		{ key: 'name', label: 'Name' },
		{ key: 'owner', label: 'Owner', priority: 2 }
	];
	// Every column sized, so the visible ones must share what the hidden ones leave.
	const sized: TableColumn<Row>[] = [
		{ key: 'name', label: 'Name', width: '120px' },
		{ key: 'state', label: 'State', width: '100px' },
		{ key: 'owner', label: 'Owner', width: '160px', priority: 2 },
		{ key: 'queue', label: 'Queue', width: '120px', priority: 3 }
	];
</script>

<div style="width: 360px"><Table {rows} {columns} rowKey={(r) => r.id} label="Narrow" /></div>
<div style="width: 900px"><Table {rows} {columns} rowKey={(r) => r.id} label="Wide" /></div>
<div style="width: 360px">
	<Table {rows} columns={sized} groupBy={(r) => r.state} rowKey={(r) => r.id} label="Grouped" />
</div>
<div style="width: 360px">
	<Table rows={[]} columns={sized} rowKey={(r) => r.id} label="Empty" />
</div>
