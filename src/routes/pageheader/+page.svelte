<script lang="ts">
	import Download from '@lucide/svelte/icons/download';
	import Plus from '@lucide/svelte/icons/plus';
	import { Button, Chip, PageHeader } from '#lib';
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
<p>
	Short of room at any width, a level-1 header first collapses the shell's search to its icon, then
	tells its <code>actions</code> to be compact. Drag the frame's corner to narrow it.
</p>
<div class="frame">
	<PageHeader title="Records awaiting review" count={1284}>
		{#snippet actions({ compact })}
			{#if compact}
				<Button variant="icon" icon={Download} label="Export" />
				<Button variant="icon" icon={Plus} label="New record" />
			{:else}
				<Button variant="ghost" icon={Download}>Export</Button>
				<Button variant="primary" icon={Plus}>New record</Button>
			{/if}
		{/snippet}
	</PageHeader>
</div>
<p>
	Chips after the title wrap onto a line under it when the header has no room for them; the title
	keeps its one line. Narrow the frame to see it.
</p>
<div class="frame">
	<PageHeader title="Records awaiting a second review" count={38}>
		<Chip>Field team</Chip>
		<Chip>On hold</Chip>
		{#snippet actions({ compact })}
			{#if compact}
				<Button variant="icon" icon={Plus} label="New record" />
			{:else}
				<Button variant="primary" icon={Plus}>New record</Button>
			{/if}
		{/snippet}
	</PageHeader>
</div>
{#each { length: 40 } as _, i (i)}
	<div class="line">Record {i + 1}</div>
{/each}

<style>
	.frame {
		--ds-pad-top: 0px;
		--ds-pad-x: 0px;
		width: 960px;
		max-width: 100%;
		min-width: 280px;
		margin-bottom: var(--ds-space-4);
		overflow: hidden;
		border: 1px solid var(--ds-border-subtle);
		border-radius: var(--ds-radius-md);
		resize: horizontal;
	}
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
