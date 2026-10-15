<!--
@component
SeverityBadge — a severity, drawn the same way everywhere: the name on the stop's tinted ground
with a 3px mark inlaid on the left edge. Never the index. `null` renders nothing. A ScaleBadge
over the built-in `severityScale`.

- `severity`: `info` | `low` | `medium` | `high` | `critical` | `null`.
- `size`: `default` (22px) | `sm` (20px: a card overlay, a dense row).
- `pips`: add the 5-pip position bar (detail panels).
-->
<script lang="ts">
	import ScaleBadge from './ScaleBadge.svelte';
	import { severityScale, type Severity } from '../severity.js';

	interface Props {
		severity: Severity | null | undefined;
		size?: 'default' | 'sm';
		pips?: boolean;
		class?: string;
	}

	let { severity, size = 'default', pips = false, class: className = '' }: Props = $props();
</script>

<ScaleBadge scale={severityScale} value={severity} {size} {pips} class={className} />
