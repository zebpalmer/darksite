<script lang="ts">
	import Download from '@lucide/svelte/icons/download';
	import { Button, PageHeader } from '#lib';
</script>

<svelte:head><title>PageHeader · darksite</title></svelte:head>
<PageHeader title="Records" count={1284} sticky>
	{#snippet actions()}
		<Button variant="ghost" icon={Download}>Export</Button>
		<Button variant="primary">New record</Button>
	{/snippet}
</PageHeader>
<p>Scroll: the header sticks, flush with the column's edges.</p>
<PageHeader title="R-00412" level={2} mono count="Identifier title" />
<PageHeader title="Records awaiting a second review" level={2} count={38}>
	{#snippet actions()}<Button variant="ghost" icon={Download}>Export</Button>{/snippet}
</PageHeader>
<p>On a narrow header, actions that would cut the title short move to a second line.</p>
{#each { length: 40 } as _, i (i)}
	<div class="line">Record {i + 1}</div>
{/each}

<style>
	p {
		color: var(--ds-text-2);
		font-size: var(--ds-text-md);
	}
	.line {
		padding: var(--ds-space-2) 0;
		border-bottom: 1px solid var(--ds-border-subtle);
		color: var(--ds-text-2);
		font-size: var(--ds-text-sm);
	}
</style>
