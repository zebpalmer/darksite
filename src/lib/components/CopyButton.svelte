<!--
@component
CopyButton — copies a string and says so: the label turns to "Copied" with a check for two seconds,
and a polite live region announces it, so a screen reader hears the result without losing focus.

It uses the Clipboard API, and without one (an insecure origin, an older browser, a denied
permission) falls back to selecting the text in a hidden field and copying that. If both fail, it
says "Copy failed" the same way and never throws.

Two forms:
- **Button** (default): a `Button` with a copy icon and its label — "Copy", "Copy link".
- **`inline`**: a 24px icon button to sit beside a mono value (an identifier, a hash, a command);
  `label` is its accessible name and tooltip ("Copy serial"). Its hit area grows to 44px on touch
  without moving the text around it.

- `value` (a string, or a function returning one, read at the moment of copying), `label`
  (default "Copy"), `copiedLabel` (default "Copied"), `inline`, `variant` (`secondary` | `ghost`,
  the button form), `size` (the button form), `resetAfter` (ms, default 2000), `oncopy(ok)`,
  `disabled`, `class`.
-->
<script lang="ts">
	import { strings } from '../strings.svelte.js';
	import Copy from '@lucide/svelte/icons/copy';
	import Check from '@lucide/svelte/icons/check';
	import X from '@lucide/svelte/icons/x';
	import Button from './Button.svelte';
	import { tooltip } from '../tooltip.js';
	import type { ControlSize } from '../types.js';

	interface Props {
		value: string | (() => string);
		label?: string;
		copiedLabel?: string;
		inline?: boolean;
		variant?: 'secondary' | 'ghost';
		size?: ControlSize;
		resetAfter?: number;
		oncopy?: (ok: boolean) => void;
		disabled?: boolean;
		class?: string;
	}

	let {
		value,
		label = strings.copy,
		copiedLabel = strings.copied,
		inline = false,
		variant = 'secondary',
		size = 'default',
		resetAfter = 2000,
		oncopy,
		disabled = false,
		class: className = ''
	}: Props = $props();

	let result = $state<'idle' | 'copied' | 'failed'>('idle');
	let timer: ReturnType<typeof setTimeout> | undefined;

	const shown = $derived(
		result === 'copied' ? copiedLabel : result === 'failed' ? strings.copyFailed : label
	);
	const Icon = $derived(result === 'copied' ? Check : result === 'failed' ? X : Copy);

	$effect(() => () => clearTimeout(timer));

	/** Copies by selecting the text in a hidden field: for a page without the Clipboard API. */
	function fallbackCopy(text: string, from: HTMLElement | null): boolean {
		const field = document.createElement('textarea');
		field.value = text;
		field.setAttribute('readonly', '');
		field.setAttribute('aria-hidden', 'true');
		field.style.position = 'fixed';
		field.style.top = '0';
		field.style.left = '0';
		field.style.opacity = '0';
		// Inside an open modal dialog the field has to live there, or it cannot be selected.
		(from?.closest('dialog') ?? document.body).append(field);
		field.select();
		let ok = false;
		try {
			ok = document.execCommand('copy');
		} catch {
			ok = false;
		}
		field.remove();
		from?.focus();
		return ok;
	}

	async function copy(event: MouseEvent) {
		const from = event.currentTarget instanceof HTMLElement ? event.currentTarget : null;
		const text = typeof value === 'function' ? value() : value;
		let ok = false;
		try {
			if (navigator.clipboard?.writeText) {
				await navigator.clipboard.writeText(text);
				ok = true;
			}
		} catch {
			ok = false;
		}
		if (!ok) ok = fallbackCopy(text, from);
		result = ok ? 'copied' : 'failed';
		oncopy?.(ok);
		clearTimeout(timer);
		timer = setTimeout(() => (result = 'idle'), resetAfter);
	}
</script>

<span class="ds-copy {className}" data-result={result}>
	{#if inline}
		<button
			type="button"
			class="inline"
			aria-label={shown}
			{disabled}
			onclick={copy}
			{@attach tooltip(shown)}
		>
			<Icon size={16} aria-hidden="true" />
		</button>
	{:else}
		<Button {variant} {size} icon={Icon} {disabled} onclick={copy}>{shown}</Button>
	{/if}
	<span class="ds-sr-only" aria-live="polite">{result === 'idle' ? '' : shown}</span>
</span>

<style>
	.ds-copy {
		display: inline-flex;
		flex: none;
		vertical-align: middle;
	}
	.inline {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		margin: 0;
		padding: 0;
		border: 0;
		border-radius: var(--ds-radius-xs);
		background: transparent;
		color: var(--ds-text-3);
		cursor: pointer;
		transition:
			background-color var(--ds-dur-fast) var(--ds-ease-out),
			color var(--ds-dur-fast) var(--ds-ease-out);
	}
	.inline:hover:not(:disabled) {
		background: var(--ds-bg-4);
		color: var(--ds-text-1);
	}
	.inline:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}
	[data-result='copied'] .inline {
		color: var(--ds-success-text);
	}
	[data-result='failed'] .inline {
		color: var(--ds-danger-text);
	}
	/* A 44px hit area on touch, without moving the value beside it. */
	@media (pointer: coarse) {
		.inline::before {
			content: '';
			position: absolute;
			inset: -10px;
		}
	}
</style>
