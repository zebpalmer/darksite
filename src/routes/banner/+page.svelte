<script lang="ts">
	import { Banner } from '#lib';
</script>

<svelte:head><title>Banner · darksite</title></svelte:head>
<h1>Banner</h1>
<div class="col">
	<Banner id="demo-info" message="A new version is available." dismissible>
		{#snippet action()}<a href="/">Reload</a>{/snippet}
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
	Full width above the TopBar, pushing content down. A danger banner cannot be dismissed while its
	condition holds.
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
