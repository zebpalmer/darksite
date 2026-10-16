<script lang="ts" module>
	/** What a Field hands its control: spread these onto it. */
	export interface FieldControl {
		id: string;
		/** The label's id: a group control (SegmentedControl, Rating, ScalePicker) takes it as
		 *  `aria-labelledby`, since a `<label for>` cannot name a group. */
		labelId: string;
		describedBy: string | undefined;
		invalid: boolean;
	}
</script>

<!--
@component
Field — a label, a control and its help or error, wired for accessibility. Every form control sits
in one. The children snippet receives `{ id, labelId, describedBy, invalid }`; spread them onto the
control. A group control (SegmentedControl, Rating, ScalePicker) takes `labelId` as its
`aria-labelledby`, because a `<label for>` names only a single native control.

- `label`, `help` (12px ds-text-3), `error` (replaces help while present and makes the control
  invalid), `required`, `disabled` (dims the label and help).
- `tip` — the explanation as a HelpTip beside the label; it still describes the control for a
  screen reader. Prefer it over `help`. Its button is named "About {label}" (`strings.aboutField`),
  so several tips in one form are told apart; `tipLabel` names it instead.
- `layout` — `stack` (default) or `row` (a 96px label column). A row field narrower than 360px, or
  on a touch screen, stacks anyway.
- `accessory` snippet (the right end of the label row), `under` snippet (below the control), `id`.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import CircleAlert from '@lucide/svelte/icons/circle-alert';

	import HelpTip from './HelpTip.svelte';
	import { strings } from '../strings.svelte.js';

	interface Props {
		label: string;
		help?: string;
		error?: string | null;
		required?: boolean;
		disabled?: boolean;
		tip?: string;
		/** The tip button's name. Default "About {label}". */
		tipLabel?: string;
		layout?: 'stack' | 'row';
		accessory?: Snippet;
		under?: Snippet;
		id?: string;
		class?: string;
		children: Snippet<[FieldControl]>;
	}

	let {
		label,
		help,
		error,
		required = false,
		disabled = false,
		tip,
		tipLabel,
		layout = 'stack',
		accessory,
		under,
		id,
		class: className = '',
		children
	}: Props = $props();

	const uid = $props.id();
	const controlId = $derived(id ?? `${uid}-control`);
	const labelId = `${uid}-label`;
	const noteId = `${uid}-note`;
	const tipId = `${uid}-tip`;
	const describedBy = $derived(
		[error || help ? noteId : null, tip ? tipId : null].filter(Boolean).join(' ') || undefined
	);
</script>

<div class="ds-field {className}" data-layout={layout} data-disabled={disabled ? '' : undefined}>
	<div class="inner">
		<div class="head">
			<label class="label" id={labelId} for={controlId}>
				{label}{#if required}<span class="req" aria-hidden="true">*</span><span class="ds-sr-only">
						(required)</span
					>{/if}
			</label>
			{#if tip}
				<HelpTip text={tip} label={tipLabel ?? strings.aboutField(label)} />
				<span id={tipId} class="ds-sr-only">{tip}</span>
			{/if}
			{#if accessory}<span class="accessory">{@render accessory()}</span>{/if}
		</div>
		<div class="body">
			{@render children({ id: controlId, labelId, describedBy, invalid: !!error })}
			{#if error}
				<p id={noteId} class="note error"><CircleAlert size={12} aria-hidden="true" />{error}</p>
			{:else if help}
				<p id={noteId} class="note">{help}</p>
			{/if}
			{#if under}<div class="under">{@render under()}</div>{/if}
		</div>
	</div>
</div>

<style>
	.ds-field {
		container-type: inline-size;
		min-width: 0;
	}
	.inner {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.head {
		display: flex;
		align-items: center;
		gap: 6px;
		min-height: 18px;
	}
	.label {
		color: var(--ds-text-2);
		font-size: var(--ds-text-sm);
		line-height: var(--ds-lh-sm);
	}
	.req {
		margin-left: 2px;
		color: var(--ds-danger-text);
	}
	.accessory {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		margin-left: auto;
		color: var(--ds-text-3);
		font-size: var(--ds-text-xs);
	}
	.body {
		display: flex;
		flex-direction: column;
		gap: 6px;
		min-width: 0;
	}
	.note {
		display: flex;
		align-items: center;
		gap: 6px;
		margin: 0;
		color: var(--ds-text-3);
		font-size: var(--ds-text-xs);
		line-height: var(--ds-lh-xs);
	}
	.error {
		color: var(--ds-danger-text);
	}
	.error :global(svg) {
		flex: none;
	}
	[data-disabled] :is(.head, .note) {
		opacity: 0.45;
	}
	@container (min-width: 360px) {
		[data-layout='row'] .inner {
			display: grid;
			grid-template-columns: 96px minmax(0, 1fr);
			align-items: start;
			gap: 12px;
		}
		[data-layout='row'] .head {
			min-height: var(--ds-h-default);
		}
	}
	@media (pointer: coarse) {
		[data-layout='row'] .inner {
			display: flex;
		}
	}
</style>
