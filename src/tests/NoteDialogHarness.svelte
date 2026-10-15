<script lang="ts">
	import { Dialog, Field, Input } from '#lib';
	let {
		open = $bindable(true),
		onconfirm
	}: { open?: boolean; onconfirm?: (note: string) => unknown } = $props();
	let note = $state('');
</script>

<Dialog
	bind:open
	title="Archive this record?"
	tone="default"
	confirmLabel="Archive"
	confirmDisabled={!note.trim()}
	initialFocus="field"
	onconfirm={() => onconfirm?.(note)}
>
	<Field label="Note" required>
		{#snippet children(f)}
			<Input bind:value={note} id={f.id} aria-describedby={f.describedBy} />
		{/snippet}
	</Field>
</Dialog>
