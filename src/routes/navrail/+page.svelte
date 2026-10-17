<script lang="ts">
	import Boxes from '@lucide/svelte/icons/boxes';
	import ChartColumn from '@lucide/svelte/icons/chart-column';
	import House from '@lucide/svelte/icons/house';
	import Search from '@lucide/svelte/icons/search';
	import { Button, NavRail, PageHeader, type NavItem, type RailSlotArgs } from '#lib';
	import { demo } from '../demo.svelte.js';

	const sample: NavItem[] = [
		{ id: 'home', label: 'Home', href: '/navrail', icon: House },
		{ id: 'records', label: 'Records', href: '/navrail', icon: Boxes, badge: 4 },
		{ id: 'reports', label: 'Reports', href: '/navrail', icon: ChartColumn }
	];
	let searches = $state(0);

	function setBadge(value: number | boolean | null) {
		demo.badges = { ...demo.badges, toaster: value };
	}
</script>

<svelte:head><title>NavRail · darksite</title></svelte:head>
<PageHeader title="NavRail" />
<p>
	The rail on the left. Collapsed, it shows icons with a tooltip on hover or focus; expanded, labels
	and group headings. The toggle at its foot is remembered for this viewer.
</p>
<h2>Badges</h2>
<div class="row">
	<Button onclick={() => setBadge(3)}>Count on Toaster</Button>
	<Button onclick={() => setBadge(140)}>Large count</Button>
	<Button onclick={() => setBadge(true)}>Dot</Button>
	<Button variant="ghost" onclick={() => setBadge(null)}>Clear</Button>
</div>

<h2>Slots, pinned collapsed</h2>
<p>
	<code>expanded=&#123;false&#125; pinned</code> keeps a rail collapsed with no toggle. The search and
	status slots get the rail's own tooltip; the badge slot replaces each item's count. The version shows
	in both states; collapsed, a long one is truncated and hovering shows it whole.
</p>
{#snippet search({ expanded, tip }: RailSlotArgs)}
	<Button
		variant={expanded ? 'secondary' : 'icon'}
		icon={Search}
		label="Search"
		full={expanded}
		onclick={() => searches++}
		{...tip('Search')}
	/>
{/snippet}
{#snippet status({ expanded, tip }: RailSlotArgs)}
	<span class="status" {...tip('Synced 2 min ago')}>
		<span class="dot" aria-hidden="true"></span>
		<span class={expanded ? '' : 'ds-sr-only'}>Synced 2 min ago</span>
	</span>
{/snippet}
{#snippet badge({ item }: { item: NavItem; expanded: boolean })}
	{#if item.id === 'reports'}<span class="new" aria-hidden="true"></span><span class="ds-sr-only"
			>, updated</span
		>{/if}
{/snippet}
<div class="frames">
	<div class="frame">
		<NavRail
			items={sample}
			current="records"
			expanded={false}
			pinned
			{search}
			{status}
			{badge}
			version="v12.40.3-rc.1"
		/>
	</div>
	<div class="frame">
		<NavRail
			items={sample}
			current="records"
			expanded
			pinned
			{search}
			{status}
			version="v12.40.3-rc.1"
		/>
	</div>
</div>
<p>Search pressed {searches} times.</p>

<style>
	.frames {
		display: flex;
		gap: var(--ds-space-4);
	}
	.frame {
		height: 320px;
		overflow: hidden;
		border: 1px solid var(--ds-border-subtle);
		border-radius: var(--ds-radius-md);
	}
	.status {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: 28px;
		padding: 0 4px;
		color: var(--ds-text-3);
		font-size: var(--ds-text-xs);
	}
	.dot {
		width: 8px;
		height: 8px;
		border-radius: var(--ds-radius-full);
		background: var(--ds-success);
	}
	.new {
		display: block;
		width: 8px;
		height: 8px;
		border-radius: var(--ds-radius-full);
		background: var(--ds-accent);
	}
	p {
		max-width: 640px;
		color: var(--ds-text-2);
		font-size: var(--ds-text-md);
	}
	h2 {
		margin: var(--ds-space-6) 0 var(--ds-space-3);
		font-size: var(--ds-text-lg);
		font-weight: 500;
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		gap: var(--ds-space-2);
	}
</style>
