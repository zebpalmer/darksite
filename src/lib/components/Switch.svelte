<!--
@component
Switch — a setting that takes effect immediately, with no Save. A native checkbox with
`role="switch"`: a 32×18 track, ds-bg-5 off and ds-accent on, and a thumb whose position also
carries the state. The state is written beside it ("On" / "Off") unless the label already says it,
so color is never the only signal.

- `checked` (bindable), `label`, `hideLabel`, `stateText` (default true: show "On" / "Off"),
  `onText` / `offText`, `name`, `disabled` (45%), `onchange(checked)`.

Something that needs a Save is a Checkbox, not a Switch.
-->
<script lang="ts">
	import { strings } from '../strings.svelte.js';
	interface Props {
		checked?: boolean;
		label: string;
		hideLabel?: boolean;
		stateText?: boolean;
		onText?: string;
		offText?: string;
		name?: string;
		disabled?: boolean;
		id?: string;
		onchange?: (checked: boolean) => void;
		class?: string;
	}

	let {
		checked = $bindable(false),
		label,
		hideLabel = false,
		stateText = true,
		onText = strings.on,
		offText = strings.off,
		name,
		disabled = false,
		id,
		onchange,
		class: className = ''
	}: Props = $props();

	function change(event: Event & { currentTarget: HTMLInputElement }) {
		checked = event.currentTarget.checked;
		onchange?.(checked);
	}
</script>

<label class="ds-switch {className}" data-disabled={disabled ? '' : undefined}>
	{#if !hideLabel}<span class="text">{label}</span>{/if}
	<span class="track">
		<input
			type="checkbox"
			role="switch"
			{id}
			{name}
			{disabled}
			{checked}
			aria-checked={checked}
			aria-label={hideLabel ? label : undefined}
			onchange={change}
		/>
		<span class="thumb" aria-hidden="true"></span>
	</span>
	{#if stateText}<span class="state" aria-hidden="true">{checked ? onText : offText}</span>{/if}
</label>

<style>
	.ds-switch {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: 32px;
		color: var(--ds-text-1);
		font-size: var(--ds-text-md);
		line-height: var(--ds-lh-md);
		cursor: pointer;
	}
	@media (pointer: coarse) {
		.ds-switch {
			min-height: var(--ds-h-touch);
		}
	}
	.ds-switch[data-disabled] {
		opacity: 0.45;
		cursor: not-allowed;
	}
	.track {
		position: relative;
		display: inline-flex;
		flex: none;
		width: 32px;
		height: 18px;
	}
	input {
		appearance: none;
		width: 32px;
		height: 18px;
		margin: 0;
		border: 1px solid var(--ds-border-strong);
		border-radius: var(--ds-radius-full);
		background: var(--ds-bg-5);
		cursor: inherit;
		transition:
			background-color var(--ds-dur-fast) var(--ds-ease-out),
			border-color var(--ds-dur-fast) var(--ds-ease-out);
	}
	input:checked {
		background: var(--ds-accent);
		border-color: var(--ds-accent);
	}
	.thumb {
		position: absolute;
		top: 3px;
		left: 3px;
		width: 12px;
		height: 12px;
		border-radius: var(--ds-radius-full);
		background: var(--ds-text-2);
		pointer-events: none;
		transition:
			transform var(--ds-dur-fast) var(--ds-ease-out),
			background-color var(--ds-dur-fast) var(--ds-ease-out);
	}
	input:checked + .thumb {
		transform: translateX(14px);
		background: var(--ds-accent-contrast);
	}
	.state {
		min-width: 2.5em;
		color: var(--ds-text-3);
		font-size: var(--ds-text-sm);
	}
</style>
