<script lang="ts">
	import { replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import {
		ActiveFilters,
		FilterRail,
		filtersFromParams,
		filtersToParams,
		Table,
		type FilterSection,
		type FilterValue,
		type TableColumn
	} from '#lib';

	type Row = { id: string; name: string; status: string; owner: string; assignee: string };
	const statuses = ['ready', 'hold', 'progress'];
	const owners = ['field', 'ops'];
	const all: Row[] = Array.from({ length: 30 }, (_, i) => ({
		id: `r${i}`,
		name: `Record ${String(i + 1).padStart(3, '0')}`,
		status: statuses[i % 3],
		owner: owners[i % 2],
		assignee: `u-${(i % 12) + 1}`
	}));
	const people = Array.from({ length: 12 }, (_, i) => ({
		value: `u-${i + 1}`,
		label:
			['A. Rivera', 'M. Lund', 'J. Okafor', 'S. Brandt', 'K. Imai', 'L. Moreau'][i % 6] +
			` ${i + 1}`
	}));
	const sections: FilterSection[] = [
		{
			key: 'status',
			label: 'Status',
			options: [
				{ value: 'ready', label: 'Ready', count: 10 },
				{ value: 'progress', label: 'In progress', count: 10 },
				{ value: 'hold', label: 'On hold', count: 10 }
			]
		},
		{
			key: 'owner',
			label: 'Owner',
			multiple: false,
			options: [
				{ value: 'field', label: 'Field team', count: 15 },
				{ value: 'ops', label: 'Ops desk', count: 15 }
			]
		},
		{ key: 'q', label: 'Name contains', type: 'text', placeholder: 'Record 01' },
		{
			key: 'assignee',
			label: 'Assignee',
			type: 'search',
			placeholder: 'Search people',
			options: people,
			// A linked value that is not in the list keeps its place, with a readable label.
			labelFor: (v) => (v.startsWith('u-') ? `Person ${v.slice(2)}` : undefined)
		}
	];
	const label = (key: string, v: string) =>
		sections.find((s) => s.key === key)?.options?.find((o) => o.value === v)?.label ?? v;
	const columns: TableColumn<Row>[] = [
		{ key: 'name', label: 'Name' },
		{ key: 'status', label: 'Status', value: (r) => label('status', r.status) },
		{ key: 'owner', label: 'Owner', value: (r) => label('owner', r.owner) }
	];

	// The state lives in the URL, so a filtered view can be linked and survives a reload.
	let value = $state<FilterValue>({});
	// Prerendered pages have no query string; read it once the page is in the browser.
	$effect(() => {
		value = filtersFromParams(page.url.searchParams, sections);
	});
	function sync(next: FilterValue) {
		replaceState(`?${filtersToParams(next, sections, page.url.searchParams)}`, {});
	}
	const rows = $derived(
		all.filter(
			(r) =>
				(!value.status?.length || value.status.includes(r.status)) &&
				(!value.owner?.length || value.owner.includes(r.owner)) &&
				(!value.q?.length || r.name.toLowerCase().includes(value.q[0].toLowerCase())) &&
				(!value.assignee?.length || value.assignee.includes(r.assignee))
		)
	);
</script>

<svelte:head><title>FilterRail · darksite</title></svelte:head>
<h1>FilterRail</h1>
<div class="work">
	<FilterRail {sections} bind:value onchange={sync} />
	<div class="results">
		<ActiveFilters {sections} bind:value onchange={sync} />
		<Table {rows} {columns} rowKey={(r) => r.id} label="Records" />
	</div>
</div>

<style>
	h1 {
		margin: 0 0 var(--ds-space-4);
		font-size: var(--ds-text-xl);
		font-weight: 500;
	}
	.work {
		display: flex;
		height: 460px;
		border: 1px solid var(--ds-border-subtle);
		border-radius: var(--ds-radius-md);
		overflow: hidden;
	}
	.results {
		display: flex;
		flex-direction: column;
		gap: 10px;
		flex: 1;
		min-width: 0;
		padding: 10px 0 0;
	}
	.results :global(.ds-activefilters) {
		padding: 0 12px;
	}
	.results :global(.ds-table) {
		flex: 1;
		min-height: 0;
	}
	@media (max-width: 767.98px) {
		.work {
			flex-direction: column;
			height: auto;
		}
		.results {
			padding-top: 0;
		}
	}
</style>
