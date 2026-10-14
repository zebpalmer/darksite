<script lang="ts">
	import { Radio } from '#lib';
	let region = $state('north');
</script>

<svelte:head><title>Radio · darksite</title></svelte:head>
<h1>Radio</h1>
<fieldset>
	<legend>Region</legend>
	<Radio name="region" value="north" label="North" bind:group={region} />
	<Radio name="region" value="south" label="South" bind:group={region} />
	<Radio name="region" value="east" label="East" bind:group={region} />
	<Radio name="region" value="west" label="West (unavailable)" bind:group={region} disabled />
</fieldset>
<p>Picked: {region}. For more than seven options or long labels; otherwise a SegmentedControl.</p>

<style>
	h1 {
		margin: 0 0 var(--ds-space-6);
		font-size: var(--ds-text-xl);
		font-weight: 500;
	}
	fieldset {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		margin: 0;
		padding: 0;
		border: 0;
	}
	legend {
		margin-bottom: var(--ds-space-1);
		color: var(--ds-text-2);
		font-size: var(--ds-text-sm);
	}
	p {
		color: var(--ds-text-3);
		font-size: var(--ds-text-xs);
	}
</style>
