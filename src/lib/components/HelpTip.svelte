<!--
@component
HelpTip — an icon that carries a note: how this system explains a field, a row or a state instead
of a sentence under it. The note is the icon's accessible name and appears as a tooltip on hover
and on keyboard focus — the icon is a tab stop, so the note is reachable without a pointer.

- `text` (the note), `icon` (Lucide; Info by default — CornerLeftUp for "inherited from",
  TriangleAlert for a warning), `tone` (`default` | `warning`), `size` (px, default 13),
  `placement` (`top` default | `bottom`).
-->
<script lang="ts">
	import Info from '@lucide/svelte/icons/info';
	import type { IconComponent } from '../types.js';

	interface Props {
		text: string;
		icon?: IconComponent;
		tone?: 'default' | 'warning';
		size?: number;
		placement?: 'top' | 'bottom';
		class?: string;
	}

	let { text, icon: Icon = Info, tone = 'default', size = 13, placement = 'top', class: className = '' }: Props =
		$props();
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<span class="ds-helptip {className}" data-tone={tone} role="img" aria-label={text} tabindex="0">
	<Icon {size} aria-hidden="true" />
	<span class="bubble" data-placement={placement} aria-hidden="true">{text}</span>
</span>

<style>
	.ds-helptip {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex: none;
		color: var(--ds-text-3);
		border-radius: var(--ds-radius-xs);
		cursor: help;
		vertical-align: middle;
	}
	.ds-helptip[data-tone='warning'] {
		color: var(--ds-warning-text);
	}
	.ds-helptip:hover,
	.ds-helptip:focus-visible {
		color: var(--ds-text-1);
	}
	.ds-helptip:focus-visible {
		outline-offset: 1px;
	}
	.bubble {
		position: absolute;
		left: 50%;
		bottom: calc(100% + 6px);
		z-index: var(--ds-z-tooltip);
		width: max-content;
		max-width: 240px;
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
		transform: translateX(-50%);
		visibility: hidden;
		opacity: 0;
		pointer-events: none;
		transition: opacity var(--ds-dur-fast) var(--ds-ease-out);
	}
	.bubble[data-placement='bottom'] {
		top: calc(100% + 6px);
		bottom: auto;
	}
	.ds-helptip:hover .bubble,
	.ds-helptip:focus-visible .bubble {
		visibility: visible;
		opacity: 1;
	}
</style>
