<script lang="ts">
	import { SourceBadge } from '#lib';
</script>

<svelte:head><title>SourceBadge · darksite</title></svelte:head>
<h1>SourceBadge</h1>
<div class="row">
	<SourceBadge source="Registry" confidence={0.96} />
	<SourceBadge source="File" />
	<SourceBadge
		source="Model"
		confidence={0.8}
		variant="suggestion"
		title="Sources: File 20% · Model 80%"
	/>
	<SourceBadge source="Owner default" variant="suggestion" />
</div>

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
