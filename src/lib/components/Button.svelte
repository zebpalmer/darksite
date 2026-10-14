<!--
@component
Button — every clickable action that is not a chip or a nav link.

Variants:
- `primary` — filled accent. One per view, right-most.
- `secondary` (default) — ds-bg-4 with a strong border. The alternative beside the primary.
- `ghost` — transparent, ds-text-2. A frequent low-risk toolbar action.
- `danger` — ghost in ds-danger-text. Irreversible, and always confirmed by a Dialog.
- `danger-solid` — filled ds-danger. Only the confirm button inside that Dialog.
- `icon` — square ghost; `label` is required (it becomes the aria-label and the title).

Sizes: `dense` 28 · `default` 32 · `comfy` 36 · `touch` 44. A coarse pointer always gets 44.

Props: `variant`, `size`, `icon` / `iconEnd`, `label`, `loading` + `loadingLabel`, `keycap` (also
sets `aria-keyshortcuts`), `href` (renders an `<a>`), `type` (default `button`), `disabled`,
`pressed` (`aria-pressed`), `full`, `class`, children, and any other attribute or handler.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	import KeyCap from './KeyCap.svelte';
	import Spinner from './Spinner.svelte';
	import type { ControlSize, IconComponent } from '../types.js';

	type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-solid' | 'icon';

	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
		variant?: Variant;
		size?: ControlSize;
		icon?: IconComponent;
		iconEnd?: IconComponent;
		label?: string;
		loading?: boolean;
		loadingLabel?: string;
		keycap?: string | readonly string[];
		href?: string;
		type?: 'button' | 'submit' | 'reset';
		disabled?: boolean;
		pressed?: boolean;
		full?: boolean;
		target?: string;
		rel?: string;
		class?: string;
		children?: Snippet;
	}

	let {
		variant = 'secondary',
		size = 'default',
		icon: Icon,
		iconEnd: IconEnd,
		label,
		loading = false,
		loadingLabel,
		keycap,
		href,
		type = 'button',
		disabled = false,
		pressed,
		full = false,
		class: className = '',
		children,
		...rest
	}: Props = $props();

	const iconSize = $derived(size === 'touch' || variant === 'icon' ? 18 : 16);
	const inert = $derived(disabled || loading);
	const shortcut = $derived(
		keycap === undefined ? undefined : (typeof keycap === 'string' ? [keycap] : [...keycap]).join(' ')
	);
</script>

<svelte:element
	this={href ? 'a' : 'button'}
	{...rest}
	href={href && !inert ? href : undefined}
	role={href && inert ? 'link' : undefined}
	type={href ? undefined : type}
	disabled={href ? undefined : inert}
	aria-disabled={href && inert ? 'true' : undefined}
	aria-busy={loading ? 'true' : undefined}
	aria-pressed={pressed === undefined ? undefined : pressed ? 'true' : 'false'}
	aria-label={variant === 'icon' ? (label ?? rest['aria-label']) : rest['aria-label']}
	aria-keyshortcuts={shortcut}
	title={rest.title ?? (variant === 'icon' ? label : undefined)}
	class="ds-btn {className}"
	class:full
	data-variant={variant}
	data-size={size}
