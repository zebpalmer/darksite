<script lang="ts">
	import Activity from '@lucide/svelte/icons/activity';
	import BookOpen from '@lucide/svelte/icons/book-open';
	import Map from '@lucide/svelte/icons/map';
	import Radio from '@lucide/svelte/icons/radio';
	import { Button, Grid, Intro, LinkCard, Steps } from '#lib';
</script>

<svelte:head><title>Overview page · darksite</title></svelte:head>
<Intro
	title="A field network, mapped and checked"
	lead="Every node that reports in, where it is, and how well each area is covered. Start by checking a node, or open the map."
>
	{#snippet actions()}
		<Button variant="primary" href="#check">Check a node</Button>
		<Button href="/fullbleed">Open the map</Button>
	{/snippet}
</Intro>

<h2 class="h2">Get started</h2>
<Steps
	label="Get started"
	steps={[
		{
			title: 'Find your node',
			text: 'Search by name or the first bytes of its key.',
			href: '#find',
			linkLabel: 'Search nodes'
		},
		{
			title: 'Run a check',
			text: 'See which observers heard it in the last day.',
			href: '#check',
			linkLabel: 'Run a check'
		},
		{ title: 'Fix what it finds', text: 'Each finding comes with the command to fix it.' }
	]}
/>

<h2 class="h2">Tools</h2>
<Grid min={260}>
	<LinkCard
		href="/fullbleed"
		icon={Map}
		title="Map"
		text="Nodes and the links heard between them."
		meta="Updated every minute"
	/>
	<LinkCard
		href="#check"
		icon={Activity}
		title="Health check"
		text="One node's coverage over the last 24 hours."
	/>
	<LinkCard
		href="#observers"
		icon={Radio}
		title="Observers"
		text="Who listens where, and since when."
	/>
	<LinkCard
		href="/document"
		icon={BookOpen}
		title="How it works"
		text="The method behind the numbers."
	/>
</Grid>

<style>
	.h2 {
		margin: 32px 0 12px;
		font-size: var(--ds-text-lg);
		font-weight: 500;
	}
</style>
