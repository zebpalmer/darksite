<!--
@component
Sheet — the bottom sheet: filters, sort, and every choice on touch. `side="right"` is the edit
drawer (440px, full height) from 768px up, and still a bottom sheet below that.

Built on the native modal `<dialog>`: focus is trapped inside, Esc closes, the page behind cannot
be reached, and focus returns to where it was. A press on the scrim closes it too. The page
behind does not scroll while it is open.

- `dirty` — the sheet holds unsaved edits; read app-wide as `modals.dirty`. `onbeforeclose()` runs
  before Esc, the scrim or the close button closes it; return `false` to keep it open.
- `open` (bindable), `title` (the heading and accessible name), `description`, `onclose()`,
  `footer` snippet (a right-aligned row: secondary actions, then the primary, last), `maxHeight`
  (default `78dvh`), `side` (`bottom` | `right`), children (the body, which scrolls).
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import X from '@lucide/svelte/icons/x';
	import Button from './Button.svelte';
	import { trackModal } from '../layers.svelte.js';

	interface Props {
		open?: boolean;
		title: string;
		description?: string;
		onclose?: () => void;
		dirty?: boolean;
		onbeforeclose?: () => boolean | void;
		footer?: Snippet;
		maxHeight?: string;
		side?: 'bottom' | 'right';
		class?: string;
		children: Snippet;
	}

	let {
		open = $bindable(false),
		title,
		description,
		onclose,
		dirty = false,
		onbeforeclose,
		footer,
		maxHeight = '78dvh',
		side = 'bottom',
		class: className = '',
		children
	}: Props = $props();

	let pressedScrim = false;
	const uid = $props.id();

	// `force`: the browser will close the dialog anyway (a repeated Esc is not cancelable), so the
	// state follows it rather than drifting out of sync.
	function close(force = false) {
		if (!open || (!force && onbeforeclose?.() === false)) return;
		open = false;
		onclose?.();
	}

	function surface(dialog: HTMLDialogElement) {
		try {
			dialog.showModal();
		} catch {
			dialog.setAttribute('open', '');
		}
		const untrack = trackModal(dialog, { dirty: () => dirty });
		const root = document.documentElement;
		const previous = root.style.overflow;
		root.style.overflow = 'hidden';
		return () => {
			untrack();
			root.style.overflow = previous;
			if (typeof dialog.close === 'function') dialog.close();
		};
	}
</script>

{#if open}
	<dialog
		{@attach surface}
		class="ds-sheet {className}"
		data-side={side}
		style:--sheet-max={maxHeight}
		aria-labelledby="{uid}-title"
		aria-describedby={description ? `${uid}-desc` : undefined}
		oncancel={(event) => {
			event.preventDefault();
			close(!event.cancelable);
		}}
		onpointerdown={(event) => (pressedScrim = event.target === event.currentTarget)}
		onclick={(event) => {
			// Only a press that starts and ends on the scrim closes: a text selection dragged out of
			// the panel ends on the dialog element too.
			if (pressedScrim && event.target === event.currentTarget) close();
			pressedScrim = false;
		}}
	>
		<div class="panel">
			<span class="grab" aria-hidden="true"></span>
			<div class="head">
				<h2 id="{uid}-title">{title}</h2>
				<Button variant="icon" label="Close" icon={X} onclick={() => close()} />
			</div>
			{#if description}<p id="{uid}-desc" class="desc">{description}</p>{/if}
			<div class="body">{@render children()}</div>
			{#if footer}<div class="foot">{@render footer()}</div>{/if}
		</div>
	</dialog>
{/if}

<style>
	.ds-sheet {
		position: fixed;
		inset: auto 0 0 0;
		width: min(640px, 100%);
		max-width: 100%;
		max-height: var(--sheet-max);
		margin: 0 auto;
		padding: 0;
		overflow: visible;
		border: 0;
		background: transparent;
		color: var(--ds-text-1);
	}
	.ds-sheet::backdrop {
		background: var(--ds-scrim);
		animation: ds-fade var(--ds-dur-base) var(--ds-ease-out);
	}
	/* The dialog element stays untransformed so a fixed element moved into it (the Toaster)
	   still positions against the viewport; the panel carries the surface and the motion. */
	.panel {
		display: flex;
		flex-direction: column;
		max-height: var(--sheet-max);
		padding-bottom: env(safe-area-inset-bottom, 0px);
		border-radius: var(--ds-radius-lg) var(--ds-radius-lg) 0 0;
		background: var(--ds-bg-3);
		box-shadow: var(--ds-elev-3);
		animation: ds-rise var(--ds-dur-slow) var(--ds-ease-out);
	}
	.grab {
		align-self: center;
		flex: none;
		width: 36px;
		height: 4px;
		margin-top: 8px;
		border-radius: 2px;
		background: var(--ds-border-strong);
	}
	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		flex: none;
		padding: 4px 8px 4px 16px;
	}
	h2 {
		margin: 0;
		font-size: var(--ds-text-lg);
		line-height: var(--ds-lh-lg);
		font-weight: 500;
	}
	.desc {
		margin: 0;
		padding: 0 16px 8px;
		color: var(--ds-text-2);
		font-size: var(--ds-text-sm);
	}
	.body {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		overscroll-behavior: contain;
		padding: 0 16px 16px;
	}
	.foot {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 8px;
		flex: none;
		padding: 12px 16px;
		border-top: 1px solid var(--ds-border-subtle);
	}
	@media (min-width: 768px) {
		.ds-sheet[data-side='right'] {
			inset: 0 0 0 auto;
			width: min(440px, 100%);
			height: 100%;
			max-height: none;
			margin: 0;
		}
		.ds-sheet[data-side='right'] .panel {
			height: 100%;
			max-height: none;
			border-radius: var(--ds-radius-lg) 0 0 var(--ds-radius-lg);
			animation: ds-slide-in-right var(--ds-dur-slow) var(--ds-ease-out);
		}
		.ds-sheet[data-side='right'] .grab {
			display: none;
		}
	}
	@keyframes ds-slide-in-right {
		from {
			transform: translateX(100%);
		}
	}
</style>
