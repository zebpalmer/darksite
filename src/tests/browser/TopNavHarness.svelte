<script lang="ts">
	import { TopNav } from '#lib';
</script>

<TopNav
	product="Acme"
	groups={[{ id: 'network', label: 'Network' }]}
	items={[
		{ id: 'home', label: 'Home', href: '#home' },
		{ id: 'map', label: 'Map', href: '#map', group: 'network' },
		{ id: 'nodes', label: 'Nodes', href: '#nodes', group: 'network' }
	]}
/>
