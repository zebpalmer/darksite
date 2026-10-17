<script lang="ts">
	import Download from '@lucide/svelte/icons/download';
	import Plus from '@lucide/svelte/icons/plus';
	import Search from '@lucide/svelte/icons/search';
	import { Button, PageHeader } from '#lib';
	import { setHeaderActions } from '#lib/shell-context.js';

	// The shell's side of the contract, without a whole AppShell around each header.
	setHeaderActions({
		snippet: find,
		icon: Search,
		label: 'Search',
		key: '/',
		phone: false,
		current: undefined,
		fallback: true,
		host: 'bar',
		claimed: true,
		claim: () => () => {}
	});
</script>

{#snippet find()}
	<input class="ds-control" type="search" aria-label="Find" style="width: 240px" />
{/snippet}

{#snippet actions({ compact }: { compact: boolean })}
	{#if compact}
		<Button variant="icon" icon={Download} label="Export" />
		<Button variant="icon" icon={Plus} label="New record" />
	{:else}
		<Button icon={Download}>Export</Button>
		<Button variant="primary" icon={Plus}>New record</Button>
	{/if}
{/snippet}

{#each [['wide', 1000], ['mid', 700], ['narrow', 560]] as [id, width] (id)}
	<div style="width: {width}px" data-testid={id}>
		<PageHeader title="Records awaiting review" count={1284} {actions} />
	</div>
{/each}
