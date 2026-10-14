<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import { Button, EmptyState } from '#lib';
</script>

<svelte:head><title>EmptyState · darksite</title></svelte:head>
<h1>EmptyState</h1>
<div class="row">
	<EmptyState
		title="Nothing in the queue"
		message="New items appear here within a minute of arriving."
	>
		{#snippet action()}<Button>Re-check now</Button>{/snippet}
	</EmptyState>
	<EmptyState
		title="All clear"
		message="Nothing needs attention right now."
		icon={Check}
		align="center"
	/>
</div>

<style>
	h1 {
		margin: 0 0 var(--ds-space-6);
		font-size: var(--ds-text-xl);
		font-weight: 500;
	}
	.row {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(280px, 100%), 1fr));
		gap: var(--ds-space-4);
	}
</style>
