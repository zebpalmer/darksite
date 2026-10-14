<!--
@component
StatusBadge — a static, non-interactive state: a lifecycle stage, a hold, a marker such as
"Primary". 22px (it is not a control, so it does not grow on touch), 12/500, an optional 14px icon.

- `tone`: `neutral` (default; a ds-border edge) · `accent` (a marker) · `success` · `warning` ·
  `danger` (each its tint ground and text ink) · `muted` (out of service).
- `since`: a date; renders "· 12 days" after the label, in mono, for a state that ages.
- `icon`, `label` (or children), `class`.

Never severity colors — an ordered scale is a SeverityBadge. A clickable state is a Chip.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { formatAge, formatExact, type DateInput } from '../time.js';
	import type { IconComponent } from '../types.js';

	interface Props {
		label?: string;
		tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'muted';
		icon?: IconComponent;
		since?: DateInput;
		/** The reference time for `since`; defaults to now. */
		now?: DateInput;
		class?: string;
		children?: Snippet;
	}

	let { label, tone = 'neutral', icon: Icon, since, now, class: className = '', children }: Props = $props();

	const age = $derived(since === undefined ? null : formatAge(since, now));
</script>

<span class="ds-status {className}" data-tone={tone} title={since === undefined ? undefined : `Since ${formatExact(since)}`}>
	{#if Icon}<Icon size={14} aria-hidden="true" />{/if}
	<span>{#if children}{@render children()}{:else}{label}{/if}</span>
	{#if age}<span class="age"><span aria-hidden="true">·</span><span class="ds-sr-only">, for</span> {age}</span>{/if}
</span>

<style>
	.ds-status {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		flex: none;
		height: 22px;
		padding: 0 7px;
		border: 1px solid transparent;
		border-radius: var(--ds-radius-xs);
		font-size: var(--ds-text-xs);
		line-height: var(--ds-lh-xs);
		font-weight: 500;
		white-space: nowrap;
	}
	.ds-status[data-tone='neutral'] {
		border-color: var(--ds-border);
		color: var(--ds-text-2);
	}
	.ds-status[data-tone='accent'] {
		border-color: var(--ds-accent);
		color: var(--ds-accent-text);
	}
	.ds-status[data-tone='success'] {
		background: var(--ds-success-tint);
		color: var(--ds-success-text);
	}
	.ds-status[data-tone='warning'] {
		background: var(--ds-warning-tint);
		color: var(--ds-warning-text);
	}
	.ds-status[data-tone='danger'] {
		background: var(--ds-danger-tint);
		color: var(--ds-danger-text);
	}
	.ds-status[data-tone='muted'] {
		border-color: var(--ds-border-subtle);
		color: var(--ds-text-3);
	}
	.age {
		font-family: var(--font-mono);
		font-weight: 400;
		font-variant-numeric: tabular-nums;
	}
</style>
