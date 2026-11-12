<script lang="ts" module>
	/** A step: its label, and an optional tooltip describing it. */
	export interface TrackerStep {
		label: string;
		title?: string;
	}
</script>

<!--
@component
Tracker — where a multi-step process stands: one row of segments, a mark and a label per step.
Past steps are complete, the current one is marked, and the rest are still to come. It reports
progress; it is not a numbered how-to (that is `Steps`) and not a form wizard.

- `steps` (labels; or `{ label, title }` for a tooltip on a step), `current` (0-based; clamped),
  `state` (`active` default | `stopped` | `done`): `stopped` marks the current step in the
  `stoppedTone` (`danger` default, or `warning`); `done` completes every step. `label` (names the
  list when it needs more than its summary), `class`.
- The list is named by its summary, "Step 3 of 6: Downloading" (`strings.trackerStep`); `done` reads
  "All 6 steps complete". The current step carries `aria-current="step"`.
- In a narrow container (under 540px) only the current step's label shows, the rest are marks; the
  hidden labels stay readable to a screen reader.
-->
<script lang="ts">
	import { strings } from '../strings.svelte.js';
	import { tooltip } from '../tooltip.js';

	interface Props {
		steps: readonly (string | TrackerStep)[];
		current: number;
		state?: 'active' | 'stopped' | 'done';
		stoppedTone?: 'danger' | 'warning';
		label?: string;
		class?: string;
	}

	let {
		steps,
		current,
		state = 'active',
		stoppedTone = 'danger',
		label,
		class: className = ''
	}: Props = $props();

	const items = $derived(steps.map((s) => (typeof s === 'string' ? { label: s } : s) as TrackerStep));
	const last = $derived(items.length - 1);
	const at = $derived(Math.min(Math.max(Math.trunc(current) || 0, 0), Math.max(last, 0)));
	const summary = $derived(
		label ??
			(state === 'done'
				? strings.trackerDone(items.length)
				: strings.trackerStep(at + 1, items.length, items[at]?.label ?? ''))
	);

	function mark(i: number): 'complete' | 'current' | 'stopped' | 'upcoming' {
		if (state === 'done' || i < at) return 'complete';
		if (i > at) return 'upcoming';
		return state === 'stopped' ? 'stopped' : 'current';
	}
	// The label a narrow container keeps: the current step's, or the last once done.
	const shown = $derived(state === 'done' ? last : at);
</script>

{#if items.length}
	<ol
		class="ds-tracker {className}"
		aria-label={summary}
		data-tone={state === 'stopped' ? stoppedTone : undefined}
	>
		{#each items as item, i (i)}
			{@const m = mark(i)}
			<li
				class="step"
				data-state={m}
				data-shown={i === shown ? '' : undefined}
				aria-current={m === 'current' || m === 'stopped' ? 'step' : undefined}
				{@attach tooltip(item.title)}
			>
				<span class="name">{item.label}</span>
				{#if m === 'complete'}<span class="ds-sr-only">, {strings.trackerComplete}</span
					>{:else if m === 'stopped'}<span class="ds-sr-only">, {strings.trackerStopped}</span>{/if}
			</li>
		{/each}
	</ol>
{/if}

<style>
	.ds-tracker {
		container-type: inline-size;
		display: flex;
		gap: 4px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.step {
		flex: 1 1 0;
		min-width: 0;
		padding-top: 6px;
		border-top: 3px solid var(--ds-border-subtle);
		color: var(--ds-text-3);
		font-size: var(--ds-text-sm);
		line-height: var(--ds-lh-sm);
	}
	.name {
		display: block;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.step[data-state='complete'] {
		border-top-color: var(--ds-accent);
		color: var(--ds-text-2);
	}
	.step[data-state='current'] {
		border-top-color: var(--ds-accent);
		color: var(--ds-accent-text);
		font-weight: 500;
	}
	.step[data-state='stopped'] {
		font-weight: 500;
	}
	[data-tone='danger'] .step[data-state='stopped'] {
		border-top-color: var(--ds-danger);
		color: var(--ds-danger-text);
	}
	[data-tone='warning'] .step[data-state='stopped'] {
		border-top-color: var(--ds-warning);
		color: var(--ds-warning-text);
	}
	/* Narrow: marks for every step, the label for one. The rest stay readable to a screen reader. */
	@container (max-width: 539.98px) {
		.step:not([data-shown]) {
			flex-grow: 1;
		}
		.step[data-shown] {
			flex-grow: 5;
		}
		.step:not([data-shown]) > :global(.name) {
			position: absolute;
			width: 1px;
			height: 1px;
			overflow: hidden;
			clip-path: inset(50%);
			white-space: nowrap;
		}
		.step:not([data-shown]) {
			position: relative;
		}
	}
</style>
