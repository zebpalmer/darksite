<!--
@component
FileInput — choose one or more files: a secondary Button over a native file input, with the chosen
file's name beside it (mono, truncated, the full list in a tooltip) and a Clear button once
something is chosen.

The native `<input type="file">` stays in the page, visually hidden, as the real control: it takes
the keyboard focus (the visible button draws the ring), a Field's label names it, a screen reader
announces it as a file picker with its chosen file, and a `<form>` submits it by `name`. The
visible button is for the pointer only.

- `accept`, `multiple`, `disabled`, `invalid`, `required`, `name`, `id`, `label` (the button text;
  default "Choose file" / "Choose files"), `size` (`dense` | `default`; 44 on touch), `files`
  (bindable `File[]`), `onfiles(files)` (also called with `[]` on Clear), `element` (bindable ref
  to the native input), and any other `<input>` attribute. Inside a Field, spread
  `{ id, describedBy, invalid }` onto it.
-->
<script lang="ts">
	import Upload from '@lucide/svelte/icons/upload';
	import X from '@lucide/svelte/icons/x';
	import type { HTMLInputAttributes } from 'svelte/elements';

	import Button from './Button.svelte';

	interface Props extends Omit<
		HTMLInputAttributes,
		'type' | 'size' | 'value' | 'files' | 'class' | 'children'
	> {
		accept?: string;
		multiple?: boolean;
		disabled?: boolean;
		invalid?: boolean;
		label?: string;
		size?: 'dense' | 'default';
		files?: File[];
		onfiles?: (files: File[]) => void;
		element?: HTMLInputElement;
		class?: string;
	}

	let {
		accept,
		multiple = false,
		disabled = false,
		invalid = false,
		label,
		size = 'default',
		files = $bindable([]),
		onfiles,
		element = $bindable(),
		class: className = '',
		...rest
	}: Props = $props();

	const buttonLabel = $derived(label ?? (multiple ? 'Choose files' : 'Choose file'));
	const summary = $derived(
		files.length === 0 ? 'No file chosen' : files.length === 1 ? files[0].name : `${files.length} files`
	);
	const allNames = $derived(files.map((f) => f.name).join('\n'));

	function update() {
		files = element?.files ? Array.from(element.files) : [];
		onfiles?.(files);
	}

	function clear() {
		if (element) element.value = '';
		files = [];
		onfiles?.([]);
		element?.focus();
	}

	function choose() {
		element?.focus();
		element?.click();
	}
</script>

<div
	class="ds-fileinput {className}"
	data-invalid={invalid ? '' : undefined}
	data-disabled={disabled ? '' : undefined}
>
	<input
		bind:this={element}
		type="file"
		class="native ds-sr-only"
		{accept}
		{multiple}
		{disabled}
		aria-invalid={invalid ? 'true' : undefined}
		onchange={update}
		{...rest}
	/>
	<!-- Pointer only: the native input above is the keyboard and screen-reader control. -->
	<Button
		class="pick"
		icon={Upload}
		{size}
		{disabled}
		tabindex={-1}
		aria-hidden="true"
		onmousedown={(event: MouseEvent) => event.preventDefault()}
		onclick={choose}
	>
		{buttonLabel}
	</Button>
	<span class="name" data-empty={files.length === 0 ? '' : undefined} title={allNames || undefined}
		>{summary}</span
	>
	{#if files.length && !disabled}
		<Button
			variant="icon"
			size="dense"
			icon={X}
			label={multiple ? 'Clear files' : 'Clear file'}
			onclick={clear}
		/>
	{/if}
</div>

<style>
	.ds-fileinput {
		display: flex;
		align-items: center;
		gap: 8px;
		min-width: 0;
	}
	.ds-fileinput:has(.native:focus-visible) :global(.pick) {
		outline: 2px solid var(--ds-focus);
		outline-offset: 2px;
	}
	.ds-fileinput[data-invalid] :global(.pick) {
		border-color: var(--ds-danger);
	}
	.name {
		flex: 0 1 auto;
		min-width: 0;
		overflow: hidden;
		color: var(--ds-text-2);
		font-family: var(--font-mono);
		font-size: var(--ds-text-sm);
		font-variant-numeric: tabular-nums;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.name[data-empty] {
		color: var(--ds-text-3);
		font-family: var(--font-sans);
	}
	[data-disabled] .name {
		opacity: 0.45;
	}
</style>
