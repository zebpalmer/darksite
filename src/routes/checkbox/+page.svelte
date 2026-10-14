<script lang="ts">
	import { Checkbox } from '#lib';
	let archived = $state(false);
	let mixed = $state<boolean | 'mixed'>('mixed');
</script>

<svelte:head><title>Checkbox · darksite</title></svelte:head>
<h1>Checkbox</h1>
<div class="col">
	<Checkbox label="Include archived records" bind:checked={archived} />
	<Checkbox label="Some selected (mixed)" bind:checked={mixed} />
	<Checkbox label="Checked" checked={true} />
	<Checkbox label="Accept the terms" invalid />
	<Checkbox label="Disabled" disabled />
	<Checkbox label="Select row" hideLabel />
</div>
<p>
	16px box; the hit area is 32px, 44 on touch. The last one is label-less, as in a table's selection
	column.
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
