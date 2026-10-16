<script lang="ts">
	import { page } from '$app/state';
	import { PageHeader, Pager, Table, pageFromUrl, type TableColumn } from '#lib';

	interface Row {
		id: string;
		name: string;
	}
	const total = 137;
	const pageSize = 25;
	const current = $derived(pageFromUrl(page.url, 'p'));
	const rows = $derived(
		Array.from(
			{ length: Math.max(0, Math.min(pageSize, total - (current - 1) * pageSize)) },
			(_, i) => {
				const n = (current - 1) * pageSize + i + 1;
				return { id: String(n), name: `Entry ${String(n).padStart(3, '0')}` };
			}
		)
	);
	const columns: TableColumn<Row>[] = [{ key: 'name', label: 'Name' }];
</script>

<svelte:head><title>Pager · darksite</title></svelte:head>
<PageHeader title="Pager" count={total} />
<div class="demo">
	<div class="col">
		<Table {rows} {columns} rowKey={(r) => r.id} label="Entries" />
		<Pager url={page.url} param="p" {pageSize} {total} />
	</div>
	<p>
		Each end is a link to a URL, so a page of the list can be shared and bookmarked; the end with
		nowhere to go stays in place, disabled. Lists inside an app use LoadMore instead.
	</p>
	<div class="col">
		<Pager page={3} pageSize={50} hasMore href={(n) => `#page-${n}`} />
	</div>
	<p>With no total: the range alone, and Older while there is more.</p>
</div>

<style>
	.col {
		max-width: 640px;
	}
</style>
