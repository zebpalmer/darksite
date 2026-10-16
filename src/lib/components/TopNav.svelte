<!--
@component
TopNav — primary navigation as a bar across the top, for a product with a few top-level sections:
`AppShell nav="top"` renders it. It reads the same navigation list as the rail. Items without a
group are links in the bar; each group is a disclosure menu ("Records ▾") of links. On phones the
bar keeps the product and a menu button that opens a Sheet with every destination, grouped, and
the account block.

The menus follow the disclosure-navigation pattern: a button with `aria-expanded` that shows a list
of real links (so a link opens in a new tab like any other). Esc or a press outside closes a menu
and returns focus to its button. The current page is `aria-current="page"`, and its group's button
carries the accent mark. The bar sits on the chrome's bar roles (`ds-bar-*`), so a brand can color it.

- `items`, `groups`, `current` (the one navigation list), `product`, `mark`, `homeHref` (default
  `/`), `actions` snippet (the bar's right end: search, a sign-in), `accountInline` snippet (the
  account block in the bar on desktop), `account` snippet (the phone sheet's footer), `label` (default "Primary"), `sticky` (default true), `class`.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import MenuIcon from '@lucide/svelte/icons/menu';

	import Button from './Button.svelte';
	import Sheet from './Sheet.svelte';
	import SheetItem from './SheetItem.svelte';
	import { badgeSpoken, badgeText, groupItems, type NavGroup, type NavItem } from '../nav.js';
	import { strings } from '../strings.svelte.js';

	interface Props {
		items: readonly NavItem[];
		groups?: readonly NavGroup[];
		current?: string;
		product?: string;
		mark?: Snippet;
		homeHref?: string;
		actions?: Snippet;
		/** The account block in the bar, on desktop (AppShell passes its compact form). */
		accountInline?: Snippet;
		account?: Snippet;
		label?: string;
		sticky?: boolean;
		class?: string;
	}

	let {
		items,
		groups = [],
		current,
		product,
		mark,
		homeHref = '/',
		actions,
		accountInline,
		account,
		label = strings.primaryNavigation,
		sticky = true,
		class: className = ''
	}: Props = $props();

	const uid = $props.id();
	const sections = $derived(groupItems(items, groups));
	const loose = $derived(sections.find((s) => !s.group)?.items ?? []);
	const menus = $derived(sections.filter((s) => s.group));
	const topLayer = typeof HTMLElement !== 'undefined' && 'showPopover' in HTMLElement.prototype;

	let openGroup = $state<string | null>(null);
	let sheetOpen = $state(false);
	const buttons: Record<string, HTMLButtonElement> = {};

	// A navigation (the current page changes) closes whatever is open.
	$effect(() => {
		void current;
		openGroup = null;
		sheetOpen = false;
	});

	function close(returnFocus = true) {
		const g = openGroup;
		openGroup = null;
		if (returnFocus && g) buttons[g]?.focus();
	}

	function surface(el: HTMLElement) {
		if (topLayer) el.showPopover();
		const anchor = openGroup ? buttons[openGroup] : undefined;
		let stop = () => {};
		if (anchor && typeof ResizeObserver !== 'undefined') {
			stop = autoUpdate(anchor, el, () => {
				computePosition(anchor, el, {
					placement: 'bottom-start',
					strategy: 'fixed',
					middleware: [offset(6), flip(), shift({ padding: 8 })]
				}).then(({ x, y }) => {
					el.style.left = `${x}px`;
					el.style.top = `${y}px`;
				});
			});
		}
		el.querySelector<HTMLElement>('a')?.focus();
		const onKey = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				event.preventDefault();
				close();
			}
		};
		const onDown = (event: PointerEvent) => {
			const t = event.target as Node;
			if (!el.contains(t) && !anchor?.contains(t)) close(false);
		};
		const onFocusOut = (event: FocusEvent) => {
			const to = event.relatedTarget as Node | null;
			if (to && !el.contains(to) && !anchor?.contains(to)) close(false);
		};
		document.addEventListener('keydown', onKey);
		document.addEventListener('pointerdown', onDown, true);
		el.addEventListener('focusout', onFocusOut);
		return () => {
			stop();
			document.removeEventListener('keydown', onKey);
			document.removeEventListener('pointerdown', onDown, true);
			el.removeEventListener('focusout', onFocusOut);
		};
	}
