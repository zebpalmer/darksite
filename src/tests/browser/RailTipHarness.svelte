<script lang="ts">
	import House from '@lucide/svelte/icons/house';
	import Boxes from '@lucide/svelte/icons/boxes';
	import Search from '@lucide/svelte/icons/search';
	import { AppShell, Button, type NavItem, type RailSlotArgs } from '#lib';
	const items: NavItem[] = [
		{ id: 'home', label: 'Home', href: '#home', icon: House },
		{ id: 'records', label: 'Records', href: '#records', icon: Boxes }
	];
</script>

<!-- A collapsed rail beside a page whose content is positioned and layered: a card that covers the
     main column from its left edge, where the rail's tooltip lands. -->
<AppShell
	{items}
	current="home"
	product="Product"
	railExpanded={false}
	railPinned
	padded={false}
	toaster={false}
>
	{#snippet railSearch({ tip }: RailSlotArgs)}
		<Button variant="icon" icon={Search} label="Search" {...tip('Search')} />
	{/snippet}
	<div class="cover" data-testid="cover">A layered card</div>
</AppShell>

<style>
	.cover {
		position: relative;
		z-index: 30;
		height: 100vh;
		background: var(--ds-bg-2);
	}
</style>
