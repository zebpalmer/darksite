<!--
@component
KeyCap — a `<kbd>` hotkey hint: 18px tall, 12px mono, a 2px bottom edge so it reads as a key.
Put one next to the control its key triggers; never as a standalone label.

- `keys`: a hotkey token (`shift+enter`, `space`, `g`) or several alternatives.
- `hint` (default true): a hint cap hides when hints are off (`<html data-hints="off">`) and on
  phones. Pass `false` for caps that are the content itself, as in a hotkey legend.
- `tone`: `default` | `primary` (a cap sitting on a filled primary Button).
- `decorative` (default false): `aria-hidden`, for a cap inside a control that already carries
  `aria-keyshortcuts`.
- `separator`: between alternatives (default ` / `).
-->
<script lang="ts">
	import { formatKeys } from '../keycap.js';

	interface Props {
		keys: string | readonly string[];
		hint?: boolean;
		tone?: 'default' | 'primary';
		decorative?: boolean;
		separator?: string;
		class?: string;
	}

	let {
		keys,
		hint = true,
		tone = 'default',
		decorative = false,
		separator = ' / ',
		class: className = ''
	}: Props = $props();

	const text = $derived(formatKeys(keys, separator));
</script>

<kbd
	class="ds-kbd {className}"
	data-hint={hint ? '' : undefined}
	data-tone={tone}
	aria-hidden={decorative ? 'true' : undefined}>{text}</kbd
>

<style>
	.ds-kbd {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex: none;
		min-width: 18px;
		height: 18px;
		padding: 0 4px;
		border-radius: var(--ds-radius-xs);
		border: 1px solid var(--ds-border-strong);
		border-bottom-width: 2px;
		background: var(--ds-bg-2);
		color: var(--ds-text-2);
		font-family: var(--font-mono);
		font-size: var(--ds-text-xs);
		font-weight: 400;
		line-height: 1;
		white-space: nowrap;
	}
	.ds-kbd[data-tone='primary'] {
		background: var(--ds-accent-key);
		border-color: var(--ds-accent-key-edge);
		color: var(--ds-accent-contrast);
	}
	:global(html[data-hints='off']) .ds-kbd[data-hint] {
		display: none;
	}
	@media (max-width: 767.98px) {
		.ds-kbd[data-hint] {
			display: none;
		}
	}
</style>
