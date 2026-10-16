<script lang="ts">
	import BookOpen from '@lucide/svelte/icons/book-open';
	import ChartColumn from '@lucide/svelte/icons/chart-column';
	import ClipboardCheck from '@lucide/svelte/icons/clipboard-check';
	import Map from '@lucide/svelte/icons/map';
	import { Button, Grid, Intro, LinkCard, Steps } from '#lib';
</script>

<svelte:head><title>Overview page · darksite</title></svelte:head>
<Intro
	title="Every site, inspected and on record"
	lead="What each site holds, when it was last checked, and what needs attention. Start with a checklist, or open the map."
>
	{#snippet actions()}
		<Button variant="primary" href="#checklists">Start a checklist</Button>
		<Button href="/fullbleed">Open the map</Button>
	{/snippet}
</Intro>

<h2 class="h2">Get started</h2>
<Steps
	label="Get started"
	steps={[
		{
			title: 'Pick a site',
			text: 'Search by name or its reference number.',
			href: '#sites',
			linkLabel: 'Find a site'
		},
		{
			title: 'Run the checklist',
			text: 'Each item takes a minute; skip what does not apply.',
			href: '#checklists',
			linkLabel: 'Open checklists'
		},
		{ title: 'File the findings', text: 'Anything that failed becomes a task for the field team.' }
	]}
/>

<h2 class="h2">Tools</h2>
<Grid min={260}>
	<LinkCard
		href="/fullbleed"
		icon={Map}
		title="Map"
		text="Every site and its last inspection."
		meta="Updated hourly"
	/>
	<LinkCard
		href="#checklists"
		icon={ClipboardCheck}
		title="Checklists"
		text="The inspections due this week."
	/>
	<LinkCard
		href="#reports"
		icon={ChartColumn}
		title="Reports"
		text="Findings by site, month and severity."
	/>
	<LinkCard
		href="/document"
		icon={BookOpen}
		title="How it works"
		text="How a finding becomes a task."
	/>
</Grid>

<style>
	.h2 {
		margin: 32px 0 12px;
		font-size: var(--ds-text-lg);
		font-weight: 500;
	}
</style>
