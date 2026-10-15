<script lang="ts">
	import { Field, PageHeader, Textarea } from '#lib';
	let note = $state('');
</script>

<svelte:head><title>Textarea · darksite</title></svelte:head>
<PageHeader title="Textarea" />
<div class="demo">
	<div class="stack">
		<Field label="Note" tip="Kept with the record's history.">
			{#snippet children(f)}
				<Textarea bind:value={note} id={f.id} describedBy={f.describedBy} invalid={f.invalid} />
			{/snippet}
		</Field>
		<Field label="Path" error={note.length > 200 ? 'Keep it under 200 characters' : null}>
			{#snippet children(f)}
				<Textarea
					id={f.id}
					describedBy={f.describedBy}
					invalid={f.invalid}
					mono
					rows={2}
					resize="none"
					value="/srv/records/2026/r-00412"
				/>
			{/snippet}
		</Field>
	</div>
</div>
