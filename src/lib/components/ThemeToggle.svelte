<script lang="ts" module>
	import { MediaFlag } from '../media.svelte.js';

	/** The device's own preference, for a store that follows the system. */
	const prefersLight = new MediaFlag('(prefers-color-scheme: light)');
</script>

<!--
@component
ThemeToggle — one button that flips between two modes, dark and light by default: a moon while a
dark mode is on, a sun while a light one is. A press switches to the other mode through the `mode`
store, which applies it and remembers it in this browser. Its label names what a press does
("Switch to light mode"), so it is an action, not a pressed state. While the store follows the
system, the device's preference decides which mode is on and which comes next.

For the full set of modes (paper, night, high contrast, system) use `ModePicker`.

- `modes` (the two, default `['dark', 'light']`), `store` (default the app's `mode`), `label` (a
  string, or a function of the mode a press switches to; default "Switch to light mode" /
  "Switch to dark mode" from `strings`), `showLabel` (visible text beside the icon, such as
  "Appearance": the button then reads that text, then the action), `size`, `class`.
-->
<script lang="ts">
	import Moon from '@lucide/svelte/icons/moon';
	import Sun from '@lucide/svelte/icons/sun';

	import Button from './Button.svelte';
	import { isDarkMode, mode, modeLabel, type Mode, type ModeStore } from '../mode.svelte.js';
	import { strings } from '../strings.svelte.js';
	import type { ControlSize } from '../types.js';

	type Shown = Exclude<Mode, 'system'>;

	interface Props {
		modes?: readonly [Shown, Shown];
		store?: ModeStore;
		label?: string | ((next: Shown) => string);
		showLabel?: string;
		size?: ControlSize;
		class?: string;
	}

	let {
		modes = ['dark', 'light'],
		store = mode,
		label,
		showLabel,
		size = 'default',
		class: className = ''
	}: Props = $props();

	// The server cannot know the device's preference, so the first render reads it as dark, and
	// the device's own answer applies once mounted: hydration then matches the server's markup.
	let mounted = $state(false);
	$effect(() => {
		mounted = true;
	});

	const effective = $derived<Shown>(
		store.current === 'system'
			? mounted && prefersLight.current
				? 'light'
				: 'dark'
			: store.current
	);
	// The other of the two; from a mode that is neither (paper, say), the one of the other kind.
	const next = $derived.by<Shown>(() => {
		const [a, b] = modes;
		if (effective === a) return b;
		if (effective === b) return a;
		return isDarkMode(effective) === isDarkMode(a) ? b : a;
	});
	const action = $derived(
		typeof label === 'function'
			? label(next)
			: (label ?? strings.switchToMode(modeLabel(next)))
	);
	const icon = $derived(isDarkMode(effective) ? Moon : Sun);
</script>

{#if showLabel}
	<Button
		variant="ghost"
		{size}
		{icon}
		class="ds-themetoggle {className}"
		data-mode={effective}
		onclick={() => store.set(next)}
		>{showLabel}<span class="ds-sr-only">: {action}</span></Button
	>
{:else}
	<Button
		variant="icon"
		{size}
		{icon}
		label={action}
		class="ds-themetoggle {className}"
		data-mode={effective}
		onclick={() => store.set(next)}
	/>
{/if}
