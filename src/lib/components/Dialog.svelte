<!--
@component
Dialog — confirmations only: a question that blocks the action the user just asked for. Not for
forms (Sheet) or information (Popover). The one exception is `size="hero"`: a welcome or sign-up
moment, centered and roomier, with a sentence or two and at most a short form. A native modal dialog — `role="alertdialog"` for a danger question, `role="dialog"` for a
default-tone one or one that asks for a note (`role` overrides): focus is
trapped, Esc cancels, the page cannot scroll, and focus returns to the trigger. The content mounts
only while open. On phones it presents as a bottom sheet.

- `open` (bindable), `title`, `description` (the consequence), children (extra body).
- `confirmLabel`, `confirmingLabel` (while an async `onconfirm` runs), `cancelLabel`.
- `tone` — `danger` (default; a filled danger confirm) or `default` (primary; the default for a
  hero).
- `onconfirm()` may return a value or a promise: the dialog closes when it resolves and shows the
  error if it throws. `oncancel()`.
- `dirty` — the body holds unsaved input; read app-wide as `modals.dirty`. `onbeforeclose()` runs
  before Esc, the scrim or Cancel closes it; return `false` to keep it open.
- `initialFocus` (`cancel` default | `confirm` | `field` | `content`), `finalFocus` (an element to
  focus on close instead of the trigger), `showConfirm`, `confirmDisabled`, `size` (`default` 400 |
  `wide` | `hero` 520, centered, a bottom sheet with a grab handle on phones).
- The hero only: `mark` snippet (an icon or logo, centered above the title; decorative and
  `aria-hidden` unless `markLabel` names it, which makes it an image), and stacked full-width
  actions on every viewport — the primary on top, a quiet ghost Cancel under it.

