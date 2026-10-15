<script lang="ts">
	import { SkeletonLoader } from '#lib';
</script>

<svelte:head><title>SkeletonLoader · darksite</title></svelte:head>
<h1>SkeletonLoader</h1>
<div class="grid"><SkeletonLoader variant="card" count={3} /></div>
<div class="stack">
	<SkeletonLoader variant="entity" label={null} /><SkeletonLoader
		width="70%"
		label={null}
	/><SkeletonLoader width="45%" label={null} />
</div>
<h2>Grid</h2>
<p>A whole Grid of placeholders, at the viewer's grid density or an explicit one.</p>
<SkeletonLoader variant="grid" count={6} density="s" />
<h2>Row grid</h2>
<SkeletonLoader variant="grid" count={4} min={280} label={null} />

<style>
	h1 {
		margin: 0 0 var(--ds-space-6);
		font-size: var(--ds-text-xl);
		font-weight: 500;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(180px, 100%), 1fr));
		gap: 18px 14px;
		margin-bottom: var(--ds-space-6);
	}
	h2 {
		margin: var(--ds-space-6) 0 var(--ds-space-3);
		font-size: var(--ds-text-lg);
		font-weight: 500;
	}
	p {
		color: var(--ds-text-3);
		font-size: var(--ds-text-xs);
	}
	.stack {
		display: flex;
		flex-direction: column;
		gap: var(--ds-space-2);
		max-width: 420px;
	}
</style>
