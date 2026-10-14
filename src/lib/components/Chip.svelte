<!--
@component
Chip — toggle a value, show an applied token or an active filter, or offer a suggestion. 28px
tall, 44 on touch (with an 8px gap between chips there).

Modes, picked by props:
- **toggle** — `selected` (`true` | `false` | `'mixed'`) with `onclick`: a `<button aria-pressed>`.
  Off is ds-bg-3 with a ds-border edge; on is ds-accent-tint with a ds-accent edge; mixed (only
  some of a bulk selection have it) takes a ds-accent-mixed edge.
- **removable** — `removable` with `onremove` and `removeLabel`: the label plus its own × button
  (22px, 32 on touch). `variant="token"` is the applied-token look. With `onclick` as well, the
  label becomes a second button beside the ×.
- **suggestion** — `suggestion`, with `source` and `confidence`: a dashed edge, a `+` icon and a
  SourceBadge. Dashed always means "suggested, not applied". `isNew` adds a NewBadge and an accent
  dashed edge, for a value that exists nowhere yet.
- **static** — none of the above.

Extras: `keycap`, `count`, `icon`, `disabled`, `title`, `tone="warning"` (a value that fails a
rule), `bodyProps` (spread onto the label button, so it can trigger a Popover or Menu).
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import Plus from '@lucide/svelte/icons/plus';
	import X from '@lucide/svelte/icons/x';

	import KeyCap from './KeyCap.svelte';
	import NewBadge from './NewBadge.svelte';
	import SourceBadge from './SourceBadge.svelte';
	import type { IconComponent } from '../types.js';

	interface Props {
		selected?: boolean | 'mixed';
		onclick?: (event: MouseEvent) => void;
		removable?: boolean;
		onremove?: () => void;
		removeLabel?: string;
		suggestion?: boolean;
		isNew?: boolean;
		source?: string;
		confidence?: number | null;
		variant?: 'default' | 'token';
		tone?: 'default' | 'warning';
		keycap?: string | readonly string[];
		count?: number | string | null;
		icon?: IconComponent;
		disabled?: boolean;
		title?: string;
		bodyProps?: Record<string, unknown>;
		class?: string;
		children?: Snippet;
	}

	let {
		selected,
		onclick,
		removable = false,
		onremove,
		removeLabel,
		suggestion = false,
		isNew = false,
		source,
		confidence = null,
		variant = 'default',
		tone = 'default',
		keycap,
		count = null,
		icon: Icon,
		disabled = false,
		title,
		bodyProps,
		class: className = '',
		children
	}: Props = $props();

	const interactive = $derived(!removable && (onclick !== undefined || selected !== undefined || suggestion));
	const state = $derived(
		suggestion ? 'suggested' : selected === 'mixed' ? 'mixed' : selected ? 'on' : 'off'
	);
	const shortcut = $derived(
		keycap === undefined ? undefined : (typeof keycap === 'string' ? [keycap] : [...keycap]).join(' ')
	);
	const pressed = $derived(
		suggestion || selected === undefined ? undefined : selected === 'mixed' ? 'mixed' : selected ? 'true' : 'false'
	);
</script>

