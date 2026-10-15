<script lang="ts">
	import Search from '@lucide/svelte/icons/search';
	import { Input, KeyCap, PageHeader } from '#lib';
	let value = $state('');
</script>

<svelte:head><title>Input · darksite</title></svelte:head>
<PageHeader title="Input" />
<div class="demo">
	<div class="stack">
		<Input bind:value placeholder="Plain" aria-label="Plain" />
		<Input
			placeholder="Search records"
			leading={Search}
			aria-label="Search"
			style="--trail-w: 32px"
		>
			{#snippet trailing()}<KeyCap keys="/" decorative />{/snippet}
		</Input>
		<Input value="a3f9c2e1" mono aria-label="Hash" />
		<Input value="Not a date" invalid aria-label="Invalid" />
		<Input value="Dense" size="dense" aria-label="Dense" />
		<Input value="Disabled" disabled aria-label="Disabled" />
		<select class="ds-control" aria-label="Select"><option>A bare select</option></select>
		<textarea class="ds-control" aria-label="Textarea">A bare textarea</textarea>
	</div>
	<p class="out">value: {JSON.stringify(value)}</p>
</div>
