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
- `proseAlign` — where a document page's `ds-prose` or `ds-reading` article sits in a column wider
  than its measure: `center` (the default with `nav="top"`, where the column spans the screen) or
  `start` (the default with the rail).
- `headerActions` snippet — shell-wide controls (usually a global search) on the same line as every
  page's PageHeader, right-aligned, ahead of the page's own actions. `headerActionsKey` (default
  `/`) focuses its first field; `null` turns that off. On phones, or when the header lacks room,
  it collapses to an icon button (`headerActionsIcon`, default a search icon;
  `headerActionsLabel`, default "Search") that opens a full-width row under the header (the key
  opens it too); Esc inside the row, or a change of `current`, closes it.
- A page with no level-1 PageHeader (a map, a custom work view) shows them in the TopBar
  instead, ahead of its actions — or, with no `topBar`, in the TopNav (`nav="top"`) or a slim bar
  the shell adds (the rail). On a phone they collapse there the same way.
  `headerActionsFallback={false}` turns that off.
- `contentWidth` — caps the page's content at a width and centers it, with the TopNav, TopBar and
  footer contents kept to the same width, so the product name, titles and content share edges:
  `true` for 1060px, or a number of pixels or a CSS length. Unset, the content spans the column.
  A FullBleed or WorkView page still takes the whole column; a page that renders an element with
  the `ds-wide` class (a wide table) uses `--ds-content-wide` instead (default: no cap).

A page that renders a `FullBleed` (a map, a canvas) gets the whole column at every width: no
padding, no footer, the shell locked to the viewport.

A page that renders a `WorkView` gets the work-view frame without touching `padded`: while one is
mounted the column's padding is zero, and from 768px the shell locks to the viewport so the work
view fills what the Banner and TopBar leave and the document does not scroll.
-->
<script lang="ts">
	import { strings } from '../strings.svelte.js';
	import { untrack, type Snippet } from 'svelte';
	import Search from '@lucide/svelte/icons/search';

	import NavRail, { type RailSlotArgs } from './NavRail.svelte';
	import TabBar from './TabBar.svelte';
	import TopNav from './TopNav.svelte';
	import Toaster from './Toaster.svelte';
	import TopBar from './TopBar.svelte';
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
		/** Where a page with no level-1 PageHeader shows `headerActions`: in the TopBar (default
		 *  true), or nowhere (false). */
		headerActionsFallback?: boolean;
		padded?: boolean;
		/** Cap the page content at this width, centered: `true` for 1060px, a number of pixels, or
		 *  a CSS length. */
		contentWidth?: boolean | number | string;
		/** Where a document page's prose sits in the column. Default `center` with `nav="top"`,
		 *  `start` with the rail. */
		proseAlign?: 'start' | 'center';
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
		headerActionsFallback = true,
		padded = true,
		proseAlign,
		contentWidth,
		toaster = true,
		railExpanded = $bindable(),
		railSearch,
		railStatus,
		railBadge,
		railPinned = false,
		class: className = '',
		children
	}: Props = $props();

	const prose = $derived(proseAlign ?? (nav === 'top' ? 'center' : 'start'));
	const contentCap = $derived(
		contentWidth === true
			? '1060px'
			: typeof contentWidth === 'number'
				? `${contentWidth}px`
				: contentWidth || undefined
	);

	// Level-1 PageHeaders on the page; with none, the TopBar hosts the header actions.
	let claims = $state(0);
	// With a top nav and no TopBar, the TopNav holds them instead of an added bar.
	const fallbackHost = $derived<'nav' | 'bar'>(nav === 'top' && !topBar ? 'nav' : 'bar');
	const fallbackBar = $derived(
		!topBar && fallbackHost === 'bar' && !!headerActions && headerActionsFallback && claims === 0
	);

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
		},
		get fallback() {
			return headerActionsFallback;
		},
		get host() {
			return fallbackHost;
		},
		get claimed() {
			return claims > 0;
		},
		// Called from a header's effect: the count is written, never read there.
		claim() {
			untrack(() => (claims += 1));
			let held = true;
			return () => {
				if (held) untrack(() => (claims -= 1));
				held = false;
			};
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

<div
	class="ds-appshell {className}"
	data-nav={nav}
	data-prose={prose}
	style:--ds-content-cap={contentCap}
>
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
		{#if topBar}
			{@render topBar()}
		{:else if fallbackBar}
			<TopBar variant="slim" class="ds-appshell-fallback" />
		{/if}
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
		/* The content cap (contentWidth); a page with a ds-wide element uses the wide cap. Unset,
		   either is so large that nothing is capped. */
		--ds-content-max: var(--ds-content-cap, 100000px);
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
	.ds-appshell:has(:global(.ds-wide)) {
		--ds-content-max: var(--ds-content-wide, 100000px);
	}
	.main[data-padded] {
		--ds-pad-top: 20px;
		--ds-pad-x: 24px;
		/* The gutter, or wider: what centers the content at the content cap. */
		padding: var(--ds-pad-top) max(var(--ds-pad-x), calc((100% - var(--ds-content-max)) / 2))
			calc(var(--ds-pad-top) + var(--main-foot));
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
	/* A document page's article, centered in a column wider than its measure. */
	[data-prose='center'] .main > :global(:is(.ds-prose, .ds-reading)) {
		margin-inline: auto;
	}
	.ds-appshell:has(:global(.ds-fullbleed)) .footer {
		display: none;
	}
	/* Server-rendered markup cannot know whether the page claims the header actions: a page with a
	   level-1 header hides the shell's fallback bar until the client removes it. */
	.ds-appshell:has(:global(.ds-pageheader[data-shell-claim])) :global(.ds-appshell-fallback) {
		display: none;
	}
	/* The footer's contents keep to the content width plus a 24px gutter each side, which is
	   where a footer's own padding puts its text. */
	.footer {
		padding-inline: max(0px, calc((100% - var(--ds-content-max)) / 2 - 24px));
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
