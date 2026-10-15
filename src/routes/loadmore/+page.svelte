<script lang="ts">
	import { LoadMore, PageHeader, Table, type TableColumn } from '#lib';

	interface Row {
		id: string;
		name: string;
		count: number;
	}
	const make = (from: number, n: number): Row[] =>
		Array.from({ length: n }, (_, i) => ({
			id: `r${from + i}`,
			name: `Record ${String(from + i + 1).padStart(3, '0')}`,
			count: ((from + i) * 37) % 400
		}));
	const total = 95;
	let rows = $state(make(0, 20));
	let loading = $state(false);
	const columns: TableColumn<Row>[] = [
		{ key: 'name', label: 'Name' },
		{ key: 'count', label: 'Items', align: 'end' }
	];

	async function more() {
		loading = true;
		await new Promise((r) => setTimeout(r, 600));
		rows = [...rows, ...make(rows.length, Math.min(20, total - rows.length))];
		loading = false;
	}
</script>

<svelte:head><title>LoadMore · darksite</title></svelte:head>
<PageHeader title="LoadMore" count={total} />
<div class="demo">
	<Table {rows} {columns} rowKey={(r) => r.id} label="Records" />
	<LoadMore
		shown={rows.length}
		{total}
		{loading}
		onLoadMore={more}
		focusRow={(i) => document.querySelectorAll<HTMLElement>('table tbody tr')[i]?.focus()}
	/>
	<p>Press Load more from the keyboard: focus moves to the first new row.</p>
</div>
