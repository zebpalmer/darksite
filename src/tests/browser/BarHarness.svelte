<script lang="ts">
	import { Button, Chip, ModePicker, NavRail, SegmentedControl, TopBar } from '#lib';

	const chips = [
		'Open',
		'Assigned',
		'Blocked',
		'Waiting',
		'Review',
		'Approved',
		'Returned',
		'Closed',
		'Archived'
	];
	const views = ['List', 'Board', 'Calendar', 'Timeline', 'Map'].map((v) => ({
		value: v,
		label: v
	}));
</script>

{#snippet create()}<Button variant="primary">New record</Button>{/snippet}

<div style="width: 420px" data-testid="chips">
	<TopBar actions={create}>
		{#snippet start()}
			{#each chips as label (label)}<Chip>{label}</Chip>{/each}
		{/snippet}
	</TopBar>
</div>
<div style="width: 420px" data-testid="scroller">
	<TopBar actions={create}>
		{#snippet start()}
			<div class="chipbar" style="display: flex; gap: 6px; overflow-x: auto">
				{#each chips as label (label)}<Chip>{label}</Chip>{/each}
			</div>
		{/snippet}
	</TopBar>
</div>
<div style="width: 600px" data-testid="short">
	<TopBar actions={create}>
		{#snippet start()}<Chip>Open</Chip>{/snippet}
	</TopBar>
</div>

<div style="width: 320px; display: flex" data-testid="mode-flex">
	<ModePicker variant="segmented" />
</div>
<div style="width: 320px; display: grid" data-testid="mode-grid">
	<ModePicker variant="segmented" />
</div>
<div style="width: 200px; display: flex" data-testid="segments">
	<SegmentedControl options={views} value="Map" label="View" />
</div>

<div style="height: 400px" data-testid="rail">
	<NavRail
		items={[{ id: 'a', label: 'Home', href: '#a' }]}
		expanded={false}
		pinned
		version="v12.40.3-rc.1"
	/>
</div>
