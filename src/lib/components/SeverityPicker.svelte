<!--
@component
SeverityPicker — the severity variant of SegmentedControl: the stops in scale order, each with a
3px mark stripe, so the row reads as the ramp. A radio group (←/→ move and select). A ScalePicker
over the built-in `severityScale`.

Selected: the stop's tinted ground and ink with its mark as the border. Suggested: a dashed mark
border, not applied. Idle: ds-bg-3 with the stripe at 55%. 40px tall, 48 on touch. It answers to
its own width: key caps hide first, then the row folds to a 3-column grid, never truncating names.

- `value` (bindable; `null` is unset), `onchange(severity)`, `suggested`, `max` (stops above it
  are hidden, not disabled), `keycaps` (show 1–5 as key caps), `counts` (per stop), `columns`
  (`auto` | `5` | `3`), `controlled` (a click only calls `onchange`), `label`, `class`; in a Field,
  `id`, `aria-labelledby={f.labelId}` and `aria-describedby={f.describedBy}`.
-->
<script lang="ts">
	import { strings } from '../strings.svelte.js';
	import ScalePicker from './ScalePicker.svelte';
	import { severityScale, type Severity } from '../severity.js';

	interface Props {
		value?: Severity | null;
		onchange?: (severity: Severity) => void;
		suggested?: Severity | null;
		max?: Severity;
		keycaps?: boolean;
		counts?: Partial<Record<Severity, number>>;
		columns?: 'auto' | 5 | 3;
		controlled?: boolean;
		label?: string;
		id?: string;
		'aria-labelledby'?: string;
		'aria-describedby'?: string;
		class?: string;
	}

	let { value = $bindable(null), label = strings.severity, ...rest }: Props = $props();
</script>

<ScalePicker scale={severityScale} bind:value {label} {...rest} />
