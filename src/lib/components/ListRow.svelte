<!--
@component
ListRow — one record as a dense row that is neither a table row nor a card: a leading picture,
a title, a meta line and trailing controls. 40px by default, 32px `dense`, 44px on touch; with
`meta` below the title (`lines={2}`) it is 48px (40 dense). Put rows in a `<ul>`; each row is an
`<li>`.

- `title`, `meta` (one line; truncates with a title), `lines` (1: meta after the title; 2: meta
  under it), `leading` / `trailing` snippets (trailing sits outside the link or button, so it may
  hold its own controls), `href` (a link) or `onclick` (a button) or neither (static), `current`
  (the row the detail pane shows: `aria-current`), `selected` (part of a multi-selection — the
  leading Checkbox carries the state; this is the look), `dense`, `disabled`, `as` (`li` default,
  or `div`), `class`.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		meta?: string;
		lines?: 1 | 2;
		leading?: Snippet;
		trailing?: Snippet;
		href?: string;
		onclick?: (event: MouseEvent) => void;
		current?: boolean;
		selected?: boolean;
		dense?: boolean;
		disabled?: boolean;
		as?: 'li' | 'div';
		class?: string;
	}

	let {
		title,
		meta,
		lines = 1,
		leading,
		trailing,
		href,
		onclick,
		current = false,
		selected = false,
		dense = false,
		disabled = false,
		as = 'li',
		class: className = ''
	}: Props = $props();

	const tag = $derived(href && !disabled ? 'a' : onclick ? 'button' : 'div');
	const ariaCurrent = $derived(current ? (href ? 'page' : 'true') : undefined);
</script>

{#snippet content()}
	{#if leading}<span class="lead">{@render leading()}</span>{/if}
	<span class="text">
		<span class="title" {title}>{title}</span>
		{#if meta}<span class="meta" title={meta}>{meta}</span>{/if}
	</span>
{/snippet}

<svelte:element
	this={as}
	class="ds-listrow {className}"
	data-dense={dense ? '' : undefined}
	data-lines={meta && lines === 2 ? '2' : '1'}
	data-current={current ? '' : undefined}
	data-selected={selected ? '' : undefined}
	data-disabled={disabled ? '' : undefined}
>
	{#if tag === 'a'}
		<a class="main" {href} aria-current={ariaCurrent}>{@render content()}</a>
	{:else if tag === 'button'}
		<button class="main" type="button" {disabled} aria-current={ariaCurrent} {onclick}
			>{@render content()}</button
		>
	{:else}
		<div class="main" aria-current={ariaCurrent} aria-disabled={disabled ? 'true' : undefined}>
			{@render content()}
		</div>
	{/if}
	{#if trailing}<span class="trail">{@render trailing()}</span>{/if}
</svelte:element>

<style>
	.ds-listrow {
		--h: 40px;
		display: flex;
		align-items: center;
		min-width: 0;
		min-height: var(--h);
		border-radius: var(--ds-radius-sm);
		list-style: none;
		transition: background-color var(--ds-dur-fast) var(--ds-ease-out);
	}
	.ds-listrow[data-dense] {
		--h: 32px;
	}
	.ds-listrow[data-lines='2'] {
		--h: 48px;
	}
	.ds-listrow[data-lines='2'][data-dense] {
		--h: 40px;
	}
	/* Touch: 44px whatever the density. The two-line rows are already taller. */
	@media (pointer: coarse) {
		.ds-listrow,
		.ds-listrow[data-dense] {
			--h: var(--ds-h-touch);
		}
		.ds-listrow[data-lines='2'],
		.ds-listrow[data-lines='2'][data-dense] {
			--h: 52px;
		}
	}
	.ds-listrow:has(> a.main, > button.main):hover {
		background: var(--ds-bg-2);
	}
	.ds-listrow[data-selected] {
		background: var(--ds-accent-tint);
	}
	.ds-listrow[data-selected]:has(> a.main, > button.main):hover {
		background: var(--ds-accent-tint-hover);
	}
	.ds-listrow[data-current] {
		position: relative;
		background: var(--ds-bg-4);
	}
	.ds-listrow[data-current]::before {
		content: '';
		position: absolute;
		left: 0;
		top: 6px;
		bottom: 6px;
		width: 2px;
		border-radius: 2px;
		background: var(--ds-accent);
	}
	.ds-listrow[data-disabled] {
		opacity: 0.45;
	}
	.main {
		display: flex;
		flex: 1;
		align-items: center;
		gap: 10px;
		min-width: 0;
		min-height: var(--h);
		margin: 0;
		padding: 0 10px;
		border: 0;
		border-radius: inherit;
		background: none;
		color: inherit;
		font: inherit;
		text-align: start;
		text-decoration: none;
	}
	[data-dense] .main {
		gap: 8px;
		padding: 0 8px;
	}
	button.main {
		cursor: pointer;
	}
	button.main:disabled {
		cursor: not-allowed;
	}
	.main:focus-visible {
		outline-offset: -2px;
	}
	.lead {
		display: inline-flex;
		flex: none;
		align-items: center;
		color: var(--ds-text-3);
	}
	.text {
		display: flex;
		flex: 1;
		align-items: baseline;
		gap: 8px;
		min-width: 0;
	}
	[data-lines='2'] .text {
		flex-direction: column;
		align-items: stretch;
		gap: 0;
	}
	.title,
	.meta {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.title {
		flex: 0 1 auto;
		color: var(--ds-text-1);
		font-size: var(--ds-text-md);
		line-height: var(--ds-lh-md);
	}
	[data-dense] .title {
		font-size: var(--ds-text-sm);
		line-height: var(--ds-lh-sm);
	}
	.meta {
		flex: 1 1 0;
		color: var(--ds-text-3);
		font-size: var(--ds-text-sm);
		line-height: var(--ds-lh-sm);
	}
	[data-lines='2'] .meta {
		font-size: var(--ds-text-xs);
		line-height: var(--ds-lh-xs);
	}
	[data-selected] .meta,
	[data-current] .meta {
		color: var(--ds-text-2);
	}
	.trail {
		display: inline-flex;
		flex: none;
		align-items: center;
		gap: 6px;
		padding-right: 8px;
		color: var(--ds-text-3);
		font-size: var(--ds-text-sm);
		font-variant-numeric: tabular-nums;
	}
	[data-current] .trail {
		color: var(--ds-text-2);
	}
</style>
