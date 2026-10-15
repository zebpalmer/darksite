<!--
@component
NavRail — the primary navigation on ds-bg-0, full height, from 768px up (below that, TabBar).

- **Collapsed** (56px): 40×36 icon items; the label shows as one fixed-position tooltip — fixed,
  so a scrolling list never clips it — after 300ms on hover and at once on keyboard focus.
- **Expanded** (208px): 32px rows with icon, label and badge; groups get 11px uppercase titles.
- Active = ds-bg-4 + ds-text-1 + a 2px accent bar. The item list scrolls on a short window and
  the current item scrolls into view; the footer (account, collapse toggle, version) stays put.
- `expanded` is bindable. With `rememberAs`, the choice is remembered for this viewer; with
  nothing stored the rail starts expanded at 1440px and collapsed below.

Items come from the one navigation list (`NavItem[]`). Items a role cannot use are removed from
that list, not disabled.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';
	import PanelLeftClose from '@lucide/svelte/icons/panel-left-close';
	import PanelLeftOpen from '@lucide/svelte/icons/panel-left-open';

	import Button from './Button.svelte';
	import { badgeText, groupItems, type NavGroup, type NavItem } from '../nav.js';

	interface Props {
		items: readonly NavItem[];
		groups?: readonly NavGroup[];
		current?: string;
		expanded?: boolean;
		rememberAs?: string;
		product?: string;
		mark?: Snippet;
		footer?: Snippet<[{ expanded: boolean }]>;
		version?: string;
		label?: string;
		class?: string;
	}

	let {
		items,
		groups = [],
		current,
		expanded = $bindable(),
		rememberAs,
		product,
		mark,
		footer,
		version,
		label = 'Primary',
		class: className = ''
	}: Props = $props();

	const sections = $derived(groupItems(items, groups));
	const open = $derived(expanded ?? false);
	const storageKey = $derived(rememberAs ? `darksite:rail:${rememberAs}` : null);

	let listEl: HTMLElement | undefined = $state();
	let tip = $state<{ text: string; top: number; left: number } | null>(null);
	let tipTimer: ReturnType<typeof setTimeout> | undefined;

	onMount(() => {
		if (expanded === undefined) {
			let stored: string | null = null;
			try {
				stored = storageKey ? localStorage.getItem(storageKey) : null;
			} catch {
				/* storage unavailable */
			}
			expanded = stored !== null ? stored === '1' : (window.matchMedia?.('(min-width: 1440px)').matches ?? false);
		}
		listEl?.querySelector('[aria-current="page"]')?.scrollIntoView?.({ block: 'nearest' });
	});

	function toggle() {
		expanded = !open;
		tip = null;
		try {
			if (storageKey) localStorage.setItem(storageKey, expanded ? '1' : '0');
		} catch {
			/* storage unavailable: remembered for this page view only */
		}
	}

	function showTip(el: HTMLElement, text: string, delay: number) {
		if (open) return;
		clearTimeout(tipTimer);
		tipTimer = setTimeout(() => {
			const r = el.getBoundingClientRect();
			tip = { text, top: r.top + r.height / 2, left: r.right + 8 };
		}, delay);
	}

	function hideTip() {
		clearTimeout(tipTimer);
		tip = null;
	}
</script>

