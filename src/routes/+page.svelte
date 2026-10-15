<script lang="ts">
	import { PageHeader } from '#lib';

	const route: Record<string, string> = { ActiveFilters: 'filterrail', SheetItem: 'sheet' };
	const groups: Record<string, string[]> = {
		Actions: ['Button', 'KeyCap'],
		Selection: ['Chip', 'SegmentedControl', 'Tabs'],
		Filtering: ['ActiveFilters', 'FilterRail'],
		Scales: ['ScaleBadge', 'ScalePicker', 'SeverityBadge', 'SeverityPicker'],
		Forms: ['Checkbox', 'Combobox', 'Field', 'Input', 'Radio', 'Switch'],
		Data: ['Meter', 'Stat', 'Table', 'Timeline'],
		Overlays: ['Dialog', 'Menu', 'Popover', 'Sheet', 'SheetItem'],
		Feedback: [
			'EmptyState',
			'HelpTip',
			'NewBadge',
			'SkeletonLoader',
			'SourceBadge',
			'Spinner',
			'Toaster'
		],
		Content: ['Avatar', 'Card', 'EntityCard', 'Carousel', 'Lightbox'],
		Layout: ['ActionBar', 'Grid', 'JustifiedGrid', 'PageHeader', 'Pane'],
		Shell: ['AppShell', 'NavRail', 'SideNav', 'TabBar', 'TopBar']
	};
</script>

<svelte:head><title>darksite</title></svelte:head>

<PageHeader title="Components" />
<p class="lede">
	Each page shows a component in use. Its card, <code>components/&lt;Name&gt;/README.md</code>,
	specifies it.
</p>

<div class="grid">
	{#each Object.entries(groups) as [group, names] (group)}
		<section>
			<h2>{group}</h2>
			<ul>
				{#each names as name (name)}
					<li>
						<a href="/{route[name] ?? name.toLowerCase()}">{name}</a>
					</li>
				{/each}
			</ul>
		</section>
	{/each}
</div>

<style>
	.lede {
		margin: 0 0 var(--ds-space-6);
		color: var(--ds-text-3);
		font-size: var(--ds-text-sm);
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(200px, 100%), 1fr));
		gap: var(--ds-space-6);
	}
	h2 {
		margin: 0 0 var(--ds-space-2);
		color: var(--ds-text-3);
		font-size: var(--ds-text-sm);
		font-weight: 500;
	}
	ul {
		display: flex;
		flex-direction: column;
		gap: var(--ds-space-1);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	a {
		color: var(--ds-accent-text);
		text-decoration: none;
	}
	a:hover {
		text-decoration: underline;
	}
</style>
