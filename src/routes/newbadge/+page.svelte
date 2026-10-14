<script lang="ts">
	import { Chip, NewBadge } from '#lib';
</script>

<svelte:head><title>NewBadge · darksite</title></svelte:head>
<h1>NewBadge</h1>
<div class="row"><NewBadge /><Chip suggestion isNew onclick={() => {}}>Half-light</Chip></div>

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
