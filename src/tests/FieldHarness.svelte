<script lang="ts">
	import { Field, Input } from '#lib';
	let {
		error = null,
		help,
		tip,
		tipLabel
	}: { error?: string | null; help?: string; tip?: string; tipLabel?: string } = $props();
</script>

<Field label="Owner" {error} {help} {tip} {tipLabel} required>
	{#snippet children(f)}
		<Input id={f.id} aria-describedby={f.describedBy} invalid={f.invalid} />
	{/snippet}
</Field>