{#snippet body()}
	{#if keycap !== undefined}<KeyCap keys={keycap} decorative />{/if}
	{#if suggestion}<Plus size={13} aria-hidden="true" />{:else if Icon}<Icon size={14} aria-hidden="true" />{/if}
	<span class="label">{@render children?.()}</span>
	{#if isNew}<NewBadge />{/if}
	{#if count !== null && count !== undefined}<span class="count">{count}</span>{/if}
	{#if suggestion && source}<SourceBadge {source} {confidence} variant="suggestion" />{/if}
{/snippet}

{#if interactive}
	<button
		type="button"
		class="ds-chip {className}"
		data-state={state}
		data-variant={variant}
		data-tone={tone === 'default' ? undefined : tone}
		data-new={isNew ? '' : undefined}
		aria-pressed={pressed}
		aria-keyshortcuts={shortcut}
		{disabled}
		{title}
		{onclick}
	>
		{@render body()}
	</button>
{:else}
	<span
		class="ds-chip {className}"
		data-state={state}
		data-variant={variant}
		data-tone={tone === 'default' ? undefined : tone}
		data-static=""
		aria-disabled={disabled ? 'true' : undefined}
		title={removable && (onclick || bodyProps) ? undefined : title}
	>
		{#if removable && (onclick || bodyProps)}
			<button type="button" class="body" {disabled} {title} aria-keyshortcuts={shortcut} {onclick} {...bodyProps}>
				{@render body()}
			</button>
		{:else}
			{@render body()}
		{/if}
		{#if removable}
			<button type="button" class="remove" aria-label={removeLabel ?? 'Remove'} {disabled} onclick={() => onremove?.()}>
				<X size={13} aria-hidden="true" />
			</button>
		{/if}
	</span>
{/if}

<style>
	.ds-chip {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		flex: none;
		max-width: 100%;
		height: var(--ds-h-dense);
		padding: 0 8px;
		border: 1px solid var(--ds-border);
		border-radius: var(--ds-radius-sm);
		background: var(--ds-bg-3);
		color: var(--ds-text-2);
		font-family: var(--font-sans);
		font-size: var(--ds-text-sm);
		line-height: var(--ds-lh-sm);
		white-space: nowrap;
		transition:
			background-color var(--ds-dur-fast) var(--ds-ease-out),
			border-color var(--ds-dur-fast) var(--ds-ease-out),
			color var(--ds-dur-fast) var(--ds-ease-out);
	}
	@media (pointer: coarse) {
		.ds-chip {
			height: var(--ds-h-touch);
			padding: 0 12px;
		}
	}
	button.ds-chip {
		cursor: pointer;
	}
	button.ds-chip:not(:disabled):hover {
		background: var(--ds-bg-4);
		border-color: var(--ds-border-strong);
		color: var(--ds-text-1);
	}
	.ds-chip[data-state='on'] {
		background: var(--ds-accent-tint);
		border-color: var(--ds-accent);
		color: var(--ds-text-1);
	}
	button.ds-chip[data-state='on']:not(:disabled):hover {
		background: var(--ds-accent-tint-hover);
		border-color: var(--ds-accent-strong);
	}
	.ds-chip[data-state='mixed'] {
		border-color: var(--ds-accent-mixed);
		color: var(--ds-text-1);
	}
	.ds-chip[data-state='suggested'] {
		border-style: dashed;
		border-color: var(--ds-border-strong);
		background: transparent;
	}
	.ds-chip[data-state='suggested'][data-new] {
		border-color: var(--ds-accent);
	}
	.ds-chip[data-variant='token'] {
		background: var(--ds-bg-5);
		border-color: transparent;
		color: var(--ds-text-1);
	}
	.ds-chip[data-static][data-state='off']:not([data-variant='token']) {
		color: var(--ds-text-1);
	}
	.ds-chip[data-tone='warning'][data-state][data-variant] {
		background: var(--ds-warning-tint);
		border-color: var(--ds-warning);
		color: var(--ds-warning-text);
	}
	.ds-chip[data-tone='warning'] .count {
		color: var(--ds-warning-text);
	}
	.ds-chip:disabled,
	.ds-chip[aria-disabled='true'] {
		opacity: 0.45;
		cursor: not-allowed;
	}
	.body {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		min-width: 0;
		padding: 0;
		border: 0;
		background: transparent;
		color: inherit;
		font: inherit;
		cursor: pointer;
	}
	.label {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.count {
		color: var(--ds-text-3);
		font-size: var(--ds-text-xs);
		font-variant-numeric: tabular-nums;
	}
	.remove {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex: none;
		width: 22px;
		height: 22px;
		margin-right: -4px;
		padding: 0;
		border: 0;
		border-radius: var(--ds-radius-xs);
		background: transparent;
		color: var(--ds-text-3);
		cursor: pointer;
	}
	.remove:hover {
		background: var(--ds-bg-5);
		color: var(--ds-text-1);
	}
	@media (pointer: coarse) {
		.remove {
			width: 32px;
			height: 32px;
		}
	}
</style>
