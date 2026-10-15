<!--
@component
Lightbox — the full-screen image viewer. A native modal `<dialog>` over the whole viewport: focus
is trapped, Esc closes, the page cannot scroll, and focus returns to the trigger. The content
mounts only while open.

The image is fitted to the screen. ← / → (and the side buttons, and a swipe on touch) step through
`items`; Home / End jump to the ends. Zoom with a double-click or double-tap, + / − / 0, a pinch,
or a trackpad pinch; drag to pan while zoomed. A swipe down on touch closes it. The neighbors are
preloaded. A counter ("3 of 12") is announced as it changes.

- `items` (`{ src, alt, width?, height? }`), `open` (bindable), `index` (bindable), `label` (the
  dialog's name, default "Image viewer"), `loop`, `zoom` (default true), `maxZoom` (default 4),
  `onclose()`, `finalFocus`, `caption` snippet and `actions` snippet — both `(item, index)` —
  `class`.
-->
<script lang="ts" module>
	export interface LightboxItem {
		src: string;
		alt: string;
		width?: number;
		height?: number;
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { tick } from 'svelte';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import ImageOff from '@lucide/svelte/icons/image-off';
	import Minus from '@lucide/svelte/icons/minus';
	import Plus from '@lucide/svelte/icons/plus';
	import X from '@lucide/svelte/icons/x';

	import Button from './Button.svelte';
	import Spinner from './Spinner.svelte';
	import { isTypingTarget } from '../keycap.js';
	import { trackModal } from '../layers.svelte.js';

	interface Props {
		items: readonly LightboxItem[];
		open?: boolean;
		index?: number;
		label?: string;
		loop?: boolean;
		zoom?: boolean;
		maxZoom?: number;
		onclose?: () => void;
		finalFocus?: HTMLElement | null;
		caption?: Snippet<[LightboxItem, number]>;
		actions?: Snippet<[LightboxItem, number]>;
		class?: string;
	}

	let {
		items,
		open = $bindable(false),
		index = $bindable(0),
		label = 'Image viewer',
		loop = false,
		zoom: zoomable = true,
		maxZoom = 4,
		onclose,
		finalFocus = null,
		caption,
		actions,
		class: className = ''
	}: Props = $props();

	const total = $derived(items.length);
	const at = $derived(total ? Math.min(total - 1, Math.max(0, Math.trunc(index) || 0)) : 0);
	const item = $derived<LightboxItem | undefined>(items[at]);
	const hasPrev = $derived(total > 1 && (loop || at > 0));
	const hasNext = $derived(total > 1 && (loop || at < total - 1));

	// ── navigation ────────────────────────────────────────────────────────

	function go(delta: number) {
		if (!total) return;
		let next = at + delta;
		if (loop) next = ((next % total) + total) % total;
		next = Math.min(total - 1, Math.max(0, next));
		if (next !== at) index = next;
	}

	function jump(to: number) {
		if (total) index = Math.min(total - 1, Math.max(0, to));
	}

	function close() {
		if (!open) return;
		open = false;
		onclose?.();
	}

	// ── zoom and pan ──────────────────────────────────────────────────────

	let scale = $state(1);
	let x = $state(0);
	let y = $state(0);
	let dragging = $state(false);
	let swipeX = $state(0);
	let loaded = $state(false);
	let failed = $state(false);
	let stage: HTMLDivElement | undefined = $state();
	let img: HTMLImageElement | undefined = $state();

	$effect(() => {
		void item?.src;
		scale = 1;
		x = 0;
		y = 0;
		swipeX = 0;
		loaded = false;
		failed = false;
	});

	function reduced(): boolean {
		return (
			typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
		);
	}

	function clampPan(nx: number, ny: number, s: number): [number, number] {
		if (!img || !stage) return [nx, ny];
		const mx = Math.max(0, (img.offsetWidth * s - stage.clientWidth) / 2);
		const my = Math.max(0, (img.offsetHeight * s - stage.clientHeight) / 2);
		return [Math.min(mx, Math.max(-mx, nx)), Math.min(my, Math.max(-my, ny))];
	}

	/** Zoom to `next`, keeping the point (cx, cy) — relative to the stage center — still. */
	function zoomTo(next: number, cx = 0, cy = 0) {
		if (!zoomable) return;
		const s = Math.min(maxZoom, Math.max(1, next));
		if (s === 1) {
			scale = 1;
			x = 0;
			y = 0;
			return;
		}
		const k = s / scale;
		[x, y] = clampPan(cx - (cx - x) * k, cy - (cy - y) * k, s);
		scale = s;
	}

	function fromCenter(clientX: number, clientY: number): [number, number] {
		const r = stage?.getBoundingClientRect();
		if (!r) return [0, 0];
		return [clientX - r.left - r.width / 2, clientY - r.top - r.height / 2];
	}

	function toggleZoomAt(clientX: number, clientY: number) {
		if (scale > 1) zoomTo(1);
		else zoomTo(2, ...fromCenter(clientX, clientY));
	}

	// Pointer gestures: one pointer pans (zoomed) or swipes (fitted); two pointers pinch.
	const pointers = new Map<number, { x: number; y: number }>();
	let start: {
		x: number;
		y: number;
		px: number;
		py: number;
		scale: number;
		dist: number;
		pinched: boolean;
	} | null = null;
	let lastTap = 0;
	let lastPointer = 'mouse';

	function spread(): number {
		const [a, b] = [...pointers.values()];
		return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
	}

	function onpointerdown(event: PointerEvent) {
		if ((event.target as HTMLElement).closest('button, a')) return;
		lastPointer = event.pointerType;
		if (event.pointerType === 'mouse' && event.button !== 0) return;
		stage?.setPointerCapture?.(event.pointerId);
		pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
		if (pointers.size === 1) {
			start = { x: event.clientX, y: event.clientY, px: x, py: y, scale, dist: 0, pinched: false };
		} else if (pointers.size === 2 && start) {
			start = { ...start, px: x, py: y, scale, dist: spread(), pinched: true };
			swipeX = 0;
		}
		dragging = true;
	}

	function onpointermove(event: PointerEvent) {
		if (!pointers.has(event.pointerId) || !start) return;
		pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
		if (pointers.size >= 2 && start.dist > 0 && zoomable) {
			const [a, b] = [...pointers.values()];
			const [cx, cy] = fromCenter((a.x + b.x) / 2, (a.y + b.y) / 2);
			const s = Math.min(maxZoom, Math.max(1, (start.scale * spread()) / start.dist));
			const k = s / start.scale;
			[x, y] = clampPan(cx - (cx - start.px) * k, cy - (cy - start.py) * k, s);
			scale = s;
			return;
		}
		const dx = event.clientX - start.x;
		const dy = event.clientY - start.y;
		if (scale > 1) {
			[x, y] = clampPan(start.px + dx, start.py + dy, scale);
		} else if (event.pointerType !== 'mouse' && !start.pinched && !reduced()) {
			// The image follows the finger, except under reduced motion.
			swipeX = Math.abs(dx) > Math.abs(dy) ? dx : 0;
		}
	}

	function onpointerup(event: PointerEvent) {
		if (!pointers.has(event.pointerId)) return;
		pointers.delete(event.pointerId);
		if (pointers.size > 0 || !start) return;
		const dx = event.clientX - start.x;
		const dy = event.clientY - start.y;
		const was = start;
		start = null;
		dragging = false;
		swipeX = 0;
		if (scale < 1.02 && scale !== 1) zoomTo(1);
		if (was.pinched || was.scale > 1 || event.type === 'pointercancel') return;
		if (event.pointerType !== 'mouse') {
			if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.2) return go(dx < 0 ? 1 : -1);
			if (dy > 90 && dy > Math.abs(dx) * 1.2) return close();
			if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
				const now = event.timeStamp;
				if (now - lastTap < 300) {
					lastTap = 0;
					toggleZoomAt(event.clientX, event.clientY);
				} else lastTap = now;
			}
		}
	}

	function ondblclick(event: MouseEvent) {
		if (lastPointer !== 'mouse' || (event.target as HTMLElement).closest('button, a')) return;
		toggleZoomAt(event.clientX, event.clientY);
	}

	// A trackpad pinch arrives as a ctrl+wheel; a plain wheel pans while zoomed. Not passive, so
	// it can stop the page from zooming instead.
	function wheel(node: HTMLElement) {
		const handler = (event: WheelEvent) => {
			if (event.ctrlKey && zoomable) {
				event.preventDefault();
				zoomTo(scale * Math.exp(-event.deltaY * 0.01), ...fromCenter(event.clientX, event.clientY));
			} else if (scale > 1) {
				event.preventDefault();
				[x, y] = clampPan(x - event.deltaX, y - event.deltaY, scale);
			}
		};
		node.addEventListener('wheel', handler, { passive: false });
		return () => node.removeEventListener('wheel', handler);
	}

	// ── keyboard ──────────────────────────────────────────────────────────

	function onkeydown(event: KeyboardEvent) {
		if (event.altKey || event.ctrlKey || event.metaKey || isTypingTarget(event.target)) return;
		const step = zoomable ? 1.5 : 1;
		const keys: Record<string, () => void> = {
			ArrowLeft: () => go(-1),
			ArrowRight: () => go(1),
			Home: () => jump(0),
			End: () => jump(total - 1),
			'+': () => zoomTo(scale * step),
			'=': () => zoomTo(scale * step),
			'-': () => zoomTo(scale / step),
			'0': () => zoomTo(1)
		};
		const run = keys[event.key];
		if (!run) return;
		event.preventDefault();
		run();
	}

	// ── preload the neighbors ─────────────────────────────────────────────

	$effect(() => {
		if (!open || typeof Image === 'undefined') return;
		for (const d of [1, -1, 2]) {
			let i = at + d;
			if (loop && total) i = ((i % total) + total) % total;
			const next = items[i];
			if (next && i !== at) new Image().src = next.src;
		}
	});

	// ── the modal surface ─────────────────────────────────────────────────

	function surface(dialog: HTMLDialogElement) {
		const returnTo = document.activeElement as HTMLElement | null;
		try {
			dialog.showModal();
		} catch {
			dialog.setAttribute('open', '');
		}
		const untrack = trackModal(dialog);
		const root = document.documentElement;
		const previous = root.style.overflow;
		root.style.overflow = 'hidden';
		tick().then(() => dialog.focus());
		return () => {
			root.style.overflow = previous;
			untrack();
			if (typeof dialog.close === 'function') dialog.close();
			(finalFocus ?? returnTo)?.focus?.();
		};
	}
