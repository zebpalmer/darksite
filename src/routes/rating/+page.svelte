<script lang="ts">
	import { PageHeader, Rating } from '#lib';

	let value = $state<number | null>(3);
	let dense = $state<number | null>(null);
</script>

<svelte:head><title>Rating · darksite</title></svelte:head>
<PageHeader title="Rating" />
<div class="demo">
	<p>
		A radio group: Tab lands on the current star, the arrows step, Home and End jump, Delete clears.
		Choosing the current star again clears it too.
	</p>
	<div class="stack">
		<div class="row"><Rating bind:value label="Quality" showValue clearLabel="Clear" /></div>
		<p class="out">Value: {value ?? 'none'}</p>
		<div class="row"><Rating bind:value={dense} label="Priority fit" size="dense" /></div>
		<div class="row"><Rating value={4} label="Average" readonly showValue /></div>
		<div class="row"><Rating value={2} label="Locked" disabled /></div>
	</div>
</div>
