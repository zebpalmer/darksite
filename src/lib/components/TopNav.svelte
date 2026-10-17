<!--
@component
TopNav — primary navigation as a bar across the top, for a product with a few top-level sections:
`AppShell nav="top"` renders it. It reads the same navigation list as the rail. Items without a
group are links in the bar; each group is a disclosure menu ("Records ▾") of links, standing where
its first item stands in the list, so the bar keeps the list's order. On phones the
bar keeps the product and a menu button that opens a Sheet with every destination, grouped, and
the account block.

The menus follow the disclosure-navigation pattern: a button with `aria-expanded` that shows a list
of real links (so a link opens in a new tab like any other). An item's `description` is a second
line under its label. A group whose items carry a `section` lays its menu out in one column per
section, each under its heading, with the group's items that have no section in a row under them
("All guides"); the phone sheet shows the same headings, without the descriptions. Esc or a press
outside closes a menu and returns focus to its button. The current page is `aria-current="page"`, and its group's button
carries the accent mark. The bar sits on the chrome's bar roles (`ds-bar-*`), so a brand can color it.

- `items`, `groups`, `current` (the one navigation list), `product`, `mark`, `homeHref` (default
  `/`), `actions` snippet (the bar's right end: search, a sign-in), `accountInline` snippet (the
  account block in the bar on desktop), `account` snippet (the phone sheet's footer), `label` (default "Primary"), `sticky` (default true), `class`.
- Inside an AppShell with no `topBar`, on a page with no level-1 PageHeader, the bar also holds the
  shell's `headerActions` (a global search), ahead of its own actions. On a phone they collapse to
  an icon button beside the menu button that opens a full-width row under the bar.
- With `AppShell contentWidth`, the bar's contents keep to the same width as the page, so the
  product name, the titles and the content share edges.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import MenuIcon from '@lucide/svelte/icons/menu';

	import Button from './Button.svelte';
	import { focusShortcut } from '../hotkeys.js';
	import { getHeaderActions } from '../shell-context.js';
	import { ShellFold } from '../shell-fold.svelte.js';
	import Sheet from './Sheet.svelte';
	import SheetItem from './SheetItem.svelte';
	import {
		badgeSpoken,
		badgeText,
		groupItems,
		sectionItems,
		type NavGroup,
		type NavItem
	} from '../nav.js';
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

	// The shell's header actions, on a page with no level-1 PageHeader and no TopBar to hold them.
	const shell = getHeaderActions();
	const shellSnippet = $derived(
		shell?.snippet && shell.fallback && shell.host === 'nav' && !shell.claimed ? shell.snippet : undefined
	);
	const collapsed = $derived(!!shellSnippet && !!shell?.phone);
	let headerEl: HTMLElement | undefined = $state();
	const fold = new ShellFold(
		shell,
		() => collapsed,
		() => headerEl?.querySelector<HTMLElement>('.ds-topnav-toggle')
	);
	const rowOpen = $derived(collapsed && fold.open);
	const sections = $derived(groupItems(items, groups));
	const menus = $derived(sections.filter((s) => s.group));
	// The bar keeps the list's order: a loose item where it stands, a group's menu where its first
	// item stands ("Records ▾ · Guides ▾ · News · About ▾").
	type Entry = { kind: 'link'; item: NavItem } | { kind: 'menu'; section: (typeof menus)[number] };
	const entries = $derived.by(() => {
		const out: Entry[] = [];
		const placed = new Set<string>();
		for (const item of items) {
			const section = item.group ? menus.find((s) => s.group!.id === item.group) : undefined;
			if (!section) out.push({ kind: 'link', item });
			else if (!placed.has(section.group!.id)) {
				placed.add(section.group!.id);
				out.push({ kind: 'menu', section });
			}
		}
		return out;
	});
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

<!-- A menu link. With a description, its name stays the label (and the badge), and the
     description is read as its description, not as part of its name. -->
{#snippet menuItem(item: NavItem)}
	{@const descId = item.description ? `${uid}-desc-${item.id}` : undefined}
	<a
		href={item.href}
		class="item"
		data-described={item.description ? '' : undefined}
		aria-current={item.id === current ? 'page' : undefined}
		aria-label={item.description ? item.label + badgeSpoken(badgeText(item.badge)) : undefined}
		aria-describedby={descId}
		>{#if item.icon}<item.icon size={16} aria-hidden="true" />{/if}<span class="text"
			><span class="label">{item.label}</span>{#if item.description}<span id={descId} class="desc"
					>{item.description}</span
				>{/if}</span
		>{@render badgeOf(item)}</a
	>
{/snippet}

<header bind:this={headerEl} class="ds-topnav {className}" class:sticky>
	<div class="line">
	<a class="brand" href={homeHref}>
		{#if mark}<span class="mark">{@render mark()}</span>{/if}
		{#if product}<span class="product">{product}</span>{:else}<span class="ds-sr-only"
				>{strings.home}</span
			>{/if}
	</a>
	<nav class="nav" aria-label={label}>
		<ul class="list">
			{#each entries as entry (entry.kind === 'link' ? `l:${entry.item.id}` : `m:${entry.section.group!.id}`)}
				{#if entry.kind === 'link'}
					{@const item = entry.item}
					<li>
						<a href={item.href} class="link" aria-current={item.id === current ? 'page' : undefined}
							>{item.label}{@render badgeOf(item)}</a
						>
					</li>
				{:else}
				{@const section = entry.section}
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
				{/if}
			{/each}
		</ul>
	</nav>
	<span class="grow"></span>
	{#if shellSnippet && shell}
		<div class="fallback">
			{#if collapsed}
				<Button
					variant="icon"
					class="ds-topnav-toggle"
					icon={shell.icon}
					label={shell.label}
					aria-expanded={fold.open}
					aria-controls={fold.open ? `${uid}-shell` : undefined}
					onclick={fold.toggle}
				/>
			{:else}
				<span class="shell" {@attach focusShortcut(shell.key)}>{@render shellSnippet()}</span>
			{/if}
		</div>
	{/if}
	{#if actions}<div class="actions">{@render actions()}</div>{/if}
	{#if accountInline}<div class="account">{@render accountInline()}</div>{/if}
	<span class="menu-button">
		<Button variant="icon" icon={MenuIcon} label={strings.menu} aria-haspopup="dialog" onclick={() => (sheetOpen = true)} />
	</span>
	</div>
	{#if rowOpen && shellSnippet && shell}
		<div
			id="{uid}-shell"
			class="row"
			role="region"
			aria-label={shell.label}
			{@attach fold.escapeCloses}
			{@attach focusShortcut(shell.key)}
			{@attach fold.focusFirst}
		>
			{@render shellSnippet()}
		</div>
	{/if}
</header>

{#if openGroup}
	{@const menu = menus.find((s) => s.group!.id === openGroup)}
	{#if menu}
		{@const split = sectionItems(menu.items)}
		<div
			id="{uid}-{openGroup}"
			class="panel"
			data-layout={split.sections.length ? 'sections' : undefined}
			data-described={menu.items.some((i) => i.description) ? '' : undefined}
			style:--cols={split.sections.length ? Math.min(split.sections.length, 3) : undefined}
			popover={topLayer ? 'manual' : undefined}
			{@attach surface}
		>
			{#if split.sections.length}
				<div class="cols">
					{#each split.sections as col, c (col.title)}
						<div class="col">
							<p id="{uid}-{openGroup}-s{c}" class="heading">{col.title}</p>
							<ul aria-labelledby="{uid}-{openGroup}-s{c}">
								{#each col.items as item (item.id)}<li>{@render menuItem(item)}</li>{/each}
							</ul>
						</div>
					{/each}
				</div>
				{#if split.rest.length}
					<ul class="foot">
						{#each split.rest as item (item.id)}<li>{@render menuItem(item)}</li>{/each}
					</ul>
				{/if}
			{:else}
				<ul>
					{#each menu.items as item (item.id)}<li>{@render menuItem(item)}</li>{/each}
				</ul>
			{/if}
		</div>
	{/if}
{/if}

{#snippet sheetFooter()}{@render account?.()}{/snippet}

<Sheet bind:open={sheetOpen} title={strings.menu} footer={account ? sheetFooter : undefined}>
	{#each entries as entry (entry.kind === 'link' ? `l:${entry.item.id}` : `m:${entry.section.group!.id}`)}
		{#if entry.kind === 'link'}
			<SheetItem
				label={entry.item.label}
				icon={entry.item.icon}
				href={entry.item.href}
				current={entry.item.id === current}
			/>
		{:else}
			{@const split = sectionItems(entry.section.items)}
			<p class="sheet-group">{entry.section.group!.label}</p>
			{#if split.sections.length}
				{#each split.sections as col (col.title)}
					<p class="sheet-section">{col.title}</p>
					{#each col.items as item (item.id)}
						<SheetItem label={item.label} icon={item.icon} href={item.href} current={item.id === current} />
					{/each}
				{/each}
				{#if split.rest.length}
					<hr class="sheet-rule" />
					{#each split.rest as item (item.id)}
						<SheetItem label={item.label} icon={item.icon} href={item.href} current={item.id === current} />
					{/each}
				{/if}
			{:else}
				{#each entry.section.items as item (item.id)}
					<SheetItem label={item.label} icon={item.icon} href={item.href} current={item.id === current} />
				{/each}
			{/if}
		{/if}
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
		/* The side padding, widened to keep the contents to the shell's content width. */
		--nav-pad: max(16px, calc((100% - var(--ds-content-max, 100000px)) / 2));
		min-width: 0;
		border-bottom: 1px solid var(--ds-border-subtle);
		background: var(--ds-bg-2);
		color: var(--ds-text-1);
	}
	.line {
		display: flex;
		align-items: center;
		gap: 16px;
		min-width: 0;
		height: var(--ds-header-h);
		padding: 0 var(--nav-pad);
	}
	/* The phone row: the bar keeps its line, the row spans the full width under it. */
	.row {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px var(--nav-pad);
		border-top: 1px solid var(--ds-border-subtle);
	}
	.row > :global(:first-child) {
		flex: 1 1 auto;
		min-width: 0;
	}
	.fallback,
	.shell {
		display: flex;
		align-items: center;
		min-width: 0;
	}
	.fallback :global(.ds-topnav-toggle[aria-expanded='true']) {
		background: var(--ds-bg-4);
		color: var(--ds-text-1);
	}
	/* Server-rendered markup cannot know whether the page claims the shell's actions: a page with
	   a level-1 header hides them here until the client removes them. */
	:global(.ds-appshell:has(.ds-pageheader[data-shell-claim])) .fallback {
		display: none;
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
	/* Descriptions under the labels: a little more room for the second line. */
	.panel[data-described] {
		max-width: min(400px, calc(100vw - 16px));
	}
	/* One column per section, at most three across, as wide as the viewport allows. */
	.panel[data-layout='sections'] {
		width: min(calc(var(--cols) * 240px + 8px), calc(100vw - 16px));
		max-width: calc(100vw - 16px);
		padding: 8px 4px 4px;
	}
	.cols {
		display: grid;
		grid-template-columns: repeat(var(--cols), minmax(0, 1fr));
		gap: 8px 4px;
	}
	.col {
		min-width: 0;
	}
	.heading {
		margin: 0 8px 4px;
		color: var(--ds-text-3);
		font-size: 11px;
		font-weight: 500;
		letter-spacing: 0.06em;
		line-height: var(--ds-lh-xs);
		text-transform: uppercase;
	}
	/* The group's items without a section: a row under the columns, past a hairline. */
	.panel ul.foot {
		display: flex;
		flex-wrap: wrap;
		gap: 2px 4px;
		margin-top: 8px;
		padding-top: 4px;
		border-top: 1px solid var(--ds-border-subtle);
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
		display: flex;
		flex: 1;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}
	.item[data-described] {
		align-items: flex-start;
		padding-top: 6px;
		padding-bottom: 6px;
	}
	.item[data-described] :global(svg) {
		margin-top: 2px;
	}
	.desc {
		color: var(--ds-text-3);
		font-size: var(--ds-text-sm);
		line-height: var(--ds-lh-sm);
	}
	/* ds-text-3 holds its contrast up to ds-bg-3; the hover and current grounds take the next step. */
	.item:hover .desc {
		color: var(--ds-text-2);
	}
	.item[aria-current='page'] .desc {
		color: var(--ds-text-1);
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
	/* A section inside a group: a smaller sub-heading, set in under the group's title. */
	.sheet-section {
		margin: 8px 0 0;
		padding: 0 8px;
		color: var(--ds-text-3);
		font-size: var(--ds-text-xs);
		font-weight: 500;
		line-height: var(--ds-lh-xs);
	}
	.sheet-rule {
		margin: 8px 8px;
		border: 0;
		border-top: 1px solid var(--ds-border-subtle);
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
		/* Keep the inline form off a phone until the client swaps in the toggle. */
		.shell {
			display: none;
		}
	}
</style>
