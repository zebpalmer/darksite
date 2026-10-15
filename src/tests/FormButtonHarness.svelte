<script lang="ts">
	import { Button, Field, SegmentedControl } from '#lib';
	let { onsubmit }: { onsubmit?: (data: FormData) => void } = $props();
	let view = $state('list');
</script>

<form
	id="edit-record"
	onsubmit={(e) => {
		e.preventDefault();
		onsubmit?.(new FormData(e.currentTarget));
	}}
>
	<input name="title" aria-label="Title" value="Alpha" />
	<Field label="View" help="How the queue is shown">
		{#snippet children(f)}
			<SegmentedControl
				id={f.id}
				aria-labelledby={f.labelId}
				aria-describedby={f.describedBy}
				bind:value={view}
				options={[
					{ value: 'list', label: 'List' },
					{ value: 'board', label: 'Board' }
				]}
			/>
		{/snippet}
	</Field>
</form>
<footer>
	<Button variant="primary" type="submit" form="edit-record" name="intent" value="save">Save</Button
	>
</footer>
