<!--
@component
CodeCallout — a short code shown large, to be written down, read aloud or typed on another device:
the code just issued for a part's label, a pairing code, a pickup number. The code in mono at 48px
(36px in a narrow container), the instruction above it as a label, one meta line under it.

It is the one place darksite sets text above 32px outside an article title: a code copied by hand
at arm's length, in poor light, needs the size. The weight stays 500.

Screen readers hear the code one character at a time ("R 4 1 2"), so it is never read as a word
or a number.

- `code`, `label` (the instruction: "Write on the label"), `meta` (one line: "Issued 09:12"),
  `copy` (an inline CopyButton beside the code), `copyLabel` (default "Copy code"), `accent` (a 3px
  accent stripe: the code that was just issued), `class`.
-->
<script lang="ts">
	import { strings } from '../strings.svelte.js';
	import CopyButton from './CopyButton.svelte';

	interface Props {
		code: string;
		label?: string;
		meta?: string;
		copy?: boolean;
		copyLabel?: string;
		accent?: boolean;
		class?: string;
	}

	let { code, label, meta, copy = false, copyLabel, accent = false, class: className = '' }: Props = $props();

	const uid = $props.id();
	const spoken = $derived([...code].join(' '));
</script>

<div
	class="ds-codecallout {className}"
	role="group"
	aria-labelledby={label ? `${uid}-label` : undefined}
	aria-label={label ? undefined : strings.code}
	data-accent={accent ? '' : undefined}
>
	{#if label}<span class="label" id="{uid}-label">{label}</span>{/if}
	<span class="row">
		<span class="code" aria-hidden="true">{code}</span>
		<span class="ds-sr-only">{spoken}</span>
		{#if copy}<CopyButton value={code} inline label={copyLabel ?? strings.copyCode} />{/if}
	</span>
	{#if meta}<span class="meta">{meta}</span>{/if}
</div>

<style>
	.ds-codecallout {
		container-type: inline-size;
		display: flex;
		flex-direction: column;
		gap: 4px;
		min-width: 0;
		padding: 14px 18px 16px;
		border: 1px solid var(--ds-border-subtle);
		border-radius: var(--ds-radius-md);
		background: var(--ds-bg-2);
		color: var(--ds-text-1);
	}
	.ds-codecallout[data-accent] {
		box-shadow: inset 3px 0 0 var(--ds-accent);
		padding-left: 21px;
	}
	.label {
		color: var(--ds-text-2);
		font-size: var(--ds-text-sm);
		line-height: var(--ds-lh-sm);
	}
	.row {
		display: flex;
		align-items: center;
		gap: 8px;
		min-width: 0;
	}
	.code {
		min-width: 0;
		overflow-wrap: anywhere;
		color: var(--ds-text-heading, var(--ds-text-1));
		font-family: var(--font-mono);
		font-size: 48px;
		line-height: 56px;
		font-weight: 500;
		font-variant-numeric: tabular-nums slashed-zero;
		letter-spacing: 0.06em;
	}
	.meta {
		color: var(--ds-text-3);
		font-size: var(--ds-text-xs);
		line-height: var(--ds-lh-xs);
	}
	@container (max-width: 240px) {
		.code {
			font-size: 36px;
			line-height: 44px;
		}
	}
</style>