The panel is a `<form>` whose submit is the confirm button, so a confirmation that asks for a short
note or reason holds one or two Fields in its children: Enter in a single-line field confirms
(unless `confirmDisabled`), `initialFocus="field"` starts in the first one, and `confirmDisabled`
waits until the note is valid. Buttons in children must be `type="button"` (Button's default).
-->
<script lang="ts">
	import { strings } from '../strings.svelte.js';
	import type { Snippet } from 'svelte';
	import { tick } from 'svelte';
	import CircleAlert from '@lucide/svelte/icons/circle-alert';

	import Button from './Button.svelte';
	import { trackModal } from '../layers.svelte.js';

	interface Props {
		/** `alertdialog` interrupts with a danger question; `dialog` suits a default-tone confirmation or
		 *  one that asks for a note. Default: follows `tone` and `initialFocus`. */
		role?: 'alertdialog' | 'dialog';
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
		initialFocus?: 'cancel' | 'confirm' | 'field' | 'content';
		finalFocus?: HTMLElement | null;
		showConfirm?: boolean;
		confirmDisabled?: boolean;
		/** `hero`: a welcome or sign-up moment, 520px, centered, with more room. */
		size?: 'default' | 'wide' | 'hero';
		/** The hero only: an icon or logo centered above the title. Other sizes ignore it. */
		mark?: Snippet;
		/** Names the mark, which is then an image; without it the mark is decorative. */
		markLabel?: string;
		class?: string;
		children?: Snippet;
	}

	let {
		role,
		open = $bindable(false),
		title,
		description,
		confirmLabel = strings.confirm,
		confirmingLabel,
		cancelLabel = strings.cancel,
		tone: toneProp,
		onconfirm,
		oncancel,
		dirty = false,
		onbeforeclose,
		initialFocus = 'cancel',
		finalFocus = null,
		showConfirm = true,
		confirmDisabled = false,
		size = 'default',
		mark,
		markLabel,
		class: className = '',
		children
	}: Props = $props();

	let pressedScrim = false;
	const hero = $derived(size === 'hero');
	const tone = $derived(toneProp ?? (size === 'hero' ? 'default' : 'danger'));
	const dialogRole = $derived(
		role ?? (tone === 'danger' && initialFocus !== 'field' ? 'alertdialog' : 'dialog')
	);
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
					: initialFocus === 'field'
						? dialog.querySelector<HTMLElement>(
								'.body :is(input, textarea, select):not(:disabled, [type="hidden"])'
							)
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

{#snippet cancelButton()}
	<Button
		data-role="cancel"
		variant={hero ? 'ghost' : 'secondary'}
		size={hero ? 'comfy' : 'default'}
		disabled={busy}
		onclick={() => cancel()}>{cancelLabel}</Button
	>
{/snippet}

{#if open}
	<dialog
		class="ds-dialog {className}"
		data-size={size}
		role={dialogRole}
		aria-modal="true"
		aria-labelledby="{uid}-title"
		aria-describedby={description ? `${uid}-desc` : undefined}
		tabindex="-1"
		oncancel={(e) => {
			e.preventDefault();
			cancel(!e.cancelable);
		}}
		onpointerdown={(e) => (pressedScrim = e.target === e.currentTarget)}
		onclick={(e) => {
			if (pressedScrim && e.target === e.currentTarget) cancel();
			pressedScrim = false;
		}}
		{@attach surface}
	>
		<form
			class="panel"
			novalidate
			onsubmit={(e) => {
				e.preventDefault();
				if (showConfirm) confirm();
			}}
		>
			{#if hero}<span class="grab" aria-hidden="true"></span>{/if}
			{#if hero && mark}
				<div
					class="mark"
					role={markLabel ? 'img' : undefined}
					aria-label={markLabel || undefined}
					aria-hidden={markLabel ? undefined : 'true'}
				>
					{@render mark()}
				</div>
			{/if}
			<h2 id="{uid}-title" class="title">{title}</h2>
			{#if description}<p id="{uid}-desc" class="desc">{description}</p>{/if}
			{#if children}<div class="body">{@render children()}</div>{/if}
			{#if error}
				<p class="error" role="alert"><CircleAlert size={14} aria-hidden="true" />{error}</p>
			{/if}
			<!-- A hero reads top to bottom, the primary first, so its DOM order is the visual one. -->
			<div class="actions">
				{#if !hero}{@render cancelButton()}{/if}
				{#if showConfirm}
					<Button
						data-role="confirm"
						type="submit"
						variant={tone === 'danger' ? 'danger-solid' : 'primary'}
						size={hero ? 'comfy' : 'default'}
						loading={busy}
						loadingLabel={confirmingLabel}
						disabled={confirmDisabled}
					>
						{busy && confirmingLabel ? confirmingLabel : confirmLabel}
					</Button>
				{/if}
				{#if hero}{@render cancelButton()}{/if}
			</div>
		</form>
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
	.ds-dialog[data-size='hero'] {
		width: min(520px, calc(100vw - 32px));
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
		color: var(--ds-text-heading, var(--ds-text-1));
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
	/* The hero: more room, a larger title, and the heading, sentence and actions centered. A form in
	   the body keeps its labels on the left. */
	[data-size='hero'] .panel {
		gap: 12px;
		padding: 32px;
	}
	[data-size='hero'] .title {
		font-size: var(--ds-text-2xl);
		line-height: var(--ds-lh-2xl);
		text-align: center;
	}
	[data-size='hero'] .desc {
		font-size: var(--ds-text-lg);
		line-height: var(--ds-lh-lg);
		text-align: center;
	}
	[data-size='hero'] .body {
		margin-top: 8px;
	}
	/* A hero's mark: an icon or logo, centered, sized by the consumer. */
	.mark {
		display: flex;
		justify-content: center;
		margin-bottom: 4px;
		color: var(--ds-text-2);
		line-height: 0;
	}
	/* A hero's actions stack full width on every viewport: the primary on top, the quiet ghost
	   Cancel under it, as a sign-up moment reads. */
	[data-size='hero'] .actions {
		flex-direction: column;
		gap: 4px;
		margin-top: 12px;
	}
	[data-size='hero'] .actions :global(.ds-btn) {
		width: 100%;
	}
	.grab {
		display: none;
	}
	@media (max-width: 767.98px) {
		.ds-dialog,
		.ds-dialog[data-size='wide'],
		.ds-dialog[data-size='hero'] {
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
		/* A hero on a phone is the Sheet's bottom sheet: a grab handle, the slower rise. */
		[data-size='hero'] .panel {
			padding: 0 20px calc(24px + env(safe-area-inset-bottom, 0px));
			animation-duration: var(--ds-dur-slow);
		}
		[data-size='hero'] .title {
			font-size: var(--ds-text-xl);
			line-height: var(--ds-lh-xl);
		}
		.grab {
			display: block;
			align-self: center;
			flex: none;
			width: 36px;
			height: 4px;
			margin: 8px 0 4px;
			border-radius: 2px;
			background: var(--ds-border-strong);
		}
	}
</style>
