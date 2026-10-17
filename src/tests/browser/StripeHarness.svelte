<script lang="ts">
	import { Table, type TableColumn } from '#lib';
	interface Row {
		id: string;
		name: string;
		state: string;
	}
	const rows: Row[] = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo'].map((name, i) => ({
		id: String(i + 1),
		name,
		state: i < 3 ? 'Ready' : 'On hold'
	}));
	const columns: TableColumn<Row>[] = [
		{ key: 'name', label: 'Name' },
		{ key: 'state', label: 'State' }
	];
</script>

<!-- Row 2 is marked, row 4 is selected: both are stripe rows. -->
<div style="width: 480px">
	<Table
		{rows}
		{columns}
		rowKey={(r) => r.id}
		label="Ledger"
		striped
		selectable
		selected={new Set(['4'])}
		rowTone={(r) => (r.id === '2' ? 'warning' : null)}
	/>
</div>
<div style="width: 480px">
	<Table {rows} {columns} rowKey={(r) => r.id} label="Plain" />
</div>
<div style="width: 480px">
	<Table
		{rows}
		{columns}
		rowKey={(r) => r.id}
		label="Grouped ledger"
		striped
		groupBy={(r) => r.state}
	/>
</div>
