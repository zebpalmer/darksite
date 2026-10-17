<script lang="ts">
	import BookOpen from '@lucide/svelte/icons/book-open';
	import Boxes from '@lucide/svelte/icons/boxes';
	import ChartColumn from '@lucide/svelte/icons/chart-column';
	import Search from '@lucide/svelte/icons/search';
	import { Button, PageHeader, ThemeToggle, TopNav, type NavGroup, type NavItem } from '#lib';

	const groups: NavGroup[] = [
		{ id: 'records', label: 'Records' },
		{ id: 'guides', label: 'Guides' }
	];
	const items: NavItem[] = [
		{
			id: 'records',
			label: 'All records',
			href: '#records',
			group: 'records',
			icon: Boxes,
			description: 'Every record, by state and owner.'
		},
		{
			id: 'reports',
			label: 'Reports',
			href: '#reports',
			group: 'records',
			icon: ChartColumn,
			description: 'Totals by month and team.',
			badge: 3
		},
		{
			id: 'start',
			label: 'Getting started',
			href: '#start',
			group: 'guides',
			section: 'Learn',
			description: 'The first ten minutes.'
		},
		{
			id: 'import',
			label: 'Importing records',
			href: '#import',
			group: 'guides',
			section: 'Learn'
		},
		{
			id: 'roles',
			label: 'Roles and access',
			href: '#roles',
			group: 'guides',
			section: 'Run',
			description: 'Who can see and change what.'
		},
		{ id: 'exports', label: 'Exports', href: '#exports', group: 'guides', section: 'Run' },
		{
			id: 'api',
			label: 'API',
			href: '#api',
			group: 'guides',
			section: 'Reference',
			description: 'Endpoints, limits and errors.'
		},
		{
			id: 'states',
			label: 'Record states',
			href: '#states',
			group: 'guides',
			section: 'Reference'
		},
		{ id: 'all', label: 'All guides', href: '#guides', group: 'guides', icon: BookOpen },
		{ id: 'news', label: 'News', href: '#news' },
		{ id: 'about', label: 'About', href: '#about' }
	];
	let current = $state('reports');
</script>

<svelte:head><title>TopNav · darksite</title></svelte:head>
<PageHeader title="TopNav" />
<div class="demo">
	<div class="frame">
		<TopNav {items} {groups} {current} product="Acme" sticky={false}>
			{#snippet actions()}
				<Button variant="ghost" icon={Search} keycap="meta+k" href="/searchpalette">Search</Button>
				<ThemeToggle />
			{/snippet}
		</TopNav>
	</div>
	<p>
		Records is a plain menu with a description under each link. Guides has sections, so its menu
		lays out one column per section, with "All guides" in a row under them. On a phone the menu
		button opens a sheet with the same groups and section headings, without descriptions.
	</p>
	<div class="row">
		{#each ['records', 'reports', 'api', 'news'] as id (id)}
			<Button size="dense" pressed={current === id} onclick={() => (current = id)}
				>Current: {id}</Button
			>
		{/each}
	</div>
</div>

<style>
	.frame {
		margin-bottom: var(--ds-space-4);
		overflow: hidden;
		border: 1px solid var(--ds-border-subtle);
		border-radius: var(--ds-radius-md);
	}
</style>
