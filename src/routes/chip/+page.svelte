<script lang="ts">
	import { Chip } from '#lib';
	let on = $state(true);
	let tokens = $state(['Archived', 'Field team']);
</script>

<svelte:head><title>Chip · darksite</title></svelte:head>
<h1>Chip</h1>
<div class="row">
	<Chip selected={false} onclick={() => {}}>Archived</Chip>
	<Chip selected={on} onclick={() => (on = !on)}>Urgent</Chip>
	<Chip selected="mixed" onclick={() => {}}>External</Chip>
	<Chip selected={false} keycap="q" onclick={() => {}}>Internal</Chip>
	<Chip selected={false} count={248} onclick={() => {}}>Shared</Chip>
	<Chip tone="warning" selected={false} onclick={() => {}}>Escalations</Chip>
</div>
<div class="row">
	{#each tokens as t (t)}<Chip
			removable
			variant="token"
			removeLabel="Remove {t}"
			onremove={() => (tokens = tokens.filter((x) => x !== t))}>{t}</Chip
		>{/each}
	<Chip suggestion source="Model" confidence={0.8} onclick={() => {}}>Urgent review</Chip>
	<Chip suggestion isNew onclick={() => {}}>Half-light</Chip>
</div>
<p>
	toggle · mixed · keycap · count · warning — tokens · suggestion · new. Dashed always means "not
	applied".
</p>

<style>
	h1 {
		margin: 0 0 var(--ds-space-6);
		font-size: var(--ds-text-xl);
		font-weight: 500;
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--ds-space-2);
		margin-bottom: var(--ds-space-4);
	}
	p {
		color: var(--ds-text-3);
		font-size: var(--ds-text-xs);
	}
</style>
