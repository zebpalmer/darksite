<script lang="ts">
	import { SEVERITIES, SeverityBadge } from '#lib';
</script>

<svelte:head><title>SeverityBadge · darksite</title></svelte:head>
<h1>SeverityBadge</h1>
<div class="row">
	{#each SEVERITIES as s (s)}<SeverityBadge severity={s} />{/each}
</div>
<div class="row"><SeverityBadge severity="high" pips /></div>
<div class="row"><SeverityBadge severity="medium" size="sm" /></div>

<style>
	h1 {
		margin: 0 0 var(--ds-space-6);
		font-size: var(--ds-text-xl);
		font-weight: 500;
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--ds-space-2);
		margin-bottom: var(--ds-space-4);
	}
</style>
