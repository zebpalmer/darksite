<script lang="ts">
	import { Button, Sheet } from '#lib';
	let bottom = $state(false);
	let right = $state(false);
</script>

<svelte:head><title>Sheet · darksite</title></svelte:head>
<h1>Sheet</h1>
<div class="row">
	<Button onclick={() => (bottom = true)}>Sort</Button>
	<Button onclick={() => (right = true)}>Edit record</Button>
</div>
<Sheet bind:open={bottom} title="Sort">
	<p style="color: var(--ds-text-2); font-size: var(--ds-text-md)">
		Newest first · Longest first · Highest severity
	</p>
</Sheet>
<Sheet
	bind:open={right}
	title="Edit record"
	side="right"
	description="Changes save when you press Save."
>
	<input class="ds-control" value="Site walkthrough, north wing" aria-label="Title" />
	{#snippet footer()}<Button onclick={() => (right = false)}>Cancel</Button><Button
			variant="primary"
			onclick={() => (right = false)}>Save</Button
		>{/snippet}
</Sheet>
<p>
	A native modal dialog: focus stays inside, Esc and the scrim close it, focus returns to the
	button.
</p>

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
	p {
		color: var(--ds-text-3);
		font-size: var(--ds-text-xs);
	}
</style>
