<script lang="ts">
	import { Banner, Button } from '#lib';

	let reloads = $state(0);
</script>

<svelte:head><title>Banner · darksite</title></svelte:head>
<h1>Banner</h1>
<div class="col">
	<Banner id="demo-update" message="A new version is available." dismissible remember={false}>
		{#snippet action()}<Button size="dense" onclick={() => reloads++}>Reload</Button>{/snippet}
	</Banner>
	<Banner
		id="demo-warn"
		tone="warning"
		message="The nightly sync has failed for 3 hours."
		dismissible
	/>
	<Banner id="demo-danger" tone="danger" message="Read-only maintenance from 18:00." />
</div>
<p>
	The first is the update-available notice: its dismissal lasts for this page view only, so it
	returns on the next load while the update is still waiting. Reload pressed {reloads} times.
</p>
<p>
	Full width above the TopBar, pushing content down. A danger banner cannot be dismissed while its
	condition holds.
</p>
<div class="col">
	<Banner id="demo-strong-warn" tone="warning" strong message="This is the staging site.">
		{#snippet action()}<Button size="dense">Go to the live site</Button>{/snippet}
	</Banner>
	<Banner
		id="demo-strong-info"
		tone="info"
		strong
		message="Scheduled upgrade tonight at 22:00."
		dismissible
	/>
	<Banner id="demo-strong-danger" tone="danger" strong message="Sign-in is unavailable." />
</div>
<p>
	<code>strong</code>: the tone's solid fill, for a condition nobody may miss. The action is an
	outline in the fill's contrast color.
</p>

<style>
	h1 {
		margin: 0 0 var(--ds-space-6);
		font-size: var(--ds-text-xl);
		font-weight: 500;
	}
	.col {
		display: flex;
		flex-direction: column;
		gap: var(--ds-space-4);
		max-width: 720px;
	}
	p {
		color: var(--ds-text-3);
		font-size: var(--ds-text-xs);
	}
</style>
