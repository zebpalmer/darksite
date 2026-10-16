<!--
@component
LinkCard — a destination on an overview page: a tool, a section, a guide. A whole-card link with an
optional icon, a title, one or two sentences and an arrow. Put several in a `Grid min={260}`. For a
record, use EntityCard; for media, Card.

- `href`, `title`, `text`, `icon` (a Lucide icon), `meta` (a short note at the foot: "Updated
  hourly"), `external` (opens in a new tab, with the arrow turned and a spoken "opens in a new tab"),
  `class`.
-->
<script lang="ts">
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';

	import { strings } from '../strings.svelte.js';
	import type { IconComponent } from '../types.js';

	interface Props {
		href: string;
		title: string;
		text?: string;
		icon?: IconComponent;
		meta?: string;
		external?: boolean;
		class?: string;
	}

	let { href, title, text, icon: Icon, meta, external = false, class: className = '' }: Props = $props();
</script>

<a
	{href}
	class="ds-linkcard {className}"
	target={external ? '_blank' : undefined}
	rel={external ? 'noopener noreferrer' : undefined}
>
	<span class="top">
		{#if Icon}<span class="icon"><Icon size={18} aria-hidden="true" /></span>{/if}
		<span class="title">{title}</span>
		<span class="arrow"
			>{#if external}<ArrowUpRight size={16} aria-hidden="true" /><span class="ds-sr-only"
					>{strings.opensInNewTab}</span
				>{:else}<ArrowRight size={16} aria-hidden="true" />{/if}</span
		>
	</span>
	{#if text}<span class="text">{text}</span>{/if}
	{#if meta}<span class="meta">{meta}</span>{/if}
</a>

<style>
	.ds-linkcard {
		display: flex;
		flex-direction: column;
		gap: 6px;
		min-width: 0;
		padding: 14px;
		border: 1px solid var(--ds-border-subtle);
		border-radius: var(--ds-radius-md);
		background: var(--ds-bg-2);
		color: var(--ds-text-1);
		text-decoration: none;
		transition: background-color var(--ds-dur-fast) var(--ds-ease-out);
	}
	.ds-linkcard:hover {
		background: var(--ds-bg-3);
	}
	.ds-linkcard:hover .arrow {
		color: var(--ds-accent-text);
	}
	.top {
		display: flex;
		align-items: center;
		gap: 10px;
		min-width: 0;
	}
	.icon {
		display: inline-flex;
		flex: none;
		color: var(--ds-accent-text);
	}
	.title {
		flex: 1;
		min-width: 0;
		font-size: var(--ds-text-md);
		font-weight: 500;
	}
	.arrow {
		display: inline-flex;
		flex: none;
		color: var(--ds-text-3);
	}
	.text {
		color: var(--ds-text-2);
		font-size: var(--ds-text-sm);
		line-height: var(--ds-lh-sm);
	}
	.meta {
		margin-top: 2px;
		color: var(--ds-text-3);
		font-size: var(--ds-text-xs);
	}
</style>
