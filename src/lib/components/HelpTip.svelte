<!--
@component
HelpTip — an icon that carries a note: how this system explains a field, a row or a state instead
of a sentence under it. It is a button described by its note (`role="tooltip"`), so a screen reader
reads the note with it. The note shows on hover, on focus by keyboard or tap, and toggles on click
or tap; Esc hides it. The icon stays its drawn size while its hit area is 24px, and 44px on a touch
screen. The note is placed beside the icon and kept inside the viewport.

- `text` (the note), `label` (the button's name, default "More information"), `icon` (Lucide;
  Info by default — CornerLeftUp for "inherited from", TriangleAlert for a warning), `tone`
  (`default` | `warning`), `size` (icon px, default 13), `placement` (`top` default | `bottom`).
-->
<script lang="ts">
	import { computePosition, flip, offset, shift } from '@floating-ui/dom';
	import Info from '@lucide/svelte/icons/info';
	import type { IconComponent } from '../types.js';

	interface Props {
		text: string;
		label?: string;
		icon?: IconComponent;
		tone?: 'default' | 'warning';
		size?: number;
		placement?: 'top' | 'bottom';
		class?: string;
	}

	let {
		text,
		label = 'More information',
		icon: Icon = Info,
		tone = 'default',
		size = 13,
		placement = 'top',
		class: className = ''
	}: Props = $props();

	const uid = $props.id();
	const tipId = `${uid}-tip`;
	let button: HTMLButtonElement | undefined = $state();
	let bubble: HTMLSpanElement | undefined = $state();
	let hovered = $state(false);
	let focused = $state(false);
	let pinned = $state(false);
	// Esc hides the note until the pointer leaves or focus moves on.
	let suppressed = $state(false);
	const shown = $derived(!suppressed && (hovered || focused || pinned));
	let shownAtPress = false;

	$effect(() => {
		if (!shown || !button || !bubble) return;
		const anchor = button;
		const tip = bubble;
		computePosition(anchor, tip, {
			placement,
			strategy: 'fixed',
			middleware: [offset(6), flip(), shift({ padding: 8 })]
		}).then(({ x, y }) => {
			tip.style.left = `${x}px`;
			tip.style.top = `${y}px`;
		});
	});

	function reset() {
		suppressed = false;
	}
</script>

<button
	bind:this={button}
	type="button"
	class="ds-helptip {className}"
	data-tone={tone}
	data-shown={shown ? '' : undefined}
	aria-label={label}
	aria-describedby={tipId}
	onpointerenter={() => (hovered = true)}
	onpointerleave={() => {
		hovered = false;
		if (!focused) reset();
	}}
	onpointerdown={() => (shownAtPress = shown)}
	onfocus={() => (focused = true)}
	onblur={() => {
		focused = false;
		pinned = false;
		reset();
	}}
	onclick={() => {
		// A tap focuses the button (showing the note) before the click lands, so toggle on what was
		// showing when the press began.
		if (shownAtPress) {
			pinned = false;
			suppressed = true;
		} else {
			suppressed = false;
			pinned = true;
		}
		shownAtPress = false;
	}}
	onkeydown={(event) => {
		if (event.key === 'Escape' && shown) {
			event.preventDefault();
			event.stopPropagation();
			pinned = false;
			suppressed = true;
		}
	}}
>
	<Icon {size} aria-hidden="true" />
	<span bind:this={bubble} id={tipId} class="bubble" role="tooltip">{text}</span>
</button>

<style>
	.ds-helptip {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex: none;
		margin: 0;
		padding: 0;
		border: 0;
		border-radius: var(--ds-radius-xs);
		background: transparent;
		color: var(--ds-text-3);
		font: inherit;
		cursor: help;
		vertical-align: middle;
	}
	/* The hit area: 24px (44 on touch) around the icon, without changing the layout. */
	.ds-helptip::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		width: 24px;
		height: 24px;
		transform: translate(-50%, -50%);
	}
	@media (pointer: coarse) {
		.ds-helptip::before {
			width: 44px;
			height: 44px;
		}
	}
	.ds-helptip[data-tone='warning'] {
		color: var(--ds-warning-text);
	}
	.ds-helptip:hover,
	.ds-helptip[data-shown] {
		color: var(--ds-text-1);
	}
	.ds-helptip:focus-visible {
		outline-offset: 1px;
	}
	.bubble {
		position: fixed;
		top: 0;
		left: 0;
		z-index: var(--ds-z-tooltip);
		width: max-content;
		max-width: min(240px, calc(100vw - 16px));
		padding: 4px 8px;
		border-radius: var(--ds-radius-xs);
		background: var(--ds-bg-4);
		box-shadow: var(--ds-elev-2);
		color: var(--ds-text-1);
		font-family: var(--font-sans);
		font-size: var(--ds-text-xs);
		line-height: var(--ds-lh-xs);
		font-weight: 400;
		text-align: start;
		white-space: normal;
		visibility: hidden;
		opacity: 0;
		pointer-events: none;
		transition: opacity var(--ds-dur-fast) var(--ds-ease-out);
	}
	[data-shown] .bubble {
		visibility: visible;
		opacity: 1;
	}
</style>