</script>

{#snippet badgeOf(item: NavItem)}
	{@const badge = badgeText(item.badge)}
	{#if badge !== null}
		<span class="badge" data-dot={badge === '' ? '' : undefined} aria-hidden="true">{badge}</span>
		<span class="ds-sr-only">{badgeSpoken(badge)}</span>
	{/if}
{/snippet}

<header class="ds-topnav {className}" class:sticky>
	<a class="brand" href={homeHref}>
		{#if mark}<span class="mark">{@render mark()}</span>{/if}
		{#if product}<span class="product">{product}</span>{:else}<span class="ds-sr-only"
				>{strings.home}</span
			>{/if}
	</a>
	<nav class="nav" aria-label={label}>
		<ul class="list">
			{#each loose as item (item.id)}
				<li>
					<a href={item.href} class="link" aria-current={item.id === current ? 'page' : undefined}
						>{item.label}{@render badgeOf(item)}</a
					>
				</li>
			{/each}
			{#each menus as section (section.group!.id)}
				{@const g = section.group!}
				{@const here = section.items.some((i) => i.id === current)}
				<li>
					<button
						bind:this={buttons[g.id]}
						type="button"
						class="link"
						aria-expanded={openGroup === g.id}
						aria-controls={openGroup === g.id ? `${uid}-${g.id}` : undefined}
						data-current={here ? '' : undefined}
						onclick={() => (openGroup = openGroup === g.id ? null : g.id)}
					>
						{g.label}
						<ChevronDown size={14} aria-hidden="true" />
					</button>
				</li>
			{/each}
		</ul>
	</nav>
	<span class="grow"></span>
	{#if actions}<div class="actions">{@render actions()}</div>{/if}
	{#if accountInline}<div class="account">{@render accountInline()}</div>{/if}
	<span class="menu-button">
		<Button variant="icon" icon={MenuIcon} label={strings.menu} aria-haspopup="dialog" onclick={() => (sheetOpen = true)} />
	</span>
</header>

{#if openGroup}
	{@const section = menus.find((s) => s.group!.id === openGroup)}
	{#if section}
		<div
			id="{uid}-{openGroup}"
			class="panel"
			popover={topLayer ? 'manual' : undefined}
			{@attach surface}
		>
			<ul>
				{#each section.items as item (item.id)}
					<li>
						<a href={item.href} class="item" aria-current={item.id === current ? 'page' : undefined}
							>{#if item.icon}<item.icon size={16} aria-hidden="true" />{/if}<span class="text"
								>{item.label}</span
							>{@render badgeOf(item)}</a
						>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
{/if}

{#snippet sheetFooter()}{@render account?.()}{/snippet}

<Sheet bind:open={sheetOpen} title={strings.menu} footer={account ? sheetFooter : undefined}>
	{#each sections as section (section.group?.id ?? '_')}
		{#if section.group}<p class="sheet-group">{section.group.label}</p>{/if}
		{#each section.items as item (item.id)}
			<SheetItem label={item.label} icon={item.icon} href={item.href} current={item.id === current} />
		{/each}
	{/each}
</Sheet>

<style>
	.ds-topnav {
		/* The bar reads the chrome roles, so a brand can color it; everything inside follows. */
		--ds-bg-0: var(--ds-bar-bg-0);
		--ds-bg-1: var(--ds-bar-bg-1);
		--ds-bg-2: var(--ds-bar-bg-2);
		--ds-bg-3: var(--ds-bar-bg-3);
		--ds-bg-4: var(--ds-bar-bg-4);
		--ds-bg-5: var(--ds-bar-bg-5);
		--ds-text-1: var(--ds-bar-text-1);
		--ds-text-2: var(--ds-bar-text-2);
		--ds-text-3: var(--ds-bar-text-3);
		--ds-border-subtle: var(--ds-bar-border-subtle);
		--ds-border: var(--ds-bar-border);
		--ds-border-strong: var(--ds-bar-border-strong);
		--ds-accent: var(--ds-bar-accent);
		--ds-accent-text: var(--ds-bar-accent-text);
		display: flex;
		align-items: center;
		gap: 16px;
		min-width: 0;
		height: var(--ds-header-h);
		padding: 0 16px;
		border-bottom: 1px solid var(--ds-border-subtle);
		background: var(--ds-bg-2);
		color: var(--ds-text-1);
	}
	.sticky {
		position: sticky;
		top: 0;
		z-index: var(--ds-z-topbar);
	}
	.brand {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		flex: none;
		color: var(--ds-text-1);
		font-size: var(--ds-text-lg);
		font-weight: 500;
		text-decoration: none;
	}
	.mark {
		display: inline-flex;
	}
	.nav {
		min-width: 0;
	}
	.list {
		display: flex;
		align-items: center;
		gap: 2px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.link {
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: 4px;
		height: 32px;
		padding: 0 10px;
		border: 0;
		border-radius: var(--ds-radius-sm);
		background: transparent;
		color: var(--ds-text-2);
		font: inherit;
		font-size: var(--ds-text-md);
		text-decoration: none;
		white-space: nowrap;
		cursor: pointer;
	}
	.link:hover,
	.link[aria-expanded='true'] {
		background: var(--ds-bg-4);
		color: var(--ds-text-1);
	}
	.link[aria-current='page'],
	.link[data-current] {
		color: var(--ds-text-1);
	}
	.link[aria-current='page']::after,
	.link[data-current]::after {
		content: '';
		position: absolute;
		left: 10px;
		right: 10px;
		bottom: -12px;
		height: 2px;
		border-radius: 2px;
		background: var(--ds-accent);
	}
	.link :global(svg) {
		color: var(--ds-text-3);
	}
	.grow {
		flex: 1;
	}
	.actions {
		display: flex;
		align-items: center;
		gap: 8px;
		min-width: 0;
	}
	.menu-button {
		display: none;
	}
	.account {
		display: flex;
		align-items: center;
	}
	.badge {
		min-width: 16px;
		height: 16px;
		margin-left: 4px;
		padding: 0 4px;
		border-radius: var(--ds-radius-full);
		background: var(--ds-accent-tint);
		color: var(--ds-text-2);
		font-size: var(--ds-text-xs);
		line-height: 16px;
		text-align: center;
	}
	.badge[data-dot] {
		min-width: 8px;
		width: 8px;
		height: 8px;
		padding: 0;
		background: var(--ds-accent);
	}
	.panel {
		position: fixed;
		inset: auto;
		z-index: var(--ds-z-popover);
		min-width: 200px;
		max-width: min(320px, calc(100vw - 16px));
		margin: 0;
		padding: 4px;
		border: 1px solid var(--ds-border-subtle);
		border-radius: var(--ds-radius-md);
		background: var(--ds-bg-3);
		box-shadow: var(--ds-elev-3);
		color: var(--ds-text-1);
		animation: ds-fade var(--ds-dur-fast) var(--ds-ease-out);
	}
	.panel ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.item {
		display: flex;
		align-items: center;
		gap: 10px;
		min-height: 32px;
		padding: 0 8px;
		border-radius: var(--ds-radius-sm);
		color: var(--ds-text-1);
		font-size: var(--ds-text-md);
		text-decoration: none;
	}
	.item :global(svg) {
		flex: none;
		color: var(--ds-text-3);
	}
	.item:hover {
		background: var(--ds-bg-5);
	}
	.item[aria-current='page'] {
		background: var(--ds-accent-tint);
	}
	.item .text {
		flex: 1;
		min-width: 0;
	}
	.sheet-group {
		margin: 12px 0 4px;
		color: var(--ds-text-3);
		font-size: 11px;
		font-weight: 500;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}
	.sheet-group:first-child {
		margin-top: 0;
	}
	@media (pointer: coarse) {
		.link,
		.item {
			min-height: var(--ds-h-touch);
		}
	}
	@media (max-width: 767.98px) {
		.nav {
			display: none;
		}
		.menu-button {
			display: inline-flex;
		}
		.account {
			display: none;
		}
	}
</style>
