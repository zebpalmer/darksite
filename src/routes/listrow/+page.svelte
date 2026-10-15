<script lang="ts">
	import FileText from '@lucide/svelte/icons/file-text';
	import { Avatar, Checkbox, ListRow, PageHeader, StatusBadge } from '#lib';

	const records = [
		{ id: 'R-00410', meta: 'Field team · 6 min ago', status: 'Ready' },
		{ id: 'R-00411', meta: 'North site · 2 h ago', status: 'On hold' },
		{ id: 'R-00412', meta: 'Field team · 1 day ago', status: 'Ready' }
	];
	const people = ['A. Rivera', 'M. Lund', 'J. Okafor'];
	let current = $state('R-00411');
	let picked = $state<string[]>(['M. Lund']);

	function toggle(name: string, on: boolean) {
		picked = on ? [...picked, name] : picked.filter((p) => p !== name);
	}
</script>

<svelte:head><title>ListRow · darksite</title></svelte:head>
<PageHeader title="ListRow" />
<div class="demo">
	<p>
		One record per row, neither a table nor a card: a queue beside a detail pane, a picker, a short
		list in a panel.
	</p>
	<h2>A queue, with the current row</h2>
	<ul class="list">
		{#each records as r (r.id)}
			<ListRow
				title={r.id}
				meta={r.meta}
				current={current === r.id}
				onclick={() => (current = r.id)}
			>
				{#snippet leading()}<FileText size={16} aria-hidden="true" />{/snippet}
				{#snippet trailing()}<StatusBadge
						label={r.status}
						tone={r.status === 'Ready' ? 'success' : 'warning'}
					/>{/snippet}
			</ListRow>
		{/each}
	</ul>
	<h2>Two lines, dense, with selection</h2>
	<ul class="list">
		{#each people as name (name)}
			<ListRow
				title={name}
				meta="Field team"
				lines={2}
				dense
				selected={picked.includes(name)}
				href="/listrow"
			>
				{#snippet leading()}<Avatar {name} size={24} />{/snippet}
				{#snippet trailing()}<Checkbox
						label="Select {name}"
						hideLabel
						checked={picked.includes(name)}
						onchange={(on: boolean) => toggle(name, on)}
					/>{/snippet}
			</ListRow>
		{/each}
	</ul>
</div>

<style>
	.list {
		display: flex;
		flex-direction: column;
		gap: 2px;
		max-width: 520px;
		margin: 0;
		padding: 4px;
		border: 1px solid var(--ds-border-subtle);
		border-radius: var(--ds-radius-md);
		background: var(--ds-bg-1);
		list-style: none;
	}
</style>
