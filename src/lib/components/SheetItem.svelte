<!--
@component
SheetItem — one 44px row in a Sheet or any touch menu: an icon, the label, an optional trailing
value, and a check on the current choice. A link with `href`, a button otherwise.

- `label`, `icon`, `href` or `onclick`, `current` (accent icon, check, and `aria-current` or
  `aria-pressed`), `trailing` (12px ds-text-3), `tone` (`default` | `danger`).
-->
<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import type { IconComponent } from '../types.js';

	interface Props {
		label: string;
		icon?: IconComponent;
		href?: string;
		onclick?: (event: MouseEvent) => void;
		current?: boolean;
		trailing?: string | number | null;
		tone?: 'default' | 'danger';
		class?: string;
	}

	let { label, icon: Icon, href, onclick, current = false, trailing = null, tone = 'default', class: className = '' }: Props =
		$props();
</script>

{#snippet body()}
	{#if Icon}<span class="icon"><Icon size={18} aria-hidden="true" /></span>{/if}
	<span class="label">{label}</span>
	{#if trailing !== null && trailing !== ''}<span class="trail">{trailing}</span>{/if}
	{#if current}<span class="icon check"><Check size={18} aria-hidden="true" /></span>{/if}
{/snippet}

{#if href}
	<a {href} class="ds-sheetitem {className}" data-tone={tone} data-current={current ? '' : undefined} aria-current={current ? 'page' : undefined} {onclick}>
		{@render body()}
	</a>
{:else}
	<button type="button" class="ds-sheetitem {className}" data-tone={tone} data-current={current ? '' : undefined} aria-pressed={current ? 'true' : undefined} {onclick}>
		{@render body()}
	</button>
{/if}

<style>
	.ds-sheetitem {
		display: flex;
		align-items: center;
		gap: 12px;
		width: 100%;
		min-height: var(--ds-h-touch);
		padding: 0 8px;
		border: 0;
		border-radius: var(--ds-radius-sm);
		background: transparent;
		color: var(--ds-text-1);
		font-family: var(--font-sans);
		font-size: var(--ds-text-md);
		line-height: var(--ds-lh-md);
		text-align: start;
		text-decoration: none;
		cursor: pointer;
	}
	.ds-sheetitem:hover {
		background: var(--ds-bg-4);
	}
	.ds-sheetitem:focus-visible {
		outline-offset: -2px;
	}
	.icon {
		display: inline-flex;
		flex: none;
		color: var(--ds-text-3);
	}
	.ds-sheetitem[data-current] .icon {
		color: var(--ds-accent-text);
	}
	.ds-sheetitem[data-tone='danger'],
	.ds-sheetitem[data-tone='danger'] .icon {
		color: var(--ds-danger-text);
	}
	.label {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.trail {
		color: var(--ds-text-3);
		font-size: var(--ds-text-xs);
		font-variant-numeric: tabular-nums;
	}
</style>
