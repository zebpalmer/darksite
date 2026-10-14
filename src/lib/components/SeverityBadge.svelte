<!--
@component
SeverityBadge — a severity, drawn the same way everywhere: the name on the stop's tinted ground
with a 3px mark inlaid on the left edge. Never the index. `null` renders nothing.

- `severity`: `info` | `low` | `medium` | `high` | `critical` | `null`.
- `size`: `default` (22px) | `sm` (20px: a card overlay, a dense row).
- `pips`: add the 5-pip position bar (detail panels).
-->
<script lang="ts">
	import { SEVERITIES, severityLabel, severityRank, severityVars, type Severity } from '../severity.js';

	interface Props {
		severity: Severity | null | undefined;
		size?: 'default' | 'sm';
		pips?: boolean;
		class?: string;
	}

	let { severity, size = 'default', pips = false, class: className = '' }: Props = $props();

	const vars = $derived(severity ? severityVars(severity) : null);
	const rank = $derived(severity ? severityRank(severity) : 0);
</script>

{#if severity && vars}
	<span class="ds-sev-wrap {className}" style:--mark={vars.mark} style:--bg={vars.bg} style:--ink={vars.ink}>
		<span class="ds-sev" data-size={size} data-severity={severity}>{severityLabel(severity)}</span>
		{#if pips}
			<span class="pips" aria-hidden="true">
				{#each SEVERITIES as s, i (s)}<span class="pip" data-on={i < rank ? '' : undefined}></span>{/each}
			</span>
		{/if}
	</span>
{/if}

<style>
	.ds-sev-wrap {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		flex: none;
	}
	.ds-sev {
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
	.ds-sev[data-size='sm'] {
		height: 20px;
		padding: 0 6px 0 8px;
	}
	.pips {
		display: flex;
		gap: 2px;
		width: 84px;
	}
	.pip {
		flex: 1;
		height: 4px;
		border-radius: 1px;
		background: var(--ds-sev-off);
	}
	.pip[data-on] {
		background: var(--mark);
	}
</style>
