<script lang="ts">
	import { Table, type TableColumn } from '#lib';
	let { width, tableWidth }: { width: string; tableWidth: number } = $props();
	const rows = [{ id: '1', name: 'Alpha', a: 1, b: 2, c: 3 }];
	type Row = (typeof rows)[number];
	const columns: TableColumn<Row>[] = $derived([
		{ key: 'name', label: 'Name', width },
		{ key: 'a', label: 'A' },
		{ key: 'b', label: 'B' },
		{ key: 'c', label: 'C' }
	]);
</script>

<div style="width: {tableWidth}px">
	<Table {rows} {columns} rowKey={(r) => r.id} label="Widths" />
</div>
