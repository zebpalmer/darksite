<script lang="ts">
	import { Missing } from '#lib';
</script>

<svelte:head><title>Missing · darksite</title></svelte:head>
<h1>Missing</h1>
<div class="row">
	<span>Owner</span>
	<Missing />
</div>
<div class="row">
	<span>Location</span>
	<Missing label="Not recorded" />
</div>
<p>
	An em dash in ds-text-3, announced as "No value". Never a blank, which reads as still loading.
</p>

<style>
	h1 {
		margin: 0 0 var(--ds-space-6);
		font-size: var(--ds-text-xl);
		font-weight: 500;
	}
	.row {
		display: flex;
		gap: var(--ds-space-4);
		margin-bottom: var(--ds-space-2);
		font-size: var(--ds-text-md);
	}
	.row span:first-child {
		width: 96px;
		color: var(--ds-text-3);
	}
	p {
		color: var(--ds-text-3);
		font-size: var(--ds-text-xs);
	}
</style>
