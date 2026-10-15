<script lang="ts">
	import { PageHeader, Tabs, panelId, tabId } from '#lib';
	let lane = $state('queue');
	const lanes = [
		{ value: 'queue', label: 'Queue', count: 12 },
		{ value: 'needs', label: 'Needs severity', count: 3, tone: 'warning' as const },
		{ value: 'failed', label: 'Failed', count: 3, tone: 'danger' as const },
		{ value: 'done', label: 'Done', count: 1840 }
	];
	let pill = $state('day');
</script>

<svelte:head><title>Tabs · darksite</title></svelte:head>
<PageHeader title="Tabs" />
<div class="demo">
	<h2>Tablist</h2>
	<Tabs tabs={lanes} bind:value={lane} label="Lanes" idPrefix="lanes" />
	<div id={panelId('lanes', lane)} role="tabpanel" aria-labelledby={tabId('lanes', lane)}>
		<p>The {lanes.find((l) => l.value === lane)?.label} lane.</p>
	</div>

	<h2>Pill</h2>
	<Tabs
		variant="pill"
		bind:value={pill}
		label="Range"
		idPrefix="range"
		tabs={[
			{ value: 'day', label: 'Day' },
			{ value: 'week', label: 'Week' },
			{ value: 'month', label: 'Month' }
		]}
	/>

	<h2>Links</h2>
	<Tabs
		label="Gallery sections"
		value="tabs"
		tabs={[
			{ value: 'tabs', label: 'Tabs', href: '/tabs' },
			{ value: 'seg', label: 'SegmentedControl', href: '/segmentedcontrol' },
			{ value: 'sev', label: 'SeverityPicker', href: '/severitypicker' }
		]}
	/>
</div>
