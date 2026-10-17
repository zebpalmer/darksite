<script lang="ts">
	import { page } from '$app/state';
	import { PageHeader, SideNav, type NavGroup, type NavItem } from '#lib';

	const groups: NavGroup[] = [
		{ id: 'workspace', label: 'Workspace' },
		{ id: 'people', label: 'People' }
	];
	const folding: NavGroup[] = [
		{ id: 'workspace', label: 'Workspace', collapsed: false },
		{ id: 'people', label: 'People', collapsed: false },
		{ id: 'advanced', label: 'Advanced', collapsed: true }
	];
	const described: NavItem[] = [
		{
			id: 'general',
			label: 'General',
			href: '#general',
			group: 'workspace',
			description: 'Name, time zone and language'
		},
		{
			id: 'members',
			label: 'Members',
			href: '#members',
			group: 'people',
			description: 'Who can sign in, and their roles'
		},
		{
			id: 'keys',
			label: 'Keys',
			href: '#keys',
			group: 'advanced',
			description: 'Tokens for scripts and services'
		},
		{
			id: 'export',
			label: 'Export',
			href: '#export',
			group: 'advanced',
			description: 'Every record, as a file'
		}
	];
	const items: NavItem[] = [
		{ id: 'general', label: 'General', href: '#general', group: 'workspace' },
		{ id: 'notifications', label: 'Notifications', href: '#notifications', group: 'workspace' },
		{
			id: 'integrations',
			label: 'Integrations',
			href: '#integrations',
			group: 'workspace',
			badge: 2
		},
		{ id: 'members', label: 'Members', href: '#members', group: 'people' },
		{ id: 'roles', label: 'Roles', href: '#roles', group: 'people' }
	];
	const current = $derived(items.find((i) => i.href === page.url.hash)?.id ?? 'general');
	const label = $derived(items.find((i) => i.id === current)?.label);
</script>

<svelte:head><title>SideNav · darksite</title></svelte:head>
<PageHeader title="Settings" />
<div class="split">
	<SideNav
		{items}
		{groups}
		{current}
		label="Settings sections"
		onnavigate={(href) => (location.hash = href)}
	/>
	<section>
		<h2>{label}</h2>
		<p>
			A section's own navigation, beside the page. Below 768px it becomes a native select, so the
			phone's own picker does the work.
		</p>
		<h3>Collapsible, each group starting its own way</h3>
		<div class="demo">
			<SideNav
				items={described}
				groups={folding}
				current="none"
				label="Settings sections, collapsible"
				collapsible
				onnavigate={(href) => (location.hash = href)}
			/>
			<p>
				Workspace and People start open (<code>collapsed: false</code>), Advanced closed (<code
					>collapsed: true</code
				>). Each item's <code>description</code> is its tooltip.
			</p>
		</div>
	</section>
</div>

<style>
	.split {
		display: flex;
		gap: var(--ds-space-6);
		align-items: flex-start;
	}
	@media (max-width: 767.98px) {
		.split {
			flex-direction: column;
			gap: var(--ds-space-4);
		}
	}
	h3 {
		margin: var(--ds-space-6) 0 var(--ds-space-2);
		font-size: var(--ds-text-md);
		font-weight: 500;
	}
	.demo {
		display: flex;
		gap: var(--ds-space-6);
		align-items: flex-start;
	}
	section {
		flex: 1;
		min-width: 0;
	}
	h2 {
		margin: 0 0 var(--ds-space-3);
		font-size: var(--ds-text-lg);
		font-weight: 500;
	}
	p {
		max-width: 560px;
		color: var(--ds-text-2);
		font-size: var(--ds-text-md);
	}
</style>
