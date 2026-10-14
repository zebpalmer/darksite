<script lang="ts">
	import { Button, Spinner } from '#lib';
</script>

<svelte:head><title>Spinner · darksite</title></svelte:head>

<h1>Spinner</h1>
<div class="row">
	<Spinner label="Loading" />
	<span class="more"><Spinner size={14} />Loading more…</span>
	<Button variant="primary" loading loadingLabel="Saving">Save</Button>
</div>
<p>Static under prefers-reduced-motion. Content of known shape loads as a skeleton instead.</p>

<style>
	h1 {
		margin: 0 0 var(--ds-space-6);
		font-size: var(--ds-text-xl);
		font-weight: 500;
	}
	.row {
		display: flex;
		align-items: center;
		gap: var(--ds-space-4);
		color: var(--ds-text-2);
	}
	.more {
		display: inline-flex;
		align-items: center;
		gap: var(--ds-space-2);
		color: var(--ds-text-3);
		font-size: var(--ds-text-sm);
	}
	p {
		color: var(--ds-text-3);
		font-size: var(--ds-text-xs);
	}
</style>
