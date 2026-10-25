<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import Download from '@lucide/svelte/icons/download';
	import Filter from '@lucide/svelte/icons/funnel';
	import Plus from '@lucide/svelte/icons/plus';
	import Search from '@lucide/svelte/icons/search';
	import Share from '@lucide/svelte/icons/share';
	import Trash from '@lucide/svelte/icons/trash';
	import { Button, PageHeader } from '#lib';
	import { setHeaderActions } from '#lib/shell-context.js';

	let { phone = true, width = '100%' }: { phone?: boolean; width?: string } = $props();

	// The shell's side of the contract, as AppShell sets it on a phone: its actions are already an
	// icon button there, so the header's first step changes nothing on screen.
	// svelte-ignore state_referenced_locally
	setHeaderActions({
		snippet: find,
		icon: Search,
		label: 'Search',
		key: '/',
		phone,
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
		<Button variant="icon" icon={Check} label="Select" />
		<Button variant="icon" icon={Download} label="Export" />
		<Button variant="icon" icon={Plus} label="New record" />
	{:else}
		<Button icon={Check}>Select</Button>
		<Button icon={Download}>Export</Button>
		<Button variant="primary" icon={Plus}>New record</Button>
	{/if}
{/snippet}

{#snippet many({ compact }: { compact: boolean })}
	{#if compact}
		<Button variant="icon" icon={Check} label="Select" />
		<Button variant="icon" icon={Filter} label="Filter" />
		<Button variant="icon" icon={Share} label="Share" />
		<Button variant="icon" icon={Trash} label="Delete" />
		<Button variant="icon" icon={Download} label="Export" />
		<Button variant="icon" icon={Plus} label="New record" />
	{:else}
		<Button icon={Check}>Select</Button>
		<Button icon={Filter}>Filter</Button>
		<Button icon={Share}>Share</Button>
		<Button icon={Trash}>Delete</Button>
		<Button icon={Download}>Export</Button>
		<Button variant="primary" icon={Plus}>New record</Button>
	{/if}
{/snippet}

<!-- A page's header as it mounts with its data: a title, a count and several actions at once. -->
<div style="width: {width}" data-testid="several">
	<PageHeader title="Field team" count={38} {actions} />
</div>
<div style="width: {width}" data-testid="many">
	<PageHeader title="Field team" count={38} actions={many} />
</div>
