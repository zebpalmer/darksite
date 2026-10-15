<!--
@component
AppShell — the application frame: a NavRail beside a content column holding an optional Banner,
an optional TopBar and the page; below 768px the rail gives way to a TabBar. It owns the one
Toaster and a "Skip to content" link.

It publishes the geometry pages rely on (docs/layout.md): the padded column's `--ds-pad-top` /
`--ds-pad-x` (PageHeader cancels them to sit flush), and `--ds-chrome-bottom`, the tab bar's
height on phones, so nothing is hidden under it. Content pages scroll the document; the rail stays
in place.

- `items`, `groups`, `current` — the one navigation list, used by the rail, the tab bar and its
  More sheet.
- `product` and `mark` (the brand at the top of the rail), `account` snippet (the rail's footer
  and the More sheet's footer; receives `{ compact }`), `version`, `rememberAs` (remember the
  rail's state for this viewer), `primaryTabs` (the tab bar's four cells).
- `railSearch`, `railStatus`, `railBadge`, `railPinned` — the NavRail's `search`, `status` and
  `badge` slots and `pinned`; `railExpanded` (bindable).
- `banner`, `topBar` snippets; `padded` (default true — false hands the column to a work view
  that lays out its own panes); `toaster` (default true); children (the page).

A page that renders a `WorkView` gets the work-view frame without touching `padded`: while one is
mounted the column's padding is zero, and from 768px the shell locks to the viewport so the work
view fills what the Banner and TopBar leave and the document does not scroll.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	import NavRail, { type RailSlotArgs } from './NavRail.svelte';
	import TabBar from './TabBar.svelte';
	import Toaster from './Toaster.svelte';
	import type { NavGroup, NavItem } from '../nav.js';

	interface Props {
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
</script>

{#snippet railFooter({ expanded }: { expanded: boolean })}
	{@render account?.({ compact: !expanded })}
{/snippet}

{#snippet sheetFooter()}
	{@render account?.({ compact: false })}
{/snippet}

<div class="ds-appshell {className}">
	<a class="skip" href="#ds-main">Skip to content</a>
	<div class="rail">
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
	</div>
	<div class="column">
		{@render banner?.()}
		{@render topBar?.()}
		<main id="ds-main" tabindex="-1" class="main" data-padded={padded ? '' : undefined}>
			{@render children()}
		</main>
	</div>
	<TabBar {items} {groups} {current} primary={primaryTabs} footer={account ? sheetFooter : undefined} />
	{#if toaster}<Toaster />{/if}
</div>

<style>
	.ds-appshell {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		min-height: 100dvh;
		background: var(--ds-bg-1);
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
		flex: 1;
		min-width: 0;
		padding-bottom: var(--ds-chrome-bottom);
	}
	.main:focus {
		outline: none;
	}
	.main[data-padded] {
		--ds-pad-top: 20px;
		--ds-pad-x: 24px;
		padding: var(--ds-pad-top) var(--ds-pad-x) calc(var(--ds-pad-top) + var(--ds-chrome-bottom));
	}
	/* A work view takes the column: no padding at any width, and from the phone breakpoint up the
	   shell locks to the viewport so the WorkView fills what the Banner and TopBar leave. */
	.ds-appshell .main:has(:global(.ds-workview)) {
		--ds-pad-top: 0px;
		--ds-pad-x: 0px;
		padding: 0 0 var(--ds-chrome-bottom);
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
		:global(:root) {
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