>
	{#if loading}
		<Spinner size={iconSize} />
	{:else if Icon}
		<Icon size={iconSize} aria-hidden="true" />
	{/if}
	{#if variant !== 'icon'}
		{#if loading && loadingLabel}
			<span class="label">{loadingLabel}</span>
		{:else if children}
			<span class="label">{@render children()}</span>
		{:else if label}
			<span class="label">{label}</span>
		{/if}
	{/if}
	{#if IconEnd && !loading}
		<IconEnd size={iconSize} aria-hidden="true" />
	{/if}
	{#if keycap !== undefined && variant !== 'icon'}
		<KeyCap keys={keycap} decorative tone={variant === 'primary' ? 'primary' : 'default'} />
	{/if}
</svelte:element>

<style>
	.ds-btn {
		--h: var(--ds-h-default);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		flex: none;
		height: var(--h);
		min-width: 0;
		padding: 0 12px;
		border: 1px solid transparent;
		border-radius: var(--ds-radius-sm);
		background: transparent;
		color: var(--ds-text-1);
		font-family: var(--font-sans);
		font-size: var(--ds-text-sm);
		line-height: var(--ds-lh-sm);
		font-weight: 400;
		white-space: nowrap;
		text-decoration: none;
		cursor: pointer;
		user-select: none;
		transition:
			background-color var(--ds-dur-fast) var(--ds-ease-out),
			border-color var(--ds-dur-fast) var(--ds-ease-out),
			color var(--ds-dur-fast) var(--ds-ease-out);
	}
	.ds-btn[data-size='dense'] {
		--h: var(--ds-h-dense);
		padding: 0 10px;
		gap: 6px;
	}
	.ds-btn[data-size='comfy'] {
		--h: var(--ds-h-comfy);
		padding: 0 14px;
	}
	.ds-btn[data-size='touch'] {
		--h: var(--ds-h-touch);
		padding: 0 16px;
		font-size: var(--ds-text-md);
	}
	/* Touch pointers always get 44px, whatever size was asked for. The size rules above out-rank a
	   bare .ds-btn, so this matches them too. */
	@media (pointer: coarse) {
		.ds-btn,
		.ds-btn[data-size] {
			--h: var(--ds-h-touch);
		}
	}
	.full {
		width: 100%;
	}
	.label {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.ds-btn[data-variant='primary'] {
		background: var(--ds-accent);
		color: var(--ds-accent-contrast);
		font-weight: 500;
	}
	.ds-btn[data-variant='primary']:not(:disabled, [aria-disabled='true']):hover {
		background: var(--ds-accent-strong);
	}
	.ds-btn[data-variant='primary']:not(:disabled, [aria-disabled='true']):active {
		background: var(--ds-accent-text);
	}

	.ds-btn[data-variant='secondary'] {
		background: var(--ds-bg-4);
		border-color: var(--ds-border-strong);
	}
	.ds-btn[data-variant='secondary']:not(:disabled, [aria-disabled='true']):is(:hover, :active),
	.ds-btn[data-variant='secondary'][aria-pressed='true'] {
		background: var(--ds-bg-5);
	}

	.ds-btn:is([data-variant='ghost'], [data-variant='icon']) {
		color: var(--ds-text-2);
	}
	.ds-btn:is([data-variant='ghost'], [data-variant='icon']):not(:disabled, [aria-disabled='true']):hover {
		background: var(--ds-bg-4);
		color: var(--ds-text-1);
	}
	.ds-btn:is([data-variant='ghost'], [data-variant='icon']):not(:disabled, [aria-disabled='true']):active {
		background: var(--ds-bg-5);
		border-color: var(--ds-border);
	}
	.ds-btn:is([data-variant='ghost'], [data-variant='icon'])[aria-pressed='true'] {
		background: var(--ds-bg-4);
		color: var(--ds-text-1);
	}
	.ds-btn[data-variant='icon'] {
		width: var(--h);
		padding: 0;
	}

	.ds-btn[data-variant='danger'] {
		color: var(--ds-danger-text);
	}
	.ds-btn[data-variant='danger']:not(:disabled, [aria-disabled='true']):is(:hover, :active) {
		background: var(--ds-danger-tint);
	}

	.ds-btn[data-variant='danger-solid'] {
		background: var(--ds-danger);
		color: var(--ds-danger-contrast);
		font-weight: 500;
	}
	.ds-btn[data-variant='danger-solid']:not(:disabled, [aria-disabled='true']):hover {
		background: var(--ds-danger-strong);
	}

	.ds-btn:disabled,
	.ds-btn[aria-disabled='true'] {
		opacity: 0.45;
		cursor: not-allowed;
	}
	.ds-btn[aria-busy='true'] {
		opacity: 1;
		cursor: progress;
	}
</style>
