<!--
@component
PageHeader — the top of a page: 56px, the title (20/500), a count, optional content after the
title (usually Tabs), and right-aligned actions. A ds-border-subtle bottom edge on ds-bg-1. No
breadcrumbs, no hero.

Always flush: it cancels the shell's padded column (`--ds-pad-top` / `--ds-pad-x`) with negative
margins, so every page gets the same bar, the same full-width edge and the same 20px title inset.
Put it first on the page. The title keeps its width; the count gives way on a narrow header.

When the title and the actions do not fit on one line, the header makes room in steps, at any
width: first the shell's header actions collapse to their icon button, then the `actions` snippet
is told `{ compact: true }` (render icon buttons there). Under 560px of header, if that is still
not enough, the actions move to a second line, right-aligned, so the title is not cut short.
Content after the title (chips, a status) wraps onto a further line under the title when the lead
has no room for it; the title keeps its one line.

- `title`, `count` (a number is localized; or text such as "38 this week"), `level` (default 1),
  `mono` (the title is an identifier — a serial, a hash, a path — set in mono with tabular
  figures), `actions` snippet (receives `{ compact }`), `sticky`, children (inline after the
  title), `class`.
- `shellActions` (default true): inside an AppShell with `headerActions`, a level-1 header renders
  them ahead of its own `actions`, so the page's primary button stays right-most. Collapsed (on
  phones, or when the header lacks room) they are an icon button that opens a full-width row
  under the header (the shell's key opens it too). `false` leaves them out on this page. A
  level-1 header claims them either way, so the shell does not also show them in a TopBar.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	import Button from './Button.svelte';
	import { focusShortcut } from '../hotkeys.js';
	import { getHeaderActions } from '../shell-context.js';
	import { ShellFold } from '../shell-fold.svelte.js';

	interface Props {
		title: string;
		count?: number | string | null;
		level?: 1 | 2;
		/** The title is an identifier: mono, tabular figures. */
		mono?: boolean;
		/** The page's actions. `compact` is true when the header lacks room for their full form. */
		actions?: Snippet<[{ compact: boolean }]>;
		sticky?: boolean;
		shellActions?: boolean;
		class?: string;
		children?: Snippet;
	}

	let {
		title,
		count = null,
		level = 1,
		mono = false,
		actions,
		sticky = false,
		shellActions: showShell = true,
		class: className = '',
		children
	}: Props = $props();

	const countText = $derived(typeof count === 'number' ? count.toLocaleString() : count);

	const uid = $props.id();
	const shell = getHeaderActions();
	const shellSnippet = $derived(showShell && level === 1 ? shell?.snippet : undefined);
	const claims = $derived(level === 1 && !!shell);

	// What the header has given up for room: 0 nothing, 1 the shell's actions are collapsed,
	// 2 the page's actions are compact as well.
	let stage = $state(0);
	const collapsed = $derived(!!shellSnippet && (!!shell?.phone || stage >= 1));
	const compact = $derived(stage >= 2);

	let el: HTMLElement | undefined = $state();
	let leadEl: HTMLElement | undefined = $state();
	let actionsEl: HTMLElement | undefined = $state();
	const fold = new ShellFold(
		shell,
		() => collapsed,
		() => el?.querySelector<HTMLElement>('.ds-pageheader-toggle')
	);
	const rowOpen = $derived(collapsed && fold.open);

	// A level-1 header holds the shell's actions (or opts out of them), so no TopBar shows them.
	$effect(() => {
		if (claims) return shell!.claim();
	});

	// The actions' width last seen at each stage. A stage not seen yet is tried, then measured.
	const seen: (number | undefined)[] = [];

	function measure() {
		if (!el || !leadEl || !actionsEl) return;
		seen[stage] = actionsEl.offsetWidth;
		const style = getComputedStyle(el);
		const room = el.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
		const gap = parseFloat(style.columnGap) || 0;
		const parts = [...leadEl.children] as HTMLElement[];
		const lead =
			parts.reduce((sum, part) => sum + Math.max(part.scrollWidth, part.offsetWidth), 0) +
			gap * Math.max(0, parts.length - 1);
		// A phone always collapses the shell's actions; without them there is no stage 1.
		const stages = !shellSnippet ? [0, 2] : shell?.phone ? [1, 2] : [0, 1, 2];
		const fits = (s: number) => seen[s] === undefined || lead + gap + seen[s]! + 1 <= room;
		const next = stages.find(fits) ?? stages[stages.length - 1];
		if (next !== stage) stage = next;
	}

	$effect(() => {
		void title;
		void countText;
		void shellSnippet;
		void shell?.phone;
		if (!el || !leadEl || !actionsEl || typeof ResizeObserver === 'undefined') return;
		// Measured in the next frame: a stage change resizes what is observed, which inside the
		// observer's own callback would be a resize loop.
		let frame = 0;
		const ro = new ResizeObserver(() => {
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(measure);
		});
		for (const target of [el, actionsEl, ...leadEl.children]) ro.observe(target);
		return () => {
			cancelAnimationFrame(frame);
			ro.disconnect();
		};
	});
</script>

<header
	bind:this={el}
	class="ds-pageheader {className}"
	class:sticky
	class:wrap={rowOpen}
	data-shell-claim={claims ? '' : undefined}
>
	<div class="lead" bind:this={leadEl} data-after={children ? '' : undefined}>
		<svelte:element this={`h${level}`} class="title" data-mono={mono ? '' : undefined}
			>{title}</svelte:element
		>
		{#if countText !== null && countText !== undefined}<span class="count">{countText}</span>{/if}
		{@render children?.()}
	</div>
	{#if shellSnippet || actions}
		<div class="actions" bind:this={actionsEl}>
			{#if shellSnippet && shell}
				{#if collapsed}
					<Button
						variant="icon"
						class="ds-pageheader-toggle"
						icon={shell.icon}
						label={shell.label}
						aria-expanded={fold.open}
						aria-controls={fold.open ? `${uid}-shell` : undefined}
						onclick={fold.toggle}
					/>
				{:else}
					<div class="shell" {@attach focusShortcut(shell.key)}>{@render shellSnippet()}</div>
				{/if}
			{/if}
			{@render actions?.({ compact })}
		</div>
	{/if}
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

<style>
	.ds-pageheader {
		container-type: inline-size;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		column-gap: 12px;
		row-gap: 0;
		min-height: var(--ds-header-h);
		margin: calc(-1 * var(--ds-pad-top, 0px)) calc(-1 * var(--ds-pad-x, 0px)) var(--ds-pad-top, 0px);
		padding: 0 16px;
		border-bottom: 1px solid var(--ds-border-subtle);
		background: var(--ds-bg-1);
	}
	@media (min-width: 768px) {
		.ds-pageheader {
			padding: 0 24px 0 20px;
		}
	}
	/* Server-rendered markup cannot know the layout: keep the inline shell actions off a phone
	   until the client swaps in the toggle. */
	@media (max-width: 767.98px) {
		.shell {
			display: none;
		}
	}
	.sticky {
		position: sticky;
		top: var(--ds-topbar-sticky, var(--ds-chrome-top, 0px));
		z-index: var(--ds-z-sticky);
	}
	.lead {
		display: flex;
		align-items: center;
		align-self: stretch;
		gap: 12px;
		flex: 1;
		min-width: 0;
	}
	/* Content after the title wraps under it rather than widening the header. The padding spaces a
	   second line from the edges; on one line the title sits where it would without it, and a 44px
	   touch tab strip still fits the 56px bar. */
	.lead[data-after] {
		flex-wrap: wrap;
		align-content: center;
		row-gap: 8px;
		padding-block: 6px;
	}
	.title {
		flex: none;
		max-width: 100%;
		margin: 0;
		overflow: hidden;
		color: var(--ds-text-heading);
		font-size: var(--ds-text-xl);
		line-height: var(--ds-lh-xl);
		font-weight: 500;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.title[data-mono] {
		font-family: var(--font-mono);
		font-variant-numeric: tabular-nums;
		letter-spacing: 0;
	}
	.count {
		flex: 0 1 auto;
		min-width: 0;
		overflow: hidden;
		color: var(--ds-text-3);
		font-size: var(--ds-text-sm);
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.actions,
	.shell,
	.row {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.actions {
		flex: none;
		margin-inline-start: auto;
	}
	/* A narrow header: the lead asks for its full width, so when the title and count do not fit
	   beside the actions, the actions wrap to a second line instead of cutting the title short.
	   The symmetric padding keeps them centered on one line and spaces them on two. */
	@container (max-width: 559.98px) {
		.lead {
			flex: 1 1 auto;
			min-height: var(--ds-header-h);
		}
		/* The count asks for no width of its own, so it never wraps the actions: it takes what the
		   line leaves, up to its own width, and gives way first. */
		.count {
			flex: 1 1 0;
			width: 0;
			max-width: max-content;
		}
		.actions {
			padding-block: 6px;
		}
	}
	.actions :global(.ds-pageheader-toggle[aria-expanded='true']) {
		background: var(--ds-bg-4);
		color: var(--ds-text-1);
	}
	/* The phone row: the bar keeps its height, the row spans the full width on its own line. */
	.wrap > .lead {
		min-height: var(--ds-header-h);
	}
	.row {
		flex: 0 0 calc(100% + 32px);
		min-width: 0;
		margin: 0 -16px;
		padding: 8px 16px;
		border-top: 1px solid var(--ds-border-subtle);
	}
	.row > :global(:first-child) {
		flex: 1 1 auto;
		min-width: 0;
	}
</style>
