<!--
@component
Stat — a headline number: a label, the value (24/500, tabular), an optional unit or "of N", and
one meta line that breaks the number down. ds-bg-2 with a subtle edge; no shadow, no icon.

- `label`, `value` (a number is localized; `null`, `undefined` or `''` shows the Missing mark,
  without the unit), `unit`, `of` (renders "of N"), `missing` (the mark), `meta` (text or a
  snippet — one line, never a sentence), `href` (the whole tile becomes a link), `severity` (a 3px
  leading stripe and a SeverityBadge in the meta line — the only way to color a Stat), `variant`
  (`default` | `headline`: the value at 28px and the one weight above 500, with the label under
  it — a public page's key figures).

Put several in a StatRow (`max={5}` for a row of five).
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import Missing from './Missing.svelte';
	import SeverityBadge from './SeverityBadge.svelte';
	import { severityVars, type Severity } from '../severity.js';

	interface Props {
		label: string;
		/** `null`, `undefined` or `''` shows the Missing mark. */
		value: number | string | null | undefined;
		unit?: string;
		of?: number | string;
		/** What a missing value shows. */
		missing?: string;
		meta?: string | Snippet;
		href?: string;
		severity?: Severity | null;
		/** `headline`: a bigger, heavier value with the label under it. */
		variant?: 'default' | 'headline';
		class?: string;
	}

	let {
		label,
		value,
		unit,
		of,
		missing = '—',
		meta,
		href,
		severity = null,
		variant = 'default',
		class: className = ''
	}: Props = $props();

	const fmt = (v: number | string) => (typeof v === 'number' ? v.toLocaleString() : v);
	const absent = $derived(value === null || value === undefined || value === '');
	const mark = $derived(severity ? severityVars(severity).mark : undefined);
</script>

<svelte:element
	this={href ? 'a' : 'div'}
	{href}
	class="ds-stat {className}"
	data-severity={severity ?? undefined}
	data-variant={variant}
	style:--mark={mark}
>
	<span class="label">{label}</span>
	<span class="figure">
		<span class="value"
			>{#if absent}<Missing mark={missing} />{:else}{fmt(value as number | string)}{/if}</span
		>
		{#if unit && !absent}<span class="unit">{unit}</span>{/if}
		{#if of !== undefined}<span class="unit">of {fmt(of)}</span>{/if}
	</span>
	{#if meta || severity}
		<span class="meta">
			{#if severity}<SeverityBadge {severity} size="sm" />{/if}
			{#if typeof meta === 'function'}{@render meta()}{:else if meta}<span class="text">{meta}</span>{/if}
		</span>
	{/if}
</svelte:element>

<style>
	.ds-stat {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
		padding: 12px 14px;
		border: 1px solid var(--ds-border-subtle);
		border-radius: var(--ds-radius-md);
		background: var(--ds-bg-2);
		color: var(--ds-text-1);
		text-decoration: none;
		transition: background-color var(--ds-dur-fast) var(--ds-ease-out);
	}
	.ds-stat[data-severity] {
		box-shadow: inset 3px 0 0 var(--mark);
		padding-left: 17px;
	}
	a.ds-stat:hover {
		background: var(--ds-bg-3);
	}
	.label {
		color: var(--ds-text-2);
		font-size: var(--ds-text-sm);
		line-height: var(--ds-lh-sm);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.figure {
		display: flex;
		align-items: baseline;
		gap: 6px;
		min-width: 0;
	}
	.value {
		font-size: var(--ds-text-2xl);
		line-height: var(--ds-lh-2xl);
		font-weight: 500;
		font-variant-numeric: tabular-nums;
	}
	.unit {
		color: var(--ds-text-3);
		font-size: var(--ds-text-sm);
		line-height: var(--ds-lh-sm);
		white-space: nowrap;
	}
	/* Headline: the figure first and heavier, the label under it. The label stays first in the
	   markup, so it is still read before the number. The weight is the headline-number role, the
	   one step above 500. */
	[data-variant='headline'] .figure {
		order: -1;
	}
	[data-variant='headline'] .value {
		font-size: 28px;
		line-height: 34px;
		font-weight: 650;
	}
	.meta {
		display: flex;
		align-items: center;
		gap: 6px;
		min-width: 0;
		margin-top: 2px;
		color: var(--ds-text-3);
		font-size: var(--ds-text-xs);
		line-height: var(--ds-lh-xs);
	}
	.text {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
