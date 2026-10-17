<!--
@component
Intro — the opening of an overview page (a product's home, a section's start page): a title, a
sentence or two on what it is, and up to two actions. Not a marketing hero — no image, no full-bleed
color — and never on a work or list page, where it would push the work below the fold.

- `title`, `lead` (the sentence or two), `level` (heading level, default 1), `actions` snippet (a
  primary and a secondary Button), `children` (anything after the lead), `align` (`start` default |
  `center`), `class`.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		lead?: string;
		level?: 1 | 2;
		actions?: Snippet;
		align?: 'start' | 'center';
		class?: string;
		children?: Snippet;
	}

	let { title, lead, level = 1, actions, align = 'start', class: className = '', children }: Props =
		$props();
</script>

<section class="ds-intro {className}" data-align={align}>
	<svelte:element this={`h${level}`} class="title">{title}</svelte:element>
	{#if lead}<p class="lead">{lead}</p>{/if}
	{@render children?.()}
	{#if actions}<div class="actions">{@render actions()}</div>{/if}
</section>

<style>
	.ds-intro {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 12px;
		max-width: 720px;
		padding: 24px 0 32px;
		container-type: inline-size;
	}
	[data-align='center'] {
		align-items: center;
		margin-inline: auto;
		text-align: center;
	}
	.title {
		margin: 0;
		color: var(--ds-text-heading);
		font-size: var(--ds-text-2xl);
		line-height: var(--ds-lh-2xl);
		font-weight: 500;
	}
	@container (min-width: 560px) {
		.title {
			font-size: var(--ds-text-3xl);
			line-height: var(--ds-lh-3xl);
		}
	}
	.lead {
		max-width: 62ch;
		margin: 0;
		color: var(--ds-text-2);
		font-size: var(--ds-text-lg);
		line-height: 1.55;
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-top: 8px;
	}
</style>
