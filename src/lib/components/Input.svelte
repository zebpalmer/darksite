<!--
@component
Input — a text input in the control look: 32px (44 on touch), ds-bg-3, a ds-border edge. The look
is the global `.ds-control` class, so a bare `<select class="ds-control">` or `<textarea
class="ds-control">` matches without a wrapper.

- `value` (bindable), `type`, `mono` (paths, hashes), `invalid`, `describedBy`, `size` (`dense`
  28 | `default` 32; dense applies to fine pointers only), `leading` (an inlaid icon), `trailing`
  snippet (set `--trail-w` to reserve its width, default 120px), `element` (bindable ref), and any
  other `<input>` attribute. Inside a Field, spread `{ id, describedBy, invalid }` onto it.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';

	import type { IconComponent } from '../types.js';

	interface Props extends Omit<HTMLInputAttributes, 'size' | 'value' | 'class'> {
		value?: string | number | null;
		mono?: boolean;
		invalid?: boolean;
		/** A Field's `describedBy`: the ids of its help and error text. */
		describedBy?: string;
		size?: 'dense' | 'default';
		leading?: IconComponent;
		trailing?: Snippet;
		element?: HTMLInputElement;
		class?: string;
	}

	let {
		value = $bindable(''),
		type = 'text',
		mono = false,
		invalid = false,
		describedBy,
		size = 'default',
		leading: Leading,
		trailing,
		element = $bindable(),
		class: className = '',
		...rest
	}: Props = $props();
</script>

<div
	class="ds-input {className}"
	data-size={size}
	data-leading={Leading ? '' : undefined}
	data-trailing={trailing ? '' : undefined}
>
	{#if Leading}<span class="lead"><Leading size={16} aria-hidden="true" /></span>{/if}
	<input
		bind:this={element}
		bind:value
		{type}
		class="ds-control"
		data-mono={mono ? '' : undefined}
		aria-invalid={invalid ? 'true' : undefined}
		{...rest}
		aria-describedby={describedBy ?? rest['aria-describedby']}
	/>
	{#if trailing}<span class="trail">{@render trailing()}</span>{/if}
</div>

<style>
	.ds-input {
		position: relative;
		display: flex;
		align-items: center;
		min-width: 0;
	}
	@media (pointer: fine) {
		[data-size='dense'] input {
			height: var(--ds-h-dense);
		}
	}
	[data-leading] input {
		padding-left: 34px;
	}
	[data-trailing] input {
		padding-right: var(--trail-w, 120px);
	}
	.lead {
		position: absolute;
		left: 10px;
		display: inline-flex;
		color: var(--ds-text-3);
		pointer-events: none;
	}
	.trail {
		position: absolute;
		right: 6px;
		display: inline-flex;
		align-items: center;
		gap: 4px;
	}
</style>
