<script lang="ts">
	import { Switch } from '#lib';
	let alerts = $state(true);
	let digest = $state(false);
</script>

<svelte:head><title>Switch · darksite</title></svelte:head>
<h1>Switch</h1>
<div class="col">
	<Switch label="Email alerts" bind:checked={alerts} />
	<Switch label="Weekly digest" bind:checked={digest} />
	<Switch label="Maintenance mode" disabled />
</div>
<p>
	Takes effect at once, with no Save. The state is written beside the track, and the thumb's
	position carries it too.
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
		align-items: flex-start;
	}
	p {
		color: var(--ds-text-3);
		font-size: var(--ds-text-xs);
	}
</style>