<nav class="ds-navrail {className}" data-expanded={open ? '' : undefined} aria-label={label}>
	{#if mark || product}
		<div class="brand">
			{#if mark}<span class="mark">{@render mark()}</span>{/if}
			{#if product}<span class="product" class:ds-sr-only={!open}>{product}</span>{/if}
		</div>
	{/if}
	<div class="list" bind:this={listEl}>
		{#each sections as section, si (section.group?.id ?? '_')}
			{#if si > 0}<div class="divider" aria-hidden="true"></div>{/if}
			{#if section.group && open}<div class="group" aria-hidden="true">{section.group.label}</div>{/if}
			<ul aria-label={section.group?.label}>
				{#each section.items as item (item.id)}
					{@const badge = badgeText(item.badge)}
					<li>
						<a
							href={item.href}
							class="item"
							aria-current={item.id === current ? 'page' : undefined}
							onmouseenter={(e) => showTip(e.currentTarget, item.label, 300)}
							onmouseleave={hideTip}
							onfocus={(e) => showTip(e.currentTarget, item.label, 0)}
							onblur={hideTip}
						>
							{#if item.icon}<item.icon size={open ? 18 : 20} aria-hidden="true" />{/if}
							<span class="label" class:ds-sr-only={!open}>{item.label}</span>
							{#if badge !== null}
								<span class="badge" data-dot={badge === '' ? '' : undefined}>{badge}</span>
								{#if badge}<span class="ds-sr-only">, {badge}</span>{/if}
							{/if}
						</a>
					</li>
				{/each}
			</ul>
		{/each}
	</div>
	<div class="foot">
		{#if footer}{@render footer({ expanded: open })}{/if}
		<Button
			variant="icon"
			label={open ? 'Collapse navigation' : 'Expand navigation'}
			icon={open ? PanelLeftClose : PanelLeftOpen}
			onclick={toggle}
		/>
		{#if version && open}<span class="version">{version}</span>{/if}
	</div>
	{#if tip}
		<span class="tip" style:top="{tip.top}px" style:left="{tip.left}px" aria-hidden="true">{tip.text}</span>
	{/if}
</nav>

<style>
	.ds-navrail {
		display: flex;
		flex-direction: column;
		flex: none;
		width: var(--ds-rail-w);
		height: 100%;
		min-height: 0;
		padding: 8px 0;
		background: var(--ds-bg-0);
		transition: width var(--ds-dur-base) var(--ds-ease-in-out);
	}
	.ds-navrail[data-expanded] {
		width: var(--ds-rail-w-expanded);
	}
	@media (max-width: 767.98px) {
		.ds-navrail {
			display: none;
		}
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 10px;
		flex: none;
		min-height: 36px;
		padding: 0 8px 8px;
	}
	.ds-navrail:not([data-expanded]) .brand {
		justify-content: center;
	}
	.mark {
		display: inline-flex;
		flex: none;
	}
	.product {
		overflow: hidden;
		color: var(--ds-text-1);
		font-size: var(--ds-text-md);
		font-weight: 500;
		white-space: nowrap;
	}
	.list {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		overflow-x: hidden;
		scrollbar-width: thin;
	}
	ul {
		display: flex;
		flex-direction: column;
		gap: 2px;
		margin: 0;
		padding: 0 8px;
		list-style: none;
	}
	.ds-navrail:not([data-expanded]) ul {
		align-items: center;
		gap: 4px;
	}
	.divider {
		height: 1px;
		margin: 8px 12px;
		background: var(--ds-border-subtle);
	}
	.group {
		padding: 2px 16px 4px;
		color: var(--ds-text-3);
		font-size: 11px;
		line-height: 16px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		white-space: nowrap;
	}
	.item {
		position: relative;
		display: flex;
		align-items: center;
		gap: 10px;
		height: 32px;
		padding: 0 8px;
		border-radius: var(--ds-radius-sm);
		color: var(--ds-text-2);
		font-size: var(--ds-text-sm);
		line-height: var(--ds-lh-sm);
		text-decoration: none;
		white-space: nowrap;
		transition:
			background-color var(--ds-dur-fast) var(--ds-ease-out),
			color var(--ds-dur-fast) var(--ds-ease-out);
	}
	.ds-navrail:not([data-expanded]) .item {
		justify-content: center;
		width: 40px;
		height: 36px;
		padding: 0;
		color: var(--ds-text-3);
	}
	.item:hover {
		background: var(--ds-bg-2);
		color: var(--ds-text-1);
	}
	.item[aria-current='page'] {
		background: var(--ds-bg-4);
		color: var(--ds-text-1);
	}
	.item[aria-current='page']::before {
		content: '';
		position: absolute;
		left: -8px;
		top: 6px;
		bottom: 6px;
		width: 2px;
		border-radius: 2px;
		background: var(--ds-accent);
	}
	.item:focus-visible {
		outline-offset: -2px;
	}
	.label {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.badge {
		color: var(--ds-text-3);
		font-size: var(--ds-text-xs);
		font-variant-numeric: tabular-nums;
	}
	.badge[data-dot],
	.ds-navrail:not([data-expanded]) .badge {
		position: absolute;
		top: 4px;
		right: 4px;
		min-width: 8px;
		height: 8px;
		padding: 0;
		border-radius: var(--ds-radius-full);
		background: var(--ds-accent);
		font-size: 0;
	}
	.ds-navrail[data-expanded] .badge[data-dot] {
		position: static;
	}
	.foot {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		flex: none;
		padding: 8px 8px 0;
		border-top: 1px solid var(--ds-border-subtle);
	}
	.ds-navrail[data-expanded] .foot {
		align-items: flex-start;
	}
	.version {
		padding: 0 4px;
		color: var(--ds-text-3);
		font-size: 11px;
		font-variant-numeric: tabular-nums;
	}
	.tip {
		position: fixed;
		z-index: var(--ds-z-tooltip);
		transform: translateY(-50%);
		padding: 4px 8px;
		border-radius: var(--ds-radius-xs);
		background: var(--ds-bg-4);
		box-shadow: var(--ds-elev-2);
		color: var(--ds-text-1);
		font-size: var(--ds-text-xs);
		line-height: var(--ds-lh-xs);
		white-space: nowrap;
		pointer-events: none;
	}
</style>
