<script lang="ts">
	import { TopNav } from '#lib';
</script>

<TopNav
	product="Acme"
	groups={[{ id: 'records', label: 'Records' }]}
	items={[
		{ id: 'home', label: 'Home', href: '#home' },
		{ id: 'sites', label: 'Sites', href: '#sites', group: 'records' },
		{ id: 'reports', label: 'Reports', href: '#reports', group: 'records' }
	]}
/>
