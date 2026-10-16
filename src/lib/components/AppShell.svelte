<!--
@component
AppShell — the application frame: a NavRail beside a content column holding an optional Banner,
an optional TopBar and the page; below 768px the rail gives way to a TabBar. It owns the one
Toaster and a "Skip to content" link.

It publishes the geometry pages rely on (docs/layout.md): the padded column's `--ds-pad-top` /
`--ds-pad-x` (PageHeader cancels them to sit flush), and `--ds-chrome-bottom`, the tab bar's
height on phones, so nothing is hidden under it. Content pages scroll the document; the rail stays
in place.

- `nav` — `rail` (default: a NavRail, a TabBar on phones) or `top` (a TopNav bar across the top
  for a product with a few top-level sections; groups become its menus, and phones get a menu
  sheet). `navActions` snippet: the top bar's right end. `homeHref`: where the product name links.
- `footer` snippet: under every page (version, links), hidden on a FullBleed page.
- `items`, `groups`, `current` — the one navigation list, used by the rail or the top bar, the tab
  bar and the phone sheets.
- `product` and `mark` (the brand at the top of the rail), `account` snippet (the rail's footer
  and the More sheet's footer; receives `{ compact }`), `version`, `rememberAs` (remember the
  rail's state for this viewer), `primaryTabs` (the tab bar's four cells).
- `railSearch`, `railStatus`, `railBadge`, `railPinned` — the NavRail's `search`, `status` and
  `badge` slots and `pinned`; `railExpanded` (bindable).
- `banner`, `topBar` snippets; `padded` (default true — false hands the column to a work view
  that lays out its own panes); `toaster` (default true); children (the page).
- `headerActions` snippet — shell-wide controls (usually a global search) on the same line as every
  page's PageHeader, right-aligned, ahead of the page's own actions. It renders inside PageHeader,
  so a page with no PageHeader shows none. `headerActionsKey` (default `/`) focuses its first
  field; `null` turns that off. On phones it collapses to an icon button (`headerActionsIcon`,
  default a search icon; `headerActionsLabel`, default "Search") that opens a full-width row under
  the header (the key opens it too); Esc inside the row, or a change of `current`, closes it.

A page that renders a `FullBleed` (a map, a canvas) gets the whole column at every width: no
padding, no footer, the shell locked to the viewport.

A page that renders a `WorkView` gets the work-view frame without touching `padded`: while one is
mounted the column's padding is zero, and from 768px the shell locks to the viewport so the work
view fills what the Banner and TopBar leave and the document does not scroll.
-->
<script lang="ts">
	import { strings } from '../strings.svelte.js';
	import type { Snippet } from 'svelte';
	import Search from '@lucide/svelte/icons/search';

	import NavRail, { type RailSlotArgs } from './NavRail.svelte';
	import TabBar from './TabBar.svelte';
	import TopNav from './TopNav.svelte';
	import Toaster from './Toaster.svelte';
	import type { NavGroup, NavItem } from '../nav.js';
	import { media } from '../media.svelte.js';
	import { setHeaderActions } from '../shell-context.js';
	import type { IconComponent } from '../types.js';

	interface Props {
		/** `rail` (default): a NavRail, and a TabBar on phones. `top`: a TopNav bar, and its menu
		 *  sheet on phones — for a product with a few top-level sections. */
		nav?: 'rail' | 'top';
		/** The bar's right end with `nav="top"`: search, a sign-in. */
		navActions?: Snippet;
		/** A footer under every page (version, links); hidden on a FullBleed page. */
		footer?: Snippet;
		homeHref?: string;
		items: readonly NavItem[];
		groups?: readonly NavGroup[];
		current?: string;
		product?: string;
		mark?: Snippet;
		account?: Snippet<[{ compact: boolean }]>;
		version?: string;
		rememberAs?: string;
		primaryTabs?: readonly string[];
		banner?: Snippet;
		topBar?: Snippet;
		headerActions?: Snippet;
		headerActionsIcon?: IconComponent;
		headerActionsLabel?: string;
		headerActionsKey?: string | null;
		padded?: boolean;
		toaster?: boolean;
		railExpanded?: boolean;
		railSearch?: Snippet<[RailSlotArgs]>;
		railStatus?: Snippet<[RailSlotArgs]>;
		railBadge?: Snippet<[{ item: NavItem; expanded: boolean }]>;
		railPinned?: boolean;
		class?: string;
		children: Snippet;
	}

	let {
		nav = 'rail',
		navActions,
		footer,
		homeHref,
		items,
		groups = [],
		current,
		product,
		mark,
		account,
		version,
		rememberAs,
		primaryTabs,
		banner,
		topBar,
		headerActions,
		headerActionsIcon = Search,
		headerActionsLabel = strings.search,
		headerActionsKey = '/',
		padded = true,
		toaster = true,
		railExpanded = $bindable(),
		railSearch,
		railStatus,
		railBadge,
		railPinned = false,
		class: className = '',
		children
	}: Props = $props();

	setHeaderActions({
		get snippet() {
			return headerActions;
		},
		get icon() {
			return headerActionsIcon;
		},
		get label() {
			return headerActionsLabel;
		},
		get key() {
			return headerActionsKey;
		},
		get phone() {
			return media.phone;
		},
		get current() {
			return current;
		}
	});
</script>

