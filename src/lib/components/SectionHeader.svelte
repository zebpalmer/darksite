<!--
@component
SectionHeader — the heading of a section within a page: its title, a count, and optional actions
on the right. A level-2 heading by default (`PageHeader` owns the level-1), or level 3 inside a
section. It uses the page header's rhythm: the heading font at 500, the count in the same muted
`meta` size, a 12px gap, 32px tall (44 for touch actions).

- `title`, `count` (a number, localized; hidden when undefined or null, shown at 0), `level`
  (`2` default | `3`), `tone` (the count's color: `neutral` default | `warning` | `danger`),
  `actions` snippet, `id` (on the heading, for a section's `aria-labelledby`), `class`.
- The count reads after the title in the heading's own name ("Needs review: 3"), so a screen reader
  hears it too.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		count?: number | null;
		level?: 2 | 3;
		tone?: 'neutral' | 'warning' | 'danger';
		actions?: Snippet;
		id?: string;
		class?: string;
	}

	let {
		title,
		count = null,
		level = 2,
		tone = 'neutral',
		actions,
		id,
		class: className = ''
	}: Props = $props();
</script>

<div class="ds-sectionheader {className}" data-level={level}>
	<svelte:element this={`h${level}`} class="title" {id}>
		{title}{#if count !== null && count !== undefined}<span class="ds-sr-only">: </span><span
				class="count"
				data-tone={tone}>{count.toLocaleString()}</span
			>{/if}
	</svelte:element>
	{#if actions}<div class="actions">{@render actions()}</div>{/if}
</div>

<style>
	.ds-sectionheader {
		container-type: inline-size;
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 4px 12px;
		min-height: 32px;
		margin: 0 0 var(--ds-space-3);
	}
	.title {
		min-width: 0;
		margin: 0;
		color: var(--ds-text-heading);
		font-family: var(--font-heading);
		font-size: var(--ds-text-lg);
		line-height: var(--ds-lh-lg);
		font-weight: 500;
	}
	[data-level='3'] .title {
		font-size: var(--ds-text-md);
		line-height: var(--ds-lh-md);
	}
	.count {
		display: inline-block;
		margin-inline-start: 12px;
		color: var(--ds-text-3);
		font-family: var(--font-mono);
		font-size: var(--ds-text-sm);
		font-weight: 400;
		font-variant-numeric: tabular-nums;
	}
	.count[data-tone='warning'] {
		color: var(--ds-warning-text);
	}
	.count[data-tone='danger'] {
		color: var(--ds-danger-text);
	}
	.actions {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 8px;
		margin-inline-start: auto;
	}
</style>
