<script lang="ts">
	import { Button, Table, type TableColumn, type TableSort } from '#lib';

	interface Item {
		id: string;
		name: string;
		owner: string | null;
		serial: string;
		status: string;
		updated: string;
		count: number;
	}

	const owners = ['Field team', 'A. Rivera', 'M. Lund', null, 'Ops desk'];
	const statuses = ['In progress', 'Ready', 'On hold', 'Ready', 'Retired'];
	const all: Item[] = Array.from({ length: 24 }, (_, i) => ({
		id: `r${i + 1}`,
		name: `Record ${String(i + 1).padStart(3, '0')}${i === 4 ? ', with a name long enough that it has to truncate' : ''}`,
		owner: owners[i % owners.length],
		serial: `R-${String(41200 + i * 7).padStart(5, '0')}`,
		status: statuses[i % statuses.length],
		updated: `${(i % 9) + 1}d ago`,
		count: (i * 37) % 400
	}));

	const columns: TableColumn<Item>[] = [
		{ key: 'name', label: 'Name', sortable: true },
		{ key: 'serial', label: 'Serial', mono: true, width: '110px', priority: 2 },
		{ key: 'owner', label: 'Owner', sortable: true, priority: 2 },
		{ key: 'status', label: 'Status', width: '120px', priority: 3 },
		{ key: 'updated', label: 'Updated', width: '100px', priority: 3 },
		{ key: 'count', label: 'Items', align: 'end', width: '96px', sortable: true }
	];

	let sort = $state<TableSort | null>({ key: 'name', direction: 'asc' });
	let selected = $state(new Set<string>());
	let dense = $state(false);
	let loading = $state(false);

	const rows = $derived(
		[...all].sort((a, b) => {
			if (!sort) return 0;
			const av = a[sort.key as keyof Item] ?? '';
			const bv = b[sort.key as keyof Item] ?? '';
			const c = av < bv ? -1 : av > bv ? 1 : 0;
			return sort.direction === 'asc' ? c : -c;
		})
	);
</script>

<svelte:head><title>Table · darksite</title></svelte:head>
<h1>Table</h1>
<div class="bar">
	<Button size="dense" pressed={dense} onclick={() => (dense = !dense)}>Dense</Button>
	<Button size="dense" pressed={loading} onclick={() => (loading = !loading)}>Loading</Button>
	<span class="meta">{selected.size} selected</span>
</div>
<div class="pane">
	<Table
		{rows}
		{columns}
		rowKey={(r) => r.id}
		label="Records"
		selectable
		bind:selected
		bind:sort
		href={(r) => `#${r.id}`}
		density={dense ? 'dense' : 'default'}
		{loading}
	/>
</div>
<p>
	A work view: the table is the pane's scrolling body, so its header sticks. Narrow the window and
	the priority 3, then priority 2, columns drop.
</p>

<style>
	h1 {
		margin: 0 0 var(--ds-space-4);
		font-size: var(--ds-text-xl);
		font-weight: 500;
	}
	.bar {
		display: flex;
		align-items: center;
		gap: var(--ds-space-2);
		margin-bottom: var(--ds-space-3);
	}
	.meta {
		margin-left: var(--ds-space-2);
		color: var(--ds-text-3);
		font-size: var(--ds-text-sm);
	}
	.pane {
		display: flex;
		flex-direction: column;
		height: 420px;
		border: 1px solid var(--ds-border-subtle);
		border-radius: var(--ds-radius-md);
		overflow: hidden;
	}
	.pane :global(.ds-table) {
		flex: 1;
		min-height: 0;
	}
	p {
		color: var(--ds-text-3);
		font-size: var(--ds-text-xs);
	}
</style>
