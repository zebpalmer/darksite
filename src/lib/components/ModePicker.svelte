<!--
@component
ModePicker — the viewer's choice of mode: System, Dark, Light, Paper, Night, High contrast. It drives
the `mode` store, which applies the choice to the page and remembers it in this browser
(`mode.subscribe` keeps it per account as well). A native select by default, which fits a rail
footer or a settings page; `variant="segmented"` shows the choices side by side, and in a
container narrower than all six it shrinks to fit and scrolls sideways, in a flex row or a grid
cell as in a block.

- `modes` (which to offer, in order; default all six), `label` (default "Theme"), `hideLabel`,
  `variant` (`select` | `segmented`), `store` (default the app's `mode`), `class`.
-->
<script lang="ts">
	import { strings } from '../strings.svelte.js';
	import { MODES, mode, modeLabel, type Mode, type ModeStore } from '../mode.svelte.js';
	import SegmentedControl from './SegmentedControl.svelte';
	import Select from './Select.svelte';

	interface Props {
		modes?: readonly Mode[];
		label?: string;
		hideLabel?: boolean;
		variant?: 'select' | 'segmented';
		store?: ModeStore;
		class?: string;
	}

	let {
		modes = MODES,
		label = strings.theme,
		hideLabel = false,
		variant = 'select',
		store = mode,
		class: className = ''
	}: Props = $props();

	const uid = $props.id();
	const options = $derived(modes.map((m) => ({ value: m, label: modeLabel(m) })));
</script>

<div class="ds-modepicker {className}" data-variant={variant}>
	{#if variant === 'segmented'}
		<SegmentedControl
			{options}
			value={store.current}
			{label}
			onchange={(m) => store.set(m as Mode)}
		/>
	{:else}
		<label class="text" class:ds-sr-only={hideLabel} for="{uid}-select">{label}</label>
		<Select
			id="{uid}-select"
			{options}
			value={store.current}
			placeholder=""
			onchange={(e: Event) => store.set((e.currentTarget as HTMLSelectElement).value as Mode)}
		/>
	{/if}
</div>

<style>
	/* A flex or grid item would otherwise grow to its content and overflow its container. */
	.ds-modepicker {
		min-width: 0;
		max-width: 100%;
	}
	.ds-modepicker[data-variant='select'] {
		display: flex;
		flex-direction: column;
		gap: 4px;
		min-width: 0;
	}
	.text {
		color: var(--ds-text-3);
		font-size: var(--ds-text-xs);
	}
</style>
