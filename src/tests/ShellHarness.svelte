<script lang="ts">
	import { AppShell, PageHeader, type NavItem } from '#lib';

	interface Props {
		current?: string;
		header?: boolean;
		level?: 1 | 2;
		shellActions?: boolean;
		withActions?: boolean;
		headerActionsKey?: string | null;
	}

	let {
		current = 'home',
		header = true,
		level = 1,
		shellActions = true,
		withActions = true,
		headerActionsKey = '/'
	}: Props = $props();

	const items: NavItem[] = [
		{ id: 'home', label: 'Home', href: '/' },
		{ id: 'records', label: 'Records', href: '/records' }
	];
</script>

<AppShell
	{items}
	{current}
	toaster={false}
	headerActions={withActions ? find : undefined}
	{headerActionsKey}
>
	{#if header}
		<PageHeader title="Records" {level} {shellActions}>
			{#snippet actions()}<button type="button">New record</button>{/snippet}
		</PageHeader>
	{/if}
	<input aria-label="Notes" />
</AppShell>

{#snippet find()}
	<input type="search" aria-label="Find" />
{/snippet}
