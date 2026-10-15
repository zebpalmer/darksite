<!--
@component
Dialog — confirmations only: a question that blocks the action the user just asked for. Not for
forms (Sheet) or information (Popover). A native modal dialog with `role="alertdialog"`: focus is
trapped, Esc cancels, the page cannot scroll, and focus returns to the trigger. The content mounts
only while open. On phones it presents as a bottom sheet.

- `open` (bindable), `title`, `description` (the consequence), children (extra body).
- `confirmLabel`, `confirmingLabel` (while an async `onconfirm` runs), `cancelLabel`.
- `tone` — `danger` (default; a filled danger confirm) or `default` (primary).
- `onconfirm()` may return a value or a promise: the dialog closes when it resolves and shows the
  error if it throws. `oncancel()`.
- `dirty` — the body holds unsaved input; read app-wide as `modals.dirty`. `onbeforeclose()` runs
  before Esc, the scrim or Cancel closes it; return `false` to keep it open.
- `initialFocus` (`cancel` default | `confirm` | `content`), `finalFocus` (an element to focus on
  close instead of the trigger), `showConfirm`, `confirmDisabled`, `size` (`default` 400 | `wide`).
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { tick } from 'svelte';
	import CircleAlert from '@lucide/svelte/icons/circle-alert';

	import Button from './Button.svelte';
	import { trackModal } from '../layers.svelte.js';

	interface Props {
		open?: boolean;
		title: string;
		description?: string;
		confirmLabel?: string;
		confirmingLabel?: string;
		cancelLabel?: string;
		tone?: 'danger' | 'default';
		onconfirm?: () => unknown;
		oncancel?: () => void;
		dirty?: boolean;
		onbeforeclose?: () => boolean | void;
		initialFocus?: 'cancel' | 'confirm' | 'content';
		finalFocus?: HTMLElement | null;
		showConfirm?: boolean;
		confirmDisabled?: boolean;
		size?: 'default' | 'wide';
		class?: string;
		children?: Snippet;
	}

	let {
		open = $bindable(false),
		title,
		description,
		confirmLabel = 'Confirm',
		confirmingLabel,
		cancelLabel = 'Cancel',
		tone = 'danger',
		onconfirm,
		oncancel,
		dirty = false,
		onbeforeclose,
		initialFocus = 'cancel',
		finalFocus = null,
		showConfirm = true,
		confirmDisabled = false,
		size = 'default',
		class: className = '',
		children
	}: Props = $props();

	const uid = $props.id();
	let busy = $state(false);
	let error = $state<string | null>(null);

	function finish() {
		open = false;
		busy = false;
	}

	// `force`: the browser will close the dialog anyway (a repeated Esc is not cancelable), so the
	// state follows it rather than drifting out of sync.
	function cancel(force = false) {
		if (!force && (busy || onbeforeclose?.() === false)) return;
		finish();
		oncancel?.();
	}

	async function confirm() {
		if (busy || confirmDisabled) return;
		error = null;
		const result = onconfirm?.();
		if (!isThenable(result)) return finish();
		busy = true;
		try {
			await result;
			finish();
		} catch (e) {
			busy = false;
			error = e instanceof Error ? e.message : String(e);
		}
	}

	function isThenable(value: unknown): value is PromiseLike<unknown> {
		return typeof (value as PromiseLike<unknown> | null)?.then === 'function';
	}

	function surface(dialog: HTMLDialogElement) {
		const returnTo = document.activeElement as HTMLElement | null;
		error = null;
		try {
			dialog.showModal();
		} catch {
			dialog.setAttribute('open', '');
		}
		const untrack = trackModal(dialog, { dirty: () => dirty });
		const root = document.documentElement;
		const previous = root.style.overflow;
		root.style.overflow = 'hidden';
		tick().then(() => {
			const target =
				initialFocus === 'content'
					? dialog
					: dialog.querySelector<HTMLElement>(`[data-role='${initialFocus}']`);
			(target ?? dialog).focus();
		});
		return () => {
			untrack();
			root.style.overflow = previous;
			if (typeof dialog.close === 'function') dialog.close();
			(finalFocus ?? returnTo)?.focus?.();
		};
	}
