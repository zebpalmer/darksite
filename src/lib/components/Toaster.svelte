<!--
@component
Toaster — renders the toast queue. Mount it once (AppShell does); pages call `toasts.push(...)`,
`toasts.success(...)`, `toasts.error(...)`.

Each toast is ds-bg-4 with ds-elev-2: a tone icon, the message and, with an action, an action
button with its key cap, an m:ss countdown and a 2px accent bar draining over its life. Never more
than two. Bottom-right at 380px, lifted above the phone tab bar and any ActionBar; full width above
the tab bar on phones. Each toast is a live region — `status` for results, `alert` for failures —
and its timing pauses while it is hovered or focused. A toast's key cap works as a hotkey while it
shows, except while the user is typing or when another handler already took the key
(`defaultPrevented`); `hotkeys={false}` turns the binding off and keeps the cap.

While a Dialog or Sheet is open the queue moves into it (`topmost`), so a toast stays visible and
usable above the modal instead of turning inert behind it. `topmost={false}` opts out.
-->
<script lang="ts">
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import CircleAlert from '@lucide/svelte/icons/circle-alert';
	import Info from '@lucide/svelte/icons/info';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import X from '@lucide/svelte/icons/x';

	import KeyCap from './KeyCap.svelte';
	import { isTypingTarget, matchesKey } from '../keycap.js';
	import { topmost as toTopmost } from '../layers.svelte.js';
	import { toasts, type Toast, type ToastStore } from '../toast.svelte.js';

	interface Props {
		store?: ToastStore;
		/** Run a toast's action from its key cap. The cap still shows when this is off. */
		hotkeys?: boolean;
		/** Keep the queue usable above an open modal by moving it into the modal. */
		topmost?: boolean;
	}

	let { store = toasts, hotkeys = true, topmost = true }: Props = $props();

	let now = $state(Date.now());
	$effect(() => {
		if (!store.items.some((t) => t.countdown)) return;
		const timer = setInterval(() => (now = Date.now()), 250);
		return () => clearInterval(timer);
	});

	const left = (t: Toast) => (t.deadline === null ? t.remaining : Math.max(0, t.deadline - now));
	const share = (t: Toast) => (t.duration ? (left(t) / t.duration) * 100 : 0);
	const clock = (ms: number) => {
		const s = Math.ceil(ms / 1000);
		return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
	};
	const icons = { info: Info, success: CircleCheck, warning: TriangleAlert, error: CircleAlert };

	function run(t: Toast) {
		t.action?.onAction();
		store.dismiss(t.id);
	}

	function onkeydown(event: KeyboardEvent) {
		if (!hotkeys || event.defaultPrevented || isTypingTarget(event.target)) return;
		const t = [...store.items].reverse().find((x) => x.action?.keycap && matchesKey(event, x.action.keycap));
		if (t) {
			event.preventDefault();
			run(t);
		}
	}
</script>

<svelte:window {onkeydown} />

<!-- The queue travels into an open modal; this wrapper keeps its place in the page. -->
<div class="ds-toaster-home">
	<ol class="ds-toaster" aria-label="Notifications" {@attach topmost ? toTopmost : undefined}>
		{#each store.items as t (t.id)}
			{@const Icon = icons[t.tone]}
			<li
				class="toast"
				data-tone={t.tone}
				role={t.tone === 'error' ? 'alert' : 'status'}
				onmouseenter={() => store.pause(t.id)}
				onmouseleave={() => store.resume(t.id)}
				onfocusin={() => store.pause(t.id)}
				onfocusout={() => store.resume(t.id)}
			>
				<div class="row">
					<span class="icon"><Icon size={16} aria-hidden="true" /></span>
					<span class="msg">{t.message}</span>
					{#if t.countdown}<span class="countdown" aria-hidden="true">{clock(left(t))}</span>{/if}
					{#if t.action}
						<button type="button" class="action" aria-keyshortcuts={t.action.keycap} onclick={() => run(t)}>
							{t.action.label}
							{#if t.action.keycap}<KeyCap keys={t.action.keycap} decorative />{/if}
						</button>
					{/if}
					<button type="button" class="close" aria-label="Dismiss" onclick={() => store.dismiss(t.id)}>
						<X size={14} aria-hidden="true" />
					</button>
				</div>
				{#if t.countdown}
					<div class="track" aria-hidden="true"><div class="bar" style:width="{share(t)}%"></div></div>
				{/if}
			</li>
		{/each}
	</ol>
</div>

<style>
	.ds-toaster-home {
		display: contents;
	}
	.ds-toaster {
		position: fixed;
		right: 16px;
		bottom: calc(16px + var(--ds-chrome-bottom, 0px) + var(--ds-actionbar-space, 0px));
		z-index: var(--ds-z-toast);
		display: flex;
		flex-direction: column;
		gap: 8px;
		width: min(380px, calc(100vw - 32px));
		margin: 0;
		padding: 0;
		list-style: none;
		pointer-events: none;
	}
	@media (max-width: 767.98px) {
		.ds-toaster {
			left: 8px;
			right: 8px;
			width: auto;
			bottom: calc(8px + var(--ds-chrome-bottom, 0px) + var(--ds-actionbar-space, 0px));
		}
	}
	.toast {
		overflow: hidden;
		border-radius: var(--ds-radius-md);
		background: var(--ds-bg-4);
		box-shadow: var(--ds-elev-2);
		color: var(--ds-text-1);
		pointer-events: auto;
		animation: ds-toast-in var(--ds-dur-base) var(--ds-ease-out);
	}
	.row {
		display: flex;
		align-items: center;
		gap: 10px;
		min-height: 44px;
		padding: 6px 6px 6px 12px;
	}
	.icon {
		display: inline-flex;
		flex: none;
		color: var(--ds-accent-text);
	}
	.toast[data-tone='success'] .icon {
		color: var(--ds-success-text);
	}
	.toast[data-tone='warning'] .icon {
		color: var(--ds-warning-text);
	}
	.toast[data-tone='error'] .icon {
		color: var(--ds-danger-text);
	}
	.msg {
		flex: 1;
		min-width: 0;
		font-size: var(--ds-text-sm);
		line-height: var(--ds-lh-sm);
	}
	.countdown {
		flex: none;
		color: var(--ds-text-2);
		font-family: var(--font-mono);
		font-size: var(--ds-text-xs);
		font-variant-numeric: tabular-nums;
	}
	.action {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		flex: none;
		height: 28px;
		padding: 0 8px;
		border: 1px solid var(--ds-border-strong);
		border-radius: var(--ds-radius-sm);
		background: transparent;
		color: var(--ds-text-1);
		font-family: var(--font-sans);
		font-size: var(--ds-text-sm);
		cursor: pointer;
	}
	.action:hover {
		background: var(--ds-bg-5);
	}
	.close {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex: none;
		width: 28px;
		height: 28px;
		border: 0;
		border-radius: var(--ds-radius-sm);
		background: transparent;
		color: var(--ds-text-2);
		cursor: pointer;
	}
	.close:hover {
		background: var(--ds-bg-5);
		color: var(--ds-text-1);
	}
	@media (pointer: coarse) {
		.action,
		.close {
			height: 36px;
			min-width: 36px;
		}
	}
	.track {
		height: 2px;
		background: var(--ds-bg-5);
	}
	.bar {
		height: 2px;
		background: var(--ds-accent);
		transition: width 250ms linear;
	}
</style>
