<!--
@component
TabBar — the primary navigation below 768px, replacing NavRail. Fixed to the bottom on ds-bg-2,
56px plus the bottom safe-area inset.

At most five cells: four destinations and **More**, which opens a Sheet with every remaining item
under the same group titles the rail uses, plus the `footer` (the account block). Each cell is an
icon over a 12px label; the current one is ds-text-1 with an accent icon. A badge is a dot, or a
count up to 99.

- `items` and `groups` (the one navigation list), `current`, `primary` (the ids of the four cells;
  default the first four items), `moreLabel`, `footer`, `label`.

Pages must leave room for it: AppShell publishes its height as `--ds-chrome-bottom`.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import Ellipsis from '@lucide/svelte/icons/ellipsis';

	import Sheet from './Sheet.svelte';
	import SheetItem from './SheetItem.svelte';
	import { badgeSpoken, badgeText, groupItems, type NavGroup, type NavItem } from '../nav.js';

	interface Props {
		items: readonly NavItem[];
		groups?: readonly NavGroup[];
		current?: string;
		primary?: readonly string[];
		moreLabel?: string;
		footer?: Snippet;
		label?: string;
		class?: string;
	}

	let {
		items,
		groups = [],
		current,
		primary,
		moreLabel = 'More',
		footer,
		label = 'Primary',
		class: className = ''
	}: Props = $props();

	let moreOpen = $state(false);
	const ids = $derived(new Set(primary ?? items.slice(0, items.length > 5 ? 4 : 5).map((i) => i.id)));
	const cells = $derived(items.filter((i) => ids.has(i.id)).slice(0, 5));
	const rest = $derived(items.filter((i) => !ids.has(i.id)));
	const moreSections = $derived(groupItems(rest, groups));
	const moreCurrent = $derived(rest.some((i) => i.id === current));
	const moreBadge = $derived(rest.some((i) => badgeText(i.badge) !== null));
</script>

<nav class="ds-tabbar {className}" aria-label={label}>
	{#each cells as item (item.id)}
		{@const badge = badgeText(item.badge)}
		<a href={item.href} class="cell" aria-current={item.id === current ? 'page' : undefined}>
			<span class="icon">
				{#if item.icon}<item.icon size={20} aria-hidden="true" />{/if}
				{#if badge !== null}<span class="badge" data-dot={badge === '' ? '' : undefined} aria-hidden="true"
						>{badge}</span
					>{/if}
			</span>
			<span class="label">{item.label}</span>
			{#if badge !== null}<span class="ds-sr-only">{badgeSpoken(badge)}</span>{/if}
		</a>
	{/each}
	{#if rest.length}
		<button type="button" class="cell" data-current={moreCurrent ? '' : undefined} aria-haspopup="dialog" onclick={() => (moreOpen = true)}>
			<span class="icon">
				<Ellipsis size={20} aria-hidden="true" />
				{#if moreBadge}<span class="badge" data-dot="" aria-hidden="true"></span>{/if}
			</span>
			<span class="label">{moreLabel}</span>
			{#if moreBadge}<span class="ds-sr-only">{badgeSpoken('')}</span>{/if}
		</button>
	{/if}
</nav>

{#if rest.length}
	<Sheet bind:open={moreOpen} title={moreLabel}>
		{#each moreSections as section (section.group?.id ?? '_')}
			{#if section.group}<h3 class="group">{section.group.label}</h3>{/if}
			{#each section.items as item (item.id)}
				<SheetItem
					label={item.label}
					icon={item.icon}
					href={item.href}
					current={item.id === current}
					trailing={badgeText(item.badge) || null}
					onclick={() => (moreOpen = false)}
				/>
			{/each}
		{/each}
		{#if footer}<div class="footer">{@render footer()}</div>{/if}
	</Sheet>
{/if}

<style>
	.ds-tabbar {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: var(--ds-z-sticky);
		display: none;
		grid-auto-columns: minmax(0, 1fr);
		grid-auto-flow: column;
		height: calc(var(--ds-tabbar-h) + env(safe-area-inset-bottom, 0px));
		padding-bottom: env(safe-area-inset-bottom, 0px);
		border-top: 1px solid var(--ds-border-subtle);
		background: var(--ds-bg-2);
	}
	@media (max-width: 767.98px) {
		.ds-tabbar {
			display: grid;
		}
	}
	.cell {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 3px;
		min-width: 0;
		padding: 0 2px;
		border: 0;
		background: transparent;
		color: var(--ds-text-3);
		font-family: var(--font-sans);
		font-size: var(--ds-text-xs);
		line-height: var(--ds-lh-xs);
		text-decoration: none;
		cursor: pointer;
	}
	.cell:focus-visible {
		outline-offset: -4px;
	}
	.cell[aria-current='page'],
	.cell[data-current] {
		color: var(--ds-text-1);
	}
	.cell[aria-current='page'] .icon,
	.cell[data-current] .icon {
		color: var(--ds-accent-text);
	}
	.icon {
		position: relative;
		display: inline-flex;
	}
	.label {
		max-width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.badge {
		position: absolute;
		top: -4px;
		left: 14px;
		min-width: 16px;
		height: 16px;
		padding: 0 4px;
		border-radius: var(--ds-radius-full);
		background: var(--ds-accent);
		color: var(--ds-accent-contrast);
		font-size: var(--ds-text-xs);
		line-height: 16px;
		text-align: center;
		font-variant-numeric: tabular-nums;
	}
	.badge[data-dot] {
		top: -2px;
		left: 16px;
		min-width: 8px;
		height: 8px;
		padding: 0;
	}
	.group {
		margin: 12px 8px 2px;
		color: var(--ds-text-3);
		font-size: 11px;
		line-height: 16px;
		font-weight: 400;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}
	.footer {
		margin-top: 12px;
		padding-top: 12px;
		border-top: 1px solid var(--ds-border-subtle);
	}
</style>
