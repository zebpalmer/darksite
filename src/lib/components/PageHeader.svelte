<!--
@component
PageHeader — the top of a page: 56px, the title (20/500), a count, optional content after the
title (usually Tabs), and right-aligned actions. A ds-border-subtle bottom edge on ds-bg-1. No
breadcrumbs, no hero.

Always flush: it cancels the shell's padded column (`--ds-pad-top` / `--ds-pad-x`) with negative
margins, so every page gets the same bar, the same full-width edge and the same 20px title inset.
Put it first on the page. The title keeps its width; the count gives way on a narrow header.

- `title`, `count` (a number is localized; or text such as "38 this week"), `level` (default 1),
  `actions` snippet, `sticky`, children (inline after the title), `class`.
- `shellActions` (default true): inside an AppShell with `headerActions`, a level-1 header renders
  them ahead of its own `actions`, so the page's primary button stays right-most. On phones they
  collapse to an icon button that opens a full-width row under the header. `false` leaves them out
  on this page.
-->
<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import type { Attachment } from 'svelte/attachments';

	import Button from './Button.svelte';
	import { focusShortcut } from '../hotkeys.js';
	import { getHeaderActions } from '../shell-context.js';

	interface Props {
		title: string;
		count?: number | string | null;
		level?: 1 | 2;
		actions?: Snippet;
		sticky?: boolean;
		shellActions?: boolean;
		class?: string;
		children?: Snippet;
	}

	let {
		title,
		count = null,
		level = 1,
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
	const collapsed = $derived(!!shellSnippet && !!shell?.phone);

	let el: HTMLElement | undefined = $state();
	let open = $state(false);
	const rowOpen = $derived(collapsed && open);

	// A navigation (the shell's `current` changes) or leaving the phone layout closes the row.
	$effect(() => {
		void shell?.current;
		void collapsed;
		untrack(() => (open = false));
	});

	function toggle() {
		open = !open;
	}

	function close() {
		open = false;
		el?.querySelector<HTMLElement>('.ds-pageheader-toggle')?.focus();
	}

	// Esc inside the row closes it, unless something inside (an open list) already took the key.
	const escapeCloses: Attachment<HTMLElement> = (row) => {
		const onkeydown = (event: KeyboardEvent) => {
			if (event.key !== 'Escape' || event.defaultPrevented) return;
			event.preventDefault();
			close();
		};
		row.addEventListener('keydown', onkeydown);
		return () => row.removeEventListener('keydown', onkeydown);
	};

	// Opening the row moves focus into it: the first field, or else the first control.
	const focusFirst: Attachment<HTMLElement> = (row) => {
		const target =
			row.querySelector<HTMLElement>('input, select, textarea, [contenteditable="true"]') ??
			row.querySelector<HTMLElement>('button, a[href], [tabindex]:not([tabindex="-1"])');
		target?.focus();
	};
</script>

<header bind:this={el} class="ds-pageheader {className}" class:sticky class:wrap={rowOpen}>
	<div class="lead">
		<svelte:element this={`h${level}`} class="title">{title}</svelte:element>
		{#if countText !== null && countText !== undefined}<span class="count">{countText}</span>{/if}
		{@render children?.()}
	</div>
	{#if shellSnippet || actions}
		<div class="actions">
			{#if shellSnippet && shell}
				{#if collapsed}
					<Button
						variant="icon"
						class="ds-pageheader-toggle"
						icon={shell.icon}
						label={shell.label}
						aria-expanded={open}
						aria-controls={open ? `${uid}-shell` : undefined}
						onclick={toggle}
					/>
				{:else}
					<div class="shell" {@attach focusShortcut(shell.key)}>{@render shellSnippet()}</div>
				{/if}
			{/if}
			{@render actions?.()}
		</div>
	{/if}
	{#if rowOpen && shellSnippet && shell}
		<div
			id="{uid}-shell"
			class="row"
			role="region"
			aria-label={shell.label}
			{@attach escapeCloses}
			{@attach focusShortcut(shell.key)}
			{@attach focusFirst}
		>
			{@render shellSnippet()}
		</div>
	{/if}
</header>

<style>
	.ds-pageheader {
		display: flex;
		align-items: center;
		gap: 12px;
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
		top: var(--ds-topbar-sticky, 0px);
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
	.title {
		flex: none;
		max-width: 100%;
		margin: 0;
		overflow: hidden;
		color: var(--ds-text-1);
		font-size: var(--ds-text-xl);
		line-height: var(--ds-lh-xl);
		font-weight: 500;
		text-overflow: ellipsis;
		white-space: nowrap;
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
	}
	.actions :global(.ds-pageheader-toggle[aria-expanded='true']) {
		background: var(--ds-bg-4);
		color: var(--ds-text-1);
	}
	/* The phone row: the header wraps, the bar keeps its height, the row spans the full width. */
	.wrap {
		flex-wrap: wrap;
		row-gap: 0;
	}
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