</script>

{#if open}
	<dialog
		class="ds-dialog {className}"
		data-size={size}
		role="alertdialog"
		aria-modal="true"
		aria-labelledby="{uid}-title"
		aria-describedby={description ? `${uid}-desc` : undefined}
		tabindex="-1"
		oncancel={(e) => {
			e.preventDefault();
			cancel(!e.cancelable);
		}}
		onclick={(e) => e.target === e.currentTarget && cancel()}
		{@attach surface}
	>
		<div class="panel">
			<h2 id="{uid}-title" class="title">{title}</h2>
			{#if description}<p id="{uid}-desc" class="desc">{description}</p>{/if}
			{#if children}<div class="body">{@render children()}</div>{/if}
			{#if error}
				<p class="error" role="alert"><CircleAlert size={14} aria-hidden="true" />{error}</p>
			{/if}
			<div class="actions">
				<Button data-role="cancel" disabled={busy} onclick={() => cancel()}>{cancelLabel}</Button>
				{#if showConfirm}
					<Button
						data-role="confirm"
						variant={tone === 'danger' ? 'danger-solid' : 'primary'}
						loading={busy}
						loadingLabel={confirmingLabel}
						disabled={confirmDisabled}
						onclick={confirm}
					>
						{busy && confirmingLabel ? confirmingLabel : confirmLabel}
					</Button>
				{/if}
			</div>
		</div>
	</dialog>
{/if}

<style>
	/* The dialog element stays untransformed so a fixed element moved into it (the Toaster)
	   still positions against the viewport; the panel carries the surface and the motion. */
	.ds-dialog {
		--dialog-max: calc(100dvh - 64px);
		width: min(400px, calc(100vw - 32px));
		max-width: none;
		max-height: var(--dialog-max);
		margin: auto;
		padding: 0;
		overflow: visible;
		border: 0;
		background: transparent;
		color: var(--ds-text-1);
	}
	.ds-dialog[data-size='wide'] {
		width: min(1040px, calc(100vw - 32px));
	}
	.ds-dialog:focus {
		outline: none;
	}
	.ds-dialog::backdrop {
		background: var(--ds-scrim);
	}
	.panel {
		display: flex;
		flex-direction: column;
		gap: 10px;
		box-sizing: border-box;
		max-height: var(--dialog-max);
		padding: 16px;
		overflow: auto;
		border: 1px solid var(--ds-border-subtle);
		border-radius: var(--ds-radius-lg);
		background: var(--ds-bg-3);
		box-shadow: var(--ds-elev-3);
		animation: ds-pop var(--ds-dur-base) var(--ds-ease-out);
	}
	.title {
		margin: 0;
		font-size: var(--ds-text-lg);
		line-height: var(--ds-lh-lg);
		font-weight: 500;
	}
	.desc {
		margin: 0;
		color: var(--ds-text-2);
		font-size: var(--ds-text-md);
		line-height: var(--ds-lh-md);
	}
	.error {
		display: flex;
		align-items: center;
		gap: 6px;
		margin: 0;
		color: var(--ds-danger-text);
		font-size: var(--ds-text-sm);
	}
	.actions {
		display: flex;
		justify-content: flex-end;
		gap: 8px;
		margin-top: 6px;
	}
	@media (max-width: 767.98px) {
		.ds-dialog,
		.ds-dialog[data-size='wide'] {
			--dialog-max: 85dvh;
			width: 100%;
			margin: auto 0 0;
		}
		.panel {
			padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));
			border-radius: var(--ds-radius-lg) var(--ds-radius-lg) 0 0;
			animation: ds-rise var(--ds-dur-base) var(--ds-ease-out);
		}
		.actions {
			flex-direction: column-reverse;
		}
		.actions :global(.ds-btn) {
			width: 100%;
		}
	}
</style>