{#snippet railFooter({ expanded }: { expanded: boolean })}
	{@render account?.({ compact: !expanded })}
{/snippet}

{#snippet sheetFooter()}
	{@render account?.({ compact: false })}
{/snippet}

{#snippet barAccount()}
	{@render account?.({ compact: true })}
{/snippet}

<div class="ds-appshell {className}" data-nav={nav}>
	<a class="skip" href="#ds-main">{strings.skipToContent}</a>
	{#if nav === 'rail'}<div class="rail">
		<NavRail
			{items}
			{groups}
			{current}
			{product}
			{mark}
			{version}
			{rememberAs}
			bind:expanded={railExpanded}
			search={railSearch}
			status={railStatus}
			badge={railBadge}
			pinned={railPinned}
			footer={account ? railFooter : undefined}
		/>
	</div>{/if}
	<div class="column" data-footer={footer ? '' : undefined}>
		{@render banner?.()}
		{#if nav === 'top'}
			<TopNav
				{items}
				{groups}
				{current}
				{product}
				{mark}
				{homeHref}
				actions={navActions}
				accountInline={account ? barAccount : undefined}
				account={account ? sheetFooter : undefined}
			/>
		{/if}
		{@render topBar?.()}
		<main id="ds-main" tabindex="-1" class="main" data-padded={padded ? '' : undefined}>
			{@render children()}
		</main>
		{#if footer}<footer class="footer">{@render footer()}</footer>{/if}
	</div>
	{#if nav === 'rail'}
		<TabBar {items} {groups} {current} primary={primaryTabs} footer={account ? sheetFooter : undefined} />
	{/if}
	{#if toaster}<Toaster />{/if}
</div>

<style>
	.ds-appshell {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		min-height: 100dvh;
		background: var(--ds-bg-1);
	}
	.ds-appshell[data-nav='top'] {
		grid-template-columns: minmax(0, 1fr);
	}
	.rail {
		position: sticky;
		top: 0;
		height: 100dvh;
	}
	.column {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}
	.main {
		--ds-pad-top: 0px;
		--ds-pad-x: 0px;
		/* What the page keeps clear at its foot for the phone tab bar; a footer keeps it instead. */
		--main-foot: var(--ds-chrome-bottom);
		flex: 1;
		min-width: 0;
		padding-bottom: var(--main-foot);
	}
	[data-footer] > .main {
		--main-foot: 0px;
	}
	.main:focus {
		outline: none;
	}
	.main[data-padded] {
		--ds-pad-top: 20px;
		--ds-pad-x: 24px;
		padding: var(--ds-pad-top) var(--ds-pad-x) calc(var(--ds-pad-top) + var(--main-foot));
	}
	/* A work view takes the column: no padding at any width, and from the phone breakpoint up the
	   shell locks to the viewport so the WorkView fills what the Banner and TopBar leave. */
	.ds-appshell .main:has(:global(.ds-workview)) {
		--ds-pad-top: 0px;
		--ds-pad-x: 0px;
		padding: 0 0 var(--ds-chrome-bottom);
	}
	/* A FullBleed page (a map) takes the whole column at every width, with no padding and no
	   footer, and the shell locks to the viewport so it fills what the chrome leaves. */
	.ds-appshell:has(:global(.ds-fullbleed)) {
		grid-template-rows: minmax(0, 1fr);
		height: 100dvh;
		min-height: 0;
		overflow: hidden;
	}
	.ds-appshell:has(:global(.ds-fullbleed)) .column {
		min-height: 0;
	}
	.main:has(:global(.ds-fullbleed)) {
		--ds-pad-top: 0px;
		--ds-pad-x: 0px;
		display: flex;
		flex-direction: column;
		min-height: 0;
		padding: 0 0 var(--ds-chrome-bottom);
	}
	.ds-appshell:has(:global(.ds-fullbleed)) .footer {
		display: none;
	}
	.footer {
		flex: none;
		border-top: 1px solid var(--ds-border-subtle);
		background: var(--ds-bg-1);
		margin-bottom: var(--ds-chrome-bottom);
	}
	@media (min-width: 768px) {
		.ds-appshell:has(:global(.ds-workview)) {
			grid-template-rows: minmax(0, 1fr);
			height: 100dvh;
			min-height: 0;
			overflow: hidden;
		}
		.ds-appshell:has(:global(.ds-workview)) .column {
			min-height: 0;
		}
		.main:has(:global(.ds-workview)) {
			display: flex;
			flex-direction: column;
			min-height: 0;
		}
	}
	.skip {
		position: fixed;
		top: 8px;
		left: 8px;
		z-index: var(--ds-z-skip);
		padding: 6px 12px;
		border-radius: var(--ds-radius-sm);
		background: var(--ds-accent);
		color: var(--ds-accent-contrast);
		font-size: var(--ds-text-sm);
		font-weight: 500;
		text-decoration: none;
		transform: translateY(-200%);
	}
	.skip:focus-visible {
		transform: none;
	}
	@media (max-width: 767.98px) {
		/* The tab bar's height, for a rail shell only: a top-nav shell has nothing fixed below. */
		:global(:root:has(.ds-appshell[data-nav='rail'])) {
			--ds-chrome-bottom: calc(var(--ds-tabbar-h) + env(safe-area-inset-bottom, 0px));
		}
		.ds-appshell {
			grid-template-columns: minmax(0, 1fr);
		}
		.rail {
			display: none;
		}
		.main[data-padded] {
			--ds-pad-top: 16px;
			--ds-pad-x: 16px;
		}
	}
</style>
