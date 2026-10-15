<script lang="ts">
	import { Button, Field, FileInput, PageHeader, toasts } from '#lib';
	let files = $state<File[]>([]);
	let tried = $state(false);
	const error = $derived(tried && files.length === 0 ? 'Choose a file to upload' : null);
</script>

<svelte:head><title>FileInput · darksite</title></svelte:head>
<PageHeader title="FileInput" />
<div class="demo">
	<form
		class="stack"
		onsubmit={(e) => {
			e.preventDefault();
			tried = true;
			if (files.length) toasts.success(`Uploaded ${files[0].name}`);
		}}
	>
		<Field label="Import file" {error} required>
			{#snippet children(f)}
				<FileInput
					bind:files
					id={f.id}
					aria-describedby={f.describedBy}
					invalid={f.invalid}
					accept=".csv"
					name="import"
				/>
			{/snippet}
		</Field>
		<Field label="Attachments">
			{#snippet children(f)}
				<FileInput id={f.id} aria-describedby={f.describedBy} multiple size="dense" />
			{/snippet}
		</Field>
		<Field label="Locked" disabled>
			{#snippet children(f)}<FileInput id={f.id} disabled />{/snippet}
		</Field>
		<div><Button variant="primary" type="submit">Upload</Button></div>
	</form>
	<p>
		The native input is the control: Tab reaches it, Space or Enter opens the picker, and a Field
		label names it.
	</p>
</div>

<style>
	.stack {
		display: flex;
		flex-direction: column;
		gap: var(--ds-space-4);
		max-width: 520px;
	}
	p {
		color: var(--ds-text-3);
		font-size: var(--ds-text-xs);
	}
</style>
