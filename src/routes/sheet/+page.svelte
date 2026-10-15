<script lang="ts">
	import { Button, Dialog, Sheet, SheetItem, modals } from '#lib';
	const sorts = ['Newest first', 'Longest first', 'Highest severity'];
	let sort = $state('Newest first');
	let bottom = $state(false);
	let right = $state(false);
	let title = $state('Site walkthrough, north wing');
	let saved = $state('Site walkthrough, north wing');
	let asking = $state(false);
	const dirty = $derived(title !== saved);
</script>

<svelte:head><title>Sheet · darksite</title></svelte:head>
<h1>Sheet</h1>
<div class="row">
	<Button onclick={() => (bottom = true)}>Sort</Button>
	<Button onclick={() => (right = true)}>Edit record</Button>
</div>
<Sheet bind:open={bottom} title="Sort">
	{#each sorts as s (s)}
		<SheetItem
			label={s}
			current={sort === s}
			onclick={() => {
				sort = s;
				bottom = false;
			}}
		/>
	{/each}
</Sheet>
<Sheet
	bind:open={right}
	title="Edit record"
	side="right"
	description="Changes save when you press Save."
	{dirty}
	onbeforeclose={() => {
		if (dirty) asking = true;
		return !dirty;
	}}
>
	<input class="ds-control" bind:value={title} aria-label="Title" />
	{#snippet footer()}<Button
			onclick={() => {
				title = saved;
				right = false;
			}}>Cancel</Button
		><Button
			variant="primary"
			onclick={() => {
				saved = title;
				right = false;
			}}>Save</Button
		>{/snippet}
</Sheet>
<Dialog
	bind:open={asking}
	title="Discard your changes?"
	description="The title goes back to what it was."
	confirmLabel="Discard"
	onconfirm={() => {
		title = saved;
		right = false;
	}}
/>
<p>
	A native modal dialog: focus stays inside, Esc and the scrim close it, focus returns to the
	button. Edit the record's title, then press Esc: the sheet is <code>dirty</code>, so it asks
	first. App-wide, <code>modals.dirty</code> is {modals.dirty}.
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
