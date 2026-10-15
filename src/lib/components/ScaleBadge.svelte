<!--
@component
ScaleBadge — a stop on an ordinal scale, drawn the same way everywhere: the name on the stop's
tinted ground with a 3px mark inlaid on the left edge. Never the index. `null` renders nothing.
The unknown stop's mark is dashed, and it lights no pips.

- `scale`: a `Scale` from `defineScale` (or the built-in `severityScale`).
- `value`: a value on the scale, or `null` (unset).
- `size`: `default` (22px) | `sm` (20px: a card overlay, a dense row).
- `pips`: add the position bar, one pip per ordered stop (detail panels).
-->
<script lang="ts" generics="V extends string">
	import type { Scale } from '../scale.js';

	interface Props {
		scale: Scale<V>;
		value: V | null | undefined;
		size?: 'default' | 'sm';
		pips?: boolean;
		class?: string;
	}

	let { scale, value, size = 'default', pips = false, class: className = '' }: Props = $props();

	const vars = $derived(scale.vars(value));
	const rank = $derived(scale.rank(value));
	const unknown = $derived(scale.isUnknown(value));
</script>

{#if value && vars}
	<span
		class="ds-scale-wrap {className}"
		style:--mark={vars.mark}
		style:--bg={vars.bg}
		style:--ink={vars.ink}
		style:--off={scale.off}
	>
		<span class="ds-scale" data-size={size} data-value={value} data-unknown={unknown ? '' : undefined}
			>{scale.label(value)}</span
		>
		{#if pips}
			<span class="pips" aria-hidden="true" style:--n={scale.values.length}>
				{#each scale.values as s, i (s)}<span class="pip" data-on={i < rank ? '' : undefined}></span>{/each}
			</span>
		{/if}
	</span>
{/if}

<style>
	.ds-scale-wrap {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		flex: none;
	}
	.ds-scale {
		position: relative;
		display: inline-flex;
		align-items: center;
		height: 22px;
		padding: 0 8px 0 10px;
		border-radius: var(--ds-radius-xs);
		background: var(--bg);
		color: var(--ink);
		box-shadow: inset 3px 0 0 var(--mark);
		font-size: var(--ds-text-xs);
		line-height: var(--ds-lh-xs);
		white-space: nowrap;
	}
	.ds-scale[data-size='sm'] {
		height: 20px;
		padding: 0 6px 0 8px;
	}
	/* Unknown: the mark is dashed, so it never reads as a position on the ramp. */
	.ds-scale[data-unknown] {
		overflow: hidden;
		box-shadow: none;
	}
	.ds-scale[data-unknown]::before {
		content: '';
		position: absolute;
		inset: 0 auto 0 0;
		width: 3px;
		background: repeating-linear-gradient(to bottom, var(--mark) 0 3px, transparent 3px 6px);
	}
	.pips {
		display: flex;
		gap: 2px;
		/* 84px for five stops; wider for more, up to 128px. */
		width: min(calc(var(--n) * 15.2px + (var(--n) - 1) * 2px), 128px);
	}
	.pip {
		flex: 1;
		height: 4px;
		border-radius: 1px;
		background: var(--off);
	}
	.pip[data-on] {
		background: var(--mark);
	}
</style>
