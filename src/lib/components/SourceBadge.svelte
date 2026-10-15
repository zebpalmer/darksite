<!--
@component
SourceBadge — where a value came from: `● Registry 96%`. Not a button.

- `source`: the display name. `confidence`: 0–1 (or a percentage); omitted, no number shows.
- `variant`: `applied` (accent tint with a dot — the value is in the field) | `suggestion`
  (neutral — inside a dashed suggestion Chip, not applied).
- `title`: the full source list, when there is more than one (`Sources: File 20% · Model 80%`).
-->
<script lang="ts">
	import { formatConfidence } from '../numbers.js';

	interface Props {
		source: string;
		confidence?: number | null;
		variant?: 'applied' | 'suggestion';
		title?: string;
		class?: string;
	}

	let { source, confidence = null, variant = 'applied', title, class: className = '' }: Props = $props();

	const pct = $derived(
		confidence === null || confidence === undefined
			? ''
			: formatConfidence(confidence <= 1 ? confidence : confidence / 100)
	);
</script>

<span
	class="ds-src {className}"
	data-variant={variant}
	title={title ?? `From ${source}${pct ? ` (${pct} confidence)` : ''}`}
>
	{#if variant === 'applied'}<span class="dot" aria-hidden="true"></span>{/if}
	<span>{source}{#if pct}&nbsp;{pct}{/if}</span>
</span>

<style>
	.ds-src {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		flex: none;
		height: 20px;
		padding: 0 6px;
		border-radius: var(--ds-radius-xs);
		font-size: var(--ds-text-xs);
		line-height: var(--ds-lh-xs);
		white-space: nowrap;
	}
	.ds-src[data-variant='applied'] {
		height: 22px;
		background: var(--ds-accent-tint);
		color: var(--ds-accent-text);
	}
	.ds-src[data-variant='suggestion'] {
		background: var(--ds-bg-4);
		color: var(--ds-text-2);
	}
	.dot {
		width: 6px;
		height: 6px;
		border-radius: var(--ds-radius-full);
		background: var(--ds-accent);
	}
</style>
