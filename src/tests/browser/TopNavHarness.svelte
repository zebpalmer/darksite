<script lang="ts">
	import { TopNav } from '#lib';
	let { sectioned = false }: { sectioned?: boolean } = $props();
</script>

{#if sectioned}
	<TopNav
		product="Acme"
		groups={[{ id: 'guides', label: 'Guides' }]}
		items={[
			{ id: 'home', label: 'Home', href: '#home' },
			{
				id: 'start',
				label: 'Getting started',
				href: '#start',
				group: 'guides',
				section: 'Learn',
				description: 'The first ten minutes.'
			},
			{ id: 'setup', label: 'Setup', href: '#setup', group: 'guides', section: 'Learn' },
			{ id: 'records', label: 'Records', href: '#records', group: 'guides', section: 'Use' },
			{ id: 'reports', label: 'Reports', href: '#reports', group: 'guides', section: 'Use' },
			{ id: 'api', label: 'API', href: '#api', group: 'guides', section: 'Reference' },
			{ id: 'all', label: 'All guides', href: '#guides', group: 'guides' }
		]}
	/>
{:else}
	<TopNav
		product="Acme"
		groups={[{ id: 'records', label: 'Records' }]}
		items={[
			{ id: 'home', label: 'Home', href: '#home' },
			{ id: 'sites', label: 'Sites', href: '#sites', group: 'records' },
			{ id: 'reports', label: 'Reports', href: '#reports', group: 'records' }
		]}
	/>
{/if}
