<script lang="ts">
	import { Button, PageHeader } from '#lib';
	import { demo } from '../demo.svelte.js';

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

<style>
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
