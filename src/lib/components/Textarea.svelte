<!--
@component
Textarea — multi-line text in the control look: ds-bg-3, a ds-border edge, at least 80px tall and
resizable vertically. It takes the same Field contract as Input: spread `{ id, describedBy,
invalid }` onto it.

- `value` (bindable), `rows` (default 3), `invalid`, `mono`, `resize` (`vertical` default | `none`),
  `element` (bindable ref), `class`, and any other `<textarea>` attribute.
-->
<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLTextareaAttributes, 'value' | 'class'> {
		value?: string | null;
		invalid?: boolean;
		mono?: boolean;
		resize?: 'vertical' | 'none';
		describedBy?: string;
		element?: HTMLTextAreaElement;
		class?: string;
	}

	let {
		value = $bindable(''),
		rows = 3,
		invalid = false,
		mono = false,
		resize = 'vertical',
		describedBy,
		element = $bindable(),
		class: className = '',
		...rest
	}: Props = $props();
</script>

<textarea
	bind:this={element}
	bind:value
	{rows}
	class="ds-control ds-textarea {className}"
	data-mono={mono ? '' : undefined}
	data-resize={resize}
	aria-invalid={invalid ? 'true' : undefined}
	aria-describedby={describedBy ?? rest['aria-describedby']}
	{...rest}
></textarea>

<style>
	.ds-textarea[data-resize='none'] {
		resize: none;
	}
</style>
