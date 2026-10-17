<script lang="ts">
	import { AppShell, PageHeader, TopBar, type NavItem } from '#lib';

	interface Props {
		current?: string;
		header?: boolean;
		level?: 1 | 2;
		shellActions?: boolean;
		withActions?: boolean;
		headerActionsKey?: string | null;
		headerActionsFallback?: boolean;
		withTopBar?: boolean;
		nav?: 'rail' | 'top';
	}

	let {
		current = 'home',
		header = true,
		level = 1,
		shellActions = true,
		withActions = true,
		headerActionsKey = '/',
		headerActionsFallback = true,
		withTopBar = false,
		nav = 'rail'
	}: Props = $props();

	const items: NavItem[] = [
		{ id: 'home', label: 'Home', href: '/' },
		{ id: 'records', label: 'Records', href: '/records' }
	];
</script>

<AppShell
	{nav}
	{items}
	{current}
	toaster={false}
	headerActions={withActions ? find : undefined}
	{headerActionsKey}
	{headerActionsFallback}
	topBar={withTopBar ? bar : undefined}
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

{#snippet bar()}
	<TopBar label="Section">
		{#snippet actions()}<button type="button">Create</button>{/snippet}
	</TopBar>
{/snippet}
