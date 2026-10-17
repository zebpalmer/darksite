<!--
@component
TopBar — a strip above the content column for what belongs to every page of a section: search, a
global create action, a scope that outlives the page. 48px on ds-bg-2, or `variant="slim"` (40px
on ds-bg-1) where it only carries search. It sits outside the padded column, so PageHeader keeps
its flush geometry underneath, and publishes its height as `--ds-topbar-h`.

- `start` snippet (a scope selector, a row of filter chips), `search` snippet (usually an Input
  with a `/` key cap), `actions` snippet, `variant`, `sticky`, `label`, `searchKey` (default `/`:
  focuses the first field in `search`, unless the user is typing or the page already handled the
  key; `null` hands the key to the page). The key is the `focusShortcut` attachment, exported for
  other containers.
- `start` gives way when the bar is short of room: it shrinks and scrolls sideways, so a long row
  of chips never pushes the actions off the bar. The actions always sit at the end.
- Inside an AppShell, on a page with no level-1 PageHeader, the bar also shows the shell's
  `headerActions`, ahead of its own actions; on a phone they collapse to an icon button that opens
  a full-width row under the bar.

If a control is not relevant on every page of the section, it belongs in that page's PageHeader.
-->
<script lang="ts">
	import { strings } from '../strings.svelte.js';
	import type { Snippet } from 'svelte';

	import Button from './Button.svelte';
	import { focusShortcut } from '../hotkeys.js';
	import { getHeaderActions } from '../shell-context.js';
	import { ShellFold } from '../shell-fold.svelte.js';

	interface Props {
		start?: Snippet;
		search?: Snippet;
		actions?: Snippet;
		variant?: 'default' | 'slim';
		sticky?: boolean;
		label?: string;
		searchKey?: string | null;
		class?: string;
	}

	let {
		start,
		search,
		actions,
		variant = 'default',
		sticky = false,
		label = strings.toolbar,
		searchKey = '/',
		class: className = ''
	}: Props = $props();

	const uid = $props.id();
	let el: HTMLElement | undefined = $state();

	// The shell's header actions, on a page with no level-1 PageHeader to hold them.
	const shell = getHeaderActions();
	const shellSnippet = $derived(
		shell?.snippet && shell.fallback && shell.host === 'bar' && !shell.claimed ? shell.snippet : undefined
	);
	const collapsed = $derived(!!shellSnippet && !!shell?.phone);
	const fold = new ShellFold(
		shell,
		() => collapsed,
		() => el?.querySelector<HTMLElement>('.ds-topbar-toggle')
	);
	const rowOpen = $derived(collapsed && fold.open);

	$effect(() => {
		if (!el) return;
		const root = document.documentElement;
		const publish = () => root.style.setProperty('--ds-topbar-h', `${el!.offsetHeight}px`);
		publish();
		const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(publish) : null;
		ro?.observe(el);
		return () => {
			ro?.disconnect();
			root.style.removeProperty('--ds-topbar-h');
		};
	});
</script>

<div bind:this={el} class="ds-topbar {className}" data-variant={variant} class:sticky role="region" aria-label={label}>
	<div class="line">
		{#if start}<div class="start">{@render start()}</div>{/if}
		{#if search}<div class="search" {@attach focusShortcut(searchKey)}>{@render search()}</div>{/if}
		<span class="grow"></span>
		{#if shellSnippet || actions}
			<div class="actions">
				{#if shellSnippet && shell}
					<span class="fallback">
						{#if collapsed}
							<Button
								variant="icon"
								class="ds-topbar-toggle"
								icon={shell.icon}
								label={shell.label}
								aria-expanded={fold.open}
								aria-controls={fold.open ? `${uid}-shell` : undefined}
								onclick={fold.toggle}
							/>
						{:else}
							<span class="shell" {@attach focusShortcut(shell.key)}>{@render shellSnippet()}</span>
						{/if}
					</span>
				{/if}
				{@render actions?.()}
			</div>
		{/if}
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
</div>

<style>
	.ds-topbar {
		/* The bar reads the chrome roles, so a brand can color it: everything inside — buttons,
		   fields, tooltips — follows. By default they are the page's own roles. */
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
		--bar-pad: 16px;
		/* The side padding, widened to keep the contents to the shell's content width. */
		--bar-inset: max(var(--bar-pad), calc((100% - var(--ds-content-max, 100000px)) / 2));
		flex: none;
		border-bottom: 1px solid var(--ds-border-subtle);
		background: var(--ds-bg-2);
	}
	.line {
		display: flex;
		align-items: center;
		gap: 10px;
		min-height: 48px;
		padding: 0 var(--bar-inset);
	}
	.ds-topbar[data-variant='slim'] {
		background: var(--ds-bg-1);
	}
	[data-variant='slim'] .line {
		min-height: 40px;
	}
	/* Under a sticky TopNav, it sticks below it. */
	.sticky {
		position: sticky;
		top: var(--ds-chrome-top, 0px);
		z-index: var(--ds-z-topbar);
	}
	/* The scope cell gives way first: it shrinks and scrolls sideways (a row of chips), with room
	   around its contents for their focus rings. What is inside keeps its size. */
	.start {
		display: flex;
		align-items: center;
		gap: 8px;
		flex: 0 1 auto;
		min-width: 0;
		margin: 0 -4px;
		padding: 4px;
		overflow-x: auto;
		scrollbar-width: thin;
	}
	.start > :global(*) {
		flex-shrink: 0;
	}
	.actions,
	.fallback,
	.shell {
		display: flex;
		align-items: center;
		gap: 8px;
		flex: none;
	}
	/* The end of the bar, with or without the spacer. */
	.actions {
		margin-inline-start: auto;
	}
	.search {
		flex: 1;
		min-width: min(160px, 50%);
		max-width: 360px;
	}
	.grow {
		flex: 1;
	}
	.actions :global(.ds-topbar-toggle[aria-expanded='true']) {
		background: var(--ds-bg-4);
		color: var(--ds-text-1);
	}
	/* The phone row: the bar keeps its line, the row spans the full width under it. */
	.row {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px var(--bar-inset);
		border-top: 1px solid var(--ds-border-subtle);
	}
	.row > :global(:first-child) {
		flex: 1 1 auto;
		min-width: 0;
	}
	/* Server-rendered markup cannot know whether the page claims the shell's actions: a page with
	   a level-1 header hides them here until the client removes them. */
	:global(.ds-appshell:has(.ds-pageheader[data-shell-claim])) .fallback {
		display: none;
	}
	@media (max-width: 767.98px) {
		.ds-topbar {
			--bar-pad: 12px;
		}
		.search {
			max-width: none;
		}
		.grow {
			display: none;
		}
		/* Keep the inline form off a phone until the client swaps in the toggle. */
		.shell {
			display: none;
		}
	}
</style>
