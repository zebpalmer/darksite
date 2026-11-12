<script lang="ts">
	import Download from '@lucide/svelte/icons/download';
	import { Button, PageHeader, SectionHeader } from '#lib';
</script>

<svelte:head><title>SectionHeader · darksite</title></svelte:head>
<div class="frame">
	<PageHeader title="Reviews" count={52} level={2} />
	<SectionHeader title="Needs attention" count={4} tone="danger" id="attention" />
	<SectionHeader title="In progress" count={12} tone="warning">
		{#snippet actions()}<Button variant="ghost" icon={Download}>Export</Button>{/snippet}
	</SectionHeader>
	<SectionHeader title="Finished" count={0} />
	<SectionHeader title="No count" />
	<SectionHeader title="A third-level heading" level={3} count={1284} />
</div>
<p>
	Neutral, warning and danger tones for the count. A count of zero shows; no count shows nothing.
	Actions sit right-aligned and wrap under the heading when there is no room.
</p>
<div class="frame narrow">
	<SectionHeader title="Awaiting a second review by the field team" count={38}>
		{#snippet actions()}
			<Button variant="ghost" icon={Download}>Export</Button>
			<Button>Assign</Button>
		{/snippet}
	</SectionHeader>
</div>

<style>
	.frame {
		--ds-pad-top: 0px;
		--ds-pad-x: 0px;
		width: 720px;
		max-width: 100%;
		margin-bottom: var(--ds-space-4);
		overflow: hidden;
		border: 1px solid var(--ds-border-subtle);
		border-radius: var(--ds-radius-md);
	}
	.frame > :global(.ds-sectionheader) {
		padding-inline: 16px;
		margin-top: var(--ds-space-3);
	}
	.narrow {
		width: 320px;
		padding-bottom: var(--ds-space-3);
	}
	p {
		color: var(--ds-text-2);
		font-size: var(--ds-text-md);
	}
</style>
