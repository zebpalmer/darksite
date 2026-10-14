<!--
@component
Stat — a headline number: a label, the value (24/500, tabular), an optional unit or "of N", and
one meta line that breaks the number down. ds-bg-2 with a subtle edge; no shadow, no icon.

- `label`, `value` (a number is localized), `unit`, `of` (renders "of N"), `meta` (text or a
  snippet — one line, never a sentence), `href` (the whole tile becomes a link), `severity` (a 3px
  leading stripe and a SeverityBadge in the meta line — the only way to color a Stat).

Put several in a StatRow.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import SeverityBadge from './SeverityBadge.svelte';
	import { severityVars, type Severity } from '../severity.js';

	interface Props {
		label: string;
		value: number | string;
		unit?: string;
		of?: number | string;
		meta?: string | Snippet;
		href?: string;
		severity?: Severity | null;
		class?: string;
	}

	let { label, value, unit, of, meta, href, severity = null, class: className = '' }: Props = $props();

	const fmt = (v: number | string) => (typeof v === 'number' ? v.toLocaleString() : v);
	const mark = $derived(severity ? severityVars(severity).mark : undefined);
</script>

<svelte:element
	this={href ? 'a' : 'div'}
	{href}
	class="ds-stat {className}"
	data-severity={severity ?? undefined}
	style:--mark={mark}
>
	<span class="label">{label}</span>
	<span class="figure">
		<span class="value">{fmt(value)}</span>
		{#if unit}<span class="unit">{unit}</span>{/if}
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
