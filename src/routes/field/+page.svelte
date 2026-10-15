<script lang="ts">
	import { Button, Field, Input, KeyCap, PageHeader } from '#lib';
	let owner = $state('');
	let tried = $state(false);
	const error = $derived(tried && !owner.trim() ? 'Pick an owner' : null);
</script>

<svelte:head><title>Field · darksite</title></svelte:head>
<PageHeader title="Field" />
<div class="demo">
	<h2>Stacked</h2>
	<div class="stack">
		<Field label="Owner" {error} required tip="The person who answers for this record.">
			{#snippet children(f)}
				<Input bind:value={owner} id={f.id} aria-describedby={f.describedBy} invalid={f.invalid} />
			{/snippet}
		</Field>
		<Field label="Reference" help="Printed on every export.">
			{#snippet accessory()}<KeyCap keys="r" />{/snippet}
			{#snippet children(f)}
				<Input id={f.id} aria-describedby={f.describedBy} mono value="REF-2041" />
			{/snippet}
		</Field>
		<div class="row"><Button variant="primary" onclick={() => (tried = true)}>Save</Button></div>
	</div>

	<h2>Row layout</h2>
	<div class="stack">
		<Field label="Site" layout="row">
			{#snippet children(f)}<Input id={f.id} value="North wing" />{/snippet}
		</Field>
		<Field label="Notes" layout="row" disabled>
			{#snippet children(f)}<textarea id={f.id} class="ds-control" disabled>Locked</textarea
				>{/snippet}
		</Field>
	</div>
</div>
