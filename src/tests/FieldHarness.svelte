<script lang="ts">
	import { Field, Input } from '#lib';
	let {
		error = null,
		help,
		tip
	}: { error?: string | null; help?: string; tip?: string } = $props();
</script>

<Field label="Owner" {error} {help} {tip} required>
	{#snippet children(f)}
		<Input id={f.id} aria-describedby={f.describedBy} invalid={f.invalid} />
	{/snippet}
</Field>