</script>

{#if open}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<dialog
		class="ds-lightbox {className}"
		aria-label={label}
		aria-modal="true"
		tabindex="-1"
		{onkeydown}
		oncancel={(event) => {
			event.preventDefault();
			close();
		}}
		{@attach surface}
	>
		<div class="bar top">
			<p class="counter" aria-live="polite" aria-atomic="true">
				{#if total}{(at + 1).toLocaleString()} of {total.toLocaleString()}{:else}No images{/if}
			</p>
			<span class="grow"></span>
			{#if item && actions}<div class="actions">{@render actions(item, at)}</div>{/if}
			{#if zoomable && item}
				<Button
					variant="icon"
					icon={Minus}
					label="Zoom out"
					title="Zoom out (−)"
					keycap="-"
					disabled={scale <= 1}
					onclick={() => zoomTo(scale / 1.5)}
				/>
				<Button
					variant="icon"
					icon={Plus}
					label="Zoom in"
					title="Zoom in (+)"
					keycap="plus"
					disabled={scale >= maxZoom}
					onclick={() => zoomTo(scale * 1.5)}
				/>
			{/if}
			<Button variant="icon" icon={X} label="Close" title="Close (Esc)" keycap="escape" onclick={close} />
		</div>

		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			bind:this={stage}
			class="stage"
			data-zoomed={scale > 1 ? '' : undefined}
			data-zoomable={zoomable ? '' : undefined}
			{onpointerdown}
			{onpointermove}
			{onpointerup}
			onpointercancel={onpointerup}
			{ondblclick}
			{@attach wheel}
		>
			{#if item}
				{#key item.src}
					{#if failed}
						<p class="failed"><ImageOff size={24} aria-hidden="true" />Image unavailable</p>
					{:else}
						<img
							bind:this={img}
							src={item.src}
							alt={item.alt}
							width={item.width}
							height={item.height}
							draggable="false"
							data-dragging={dragging ? '' : undefined}
							style:transform="translate({x + swipeX}px, {y}px) scale({scale})"
							onload={() => (loaded = true)}
							onerror={() => (failed = true)}
						/>
						{#if !loaded}<span class="loading"><Spinner size={24} label="Loading image" /></span>{/if}
					{/if}
				{/key}
			{/if}
			{#if total > 1}
				<Button
					class="side prev"
					variant="icon"
					icon={ChevronLeft}
					label="Previous image"
					title="Previous image (←)"
					keycap="arrowleft"
					disabled={!hasPrev}
					onclick={() => go(-1)}
				/>
				<Button
					class="side next"
					variant="icon"
					icon={ChevronRight}
					label="Next image"
					title="Next image (→)"
					keycap="arrowright"
					disabled={!hasNext}
					onclick={() => go(1)}
				/>
			{/if}
		</div>

		{#if item && caption}<div class="bar bottom">{@render caption(item, at)}</div>{/if}
	</dialog>
{/if}

<style>
	.ds-lightbox {
		position: fixed;
		inset: 0;
		display: grid;
		grid-template-rows: auto minmax(0, 1fr) auto;
		width: 100vw;
		height: 100vh;
		height: 100dvh;
		max-width: none;
		max-height: none;
		margin: 0;
		padding: 0;
		border: 0;
		background: var(--ds-bg-0);
		color: var(--ds-text-1);
		overscroll-behavior: contain;
		animation: ds-fade var(--ds-dur-base) var(--ds-ease-out);
	}
	.ds-lightbox:focus {
		outline: none;
	}
	.ds-lightbox::backdrop {
		background: var(--ds-scrim);
	}
	.bar {
		display: flex;
		align-items: center;
		gap: 4px;
		min-width: 0;
		background: var(--ds-bg-1);
		padding-left: max(12px, env(safe-area-inset-left, 0px));
		padding-right: max(8px, env(safe-area-inset-right, 0px));
	}
	.top {
		min-height: 48px;
		padding-top: env(safe-area-inset-top, 0px);
		border-bottom: 1px solid var(--ds-border-subtle);
	}
	.bottom {
		padding-top: 8px;
		padding-bottom: max(8px, env(safe-area-inset-bottom, 0px));
		border-top: 1px solid var(--ds-border-subtle);
		color: var(--ds-text-2);
		font-size: var(--ds-text-sm);
		line-height: var(--ds-lh-sm);
		overflow-wrap: anywhere;
	}
	.counter {
		flex: none;
		margin: 0;
		color: var(--ds-text-2);
		font-size: var(--ds-text-sm);
		font-variant-numeric: tabular-nums;
	}
	.grow {
		flex: 1;
	}
	.actions {
		display: flex;
		align-items: center;
		gap: 4px;
		min-width: 0;
	}
	.stage {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 0;
		overflow: hidden;
		touch-action: none;
		user-select: none;
		-webkit-user-select: none;
	}
	.stage[data-zoomable] {
		cursor: zoom-in;
	}
	.stage[data-zoomed] {
		cursor: grab;
	}
	.stage[data-zoomed]:active {
		cursor: grabbing;
	}
	img {
		display: block;
		width: auto;
		height: auto;
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
		transform-origin: center;
		transition: transform var(--ds-dur-base) var(--ds-ease-out);
		-webkit-user-drag: none;
	}
	img[data-dragging] {
		transition: none;
	}
	.loading {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		pointer-events: none;
	}
	.failed {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		margin: 0;
		padding: 12px 16px;
		border-radius: var(--ds-radius-md);
		background: var(--ds-bg-2);
		color: var(--ds-text-2);
		font-size: var(--ds-text-sm);
	}
	.stage :global(.side) {
		position: absolute;
		top: 50%;
		z-index: var(--ds-z-raised);
		border-color: var(--ds-border-strong);
		border-radius: var(--ds-radius-full);
		background: var(--ds-bg-3);
		color: var(--ds-text-1);
		transform: translateY(-50%);
	}
	.stage :global(.side.prev) {
		left: max(8px, env(safe-area-inset-left, 0px));
	}
	.stage :global(.side.next) {
		right: max(8px, env(safe-area-inset-right, 0px));
	}
	.stage :global(.side:disabled) {
		visibility: hidden;
	}
</style>
