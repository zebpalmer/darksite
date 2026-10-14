<script lang="ts">
	// Components with a live page here; everything else is specified by its card in components/.
	const live = new Set([
		'Button',
		'Checkbox',
		'EmptyState',
		'KeyCap',
		'Radio',
		'SkeletonLoader',
		'Spinner',
		'Switch',
		'Table'
	]);
	const groups: Record<string, string[]> = {
		Actions: ['Button', 'KeyCap'],
		Selection: ['Chip', 'SegmentedControl', 'Tabs'],
		Severity: ['SeverityBadge', 'SeverityPicker'],
		Forms: ['Checkbox', 'Combobox', 'Field', 'Input', 'Radio', 'Switch'],
		Data: ['Table'],
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
		Content: ['Avatar', 'Card', 'EntityCard'],
		Layout: ['ActionBar', 'Grid', 'JustifiedGrid', 'PageHeader'],
		Shell: ['AppShell', 'NavRail', 'SideNav', 'TabBar', 'TopBar']
	};
</script>

<svelte:head><title>darksite</title></svelte:head>

<h1>Components</h1>
<p class="lede">
	Live components link to their page. The rest are specified by their card in <code
		>components/</code
	>.
</p>

<div class="grid">
	{#each Object.entries(groups) as [group, names] (group)}
		<section>
			<h2>{group}</h2>
			<ul>
				{#each names as name (name)}
					<li>
						{#if live.has(name)}
							<a href="/{name.toLowerCase()}">{name}</a>
						{:else}
							<span class="spec">{name}</span><span class="tag">spec</span>
						{/if}
					</li>
				{/each}
			</ul>
		</section>
	{/each}
</div>

<style>
	h1 {
		margin: 0 0 var(--ds-space-1);
		font-size: var(--ds-text-xl);
		line-height: var(--ds-lh-xl);
		font-weight: 500;
	}
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
	.spec {
		color: var(--ds-text-2);
	}
	.tag {
		margin-left: var(--ds-space-2);
		color: var(--ds-text-3);
		font-size: var(--ds-text-xs);
	}
</style>
