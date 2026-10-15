<!--
@component
Carousel — a titled horizontal row of tiles: a scroll-snap track with a heading, an optional
"See all" link, and previous / next buttons for a mouse. Tile widths follow Grid density (s / m /
l = 180 / 232 / 320px, or `--ds-grid-min`); a track narrower than 520px shows a little over two
tiles, so the next one peeks in.

Keyboard: the row is **one stop per tile**. Tab lands on the current tile's first control and walks
that tile's other controls; ← / → move between tiles, Home / End jump to the ends, and Tab past the
tile leaves the row. The buttons are a
pointer affordance only: hidden at rest, shown on hover and while focus is in the row, and gone on
touch screens, where swiping is native.

- `items`, `key(item)`, `tile` snippet — `(item, index)` — `title`, `level` (heading level, 2 |
  3, default 2), `count`, `href` + `seeAllLabel` ("See all"), `label` (the list's name, default
  `title`), `density`, `min` (px, overrides density), `loading` + `skeletonCount` (default 6),
  `empty` snippet (without one, a row with no items renders nothing), `actions` snippet (beside
  "See all"), `class`.
-->
<script lang="ts" generics="T">
	import { strings } from '../strings.svelte.js';
	import type { Snippet } from 'svelte';
	import { tick } from 'svelte';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	import SkeletonLoader from './SkeletonLoader.svelte';

	interface Props {
		items: readonly T[];
		key: (item: T) => string | number;
		tile: Snippet<[T, number]>;
		title?: string;
		level?: 2 | 3;
		count?: number | string;
		href?: string;
		seeAllLabel?: string;
		label?: string;
		density?: 's' | 'm' | 'l';
		min?: number;
		loading?: boolean;
		skeletonCount?: number;
		empty?: Snippet;
		actions?: Snippet;
		class?: string;
	}

	let {
		items,
		key,
		tile,
		title,
		level = 2,
		count,
		href,
		seeAllLabel = strings.seeAll,
		label,
		density,
		min,
		loading = false,
		skeletonCount = 6,
		empty,
		actions,
		class: className = ''
	}: Props = $props();

	const uid = $props.id();
	const MIN = { s: 180, m: 232, l: 320 };
	const tileMin = $derived(
		min !== undefined ? `${min}px` : density ? `${MIN[density]}px` : 'var(--ds-grid-min, 232px)'
	);
	const listLabel = $derived(label ?? title ?? 'Items');
	const hidden = $derived(!loading && items.length === 0 && !empty);

	let track: HTMLDivElement | undefined = $state();
	let current = $state(0);
	let canPrev = $state(false);
	let canNext = $state(false);
	let staticTrack = $state(false);

	const FOCUSABLE =
		'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [data-ds-roving]';

	function tiles(): HTMLElement[] {
		return track ? [...track.querySelectorAll<HTMLElement>(':scope > [data-tile]')] : [];
	}

	function focusables(el: HTMLElement): HTMLElement[] {
		return [...el.querySelectorAll<HTMLElement>(FOCUSABLE)];
	}

	/** Roving tabindex by tile: the current tile's controls are in the tab order, so Tab walks a
	 *  tile with several controls; every other tile's controls are not. */
	function sync() {
		const all = tiles();
		if (current > all.length - 1) current = Math.max(0, all.length - 1);
		let any = false;
		all.forEach((el, i) => {
			focusables(el).forEach((f) => {
				any = true;
				f.dataset.dsRoving = '';
				f.tabIndex = i === current ? 0 : -1;
			});
		});
		// A track of static tiles still has to be reachable by keyboard to scroll it.
		staticTrack = !any && all.length > 0;
	}

	function measure() {
		if (!track) return;
		const max = track.scrollWidth - track.clientWidth;
		canPrev = track.scrollLeft > 1;
		canNext = track.scrollLeft < max - 1;
	}

	$effect(() => {
		void items.length;
		void loading;
		if (!track) return;
		tick().then(() => {
			sync();
			measure();
		});
	});

	// A control that appears in a tile later (a favorite button loading in) joins the roving set.
	$effect(() => {
		if (!track || typeof MutationObserver === 'undefined') return;
		const mo = new MutationObserver(() => sync());
		mo.observe(track, { childList: true, subtree: true });
		return () => mo.disconnect();
	});

	$effect(() => {
		if (!track || typeof ResizeObserver === 'undefined') return;
		const ro = new ResizeObserver(measure);
		ro.observe(track);
		return () => ro.disconnect();
	});

	function reduced(): boolean {
		return (
			typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
		);
	}

	function moveTo(i: number) {
		const all = tiles();
		if (!all.length) return;
		current = Math.min(all.length - 1, Math.max(0, i));
		sync();
		const el = all[current];
		focusables(el)[0]?.focus({ preventScroll: true });
		el.scrollIntoView?.({
			block: 'nearest',
			inline: 'nearest',
			behavior: reduced() ? 'auto' : 'smooth'
		});
	}

	function onkeydown(event: KeyboardEvent) {
		if (event.altKey || event.ctrlKey || event.metaKey) return;
		const target = event.target as HTMLElement;
		if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
		const map: Record<string, number> = {
			ArrowLeft: current - 1,
			ArrowRight: current + 1,
			Home: 0,
			End: tiles().length - 1
		};
		if (!(event.key in map)) return;
		event.preventDefault();
		if (staticTrack) {
			page(event.key === 'ArrowLeft' || event.key === 'Home' ? -1 : 1);
			return;
		}
		moveTo(map[event.key]);
	}

	function onfocusin(event: FocusEvent) {
		const owner = (event.target as HTMLElement).closest<HTMLElement>('[data-tile]');
		if (!owner) return;
		const i = tiles().indexOf(owner);
		if (i >= 0 && i !== current) {
			current = i;
			sync();
		}
	}

	function page(direction: -1 | 1) {
		if (!track) return;
		track.scrollBy({
			left: direction * Math.max(track.clientWidth * 0.9, 1),
			behavior: reduced() ? 'auto' : 'smooth'
		});
	}
</script>

{#if !hidden}
	<section
		class="ds-carousel {className}"
		aria-labelledby={title ? `${uid}-title` : undefined}
		aria-label={title ? undefined : listLabel}
		style:--tile-min={tileMin}
	>
		{#if title || href || actions}
			<div class="head">
				{#if title}
					<svelte:element this={`h${level}`} id="{uid}-title" class="title">{title}</svelte:element>
				{/if}
				{#if count !== undefined && count !== null}<span class="count">{count}</span>{/if}
				<span class="grow"></span>
				{@render actions?.()}
				{#if href}
					<a class="see-all" {href}
						>{seeAllLabel}<ArrowRight size={14} aria-hidden="true" />{#if title}<span
								class="ds-sr-only">: {title}</span
							>{/if}</a
					>
				{/if}
			</div>
		{/if}

		{#if loading}
			<div class="track" aria-busy="true">
				<SkeletonLoader variant="card" count={skeletonCount} class="skeleton" />
			</div>
		{:else if items.length === 0}
			<div class="empty">{@render empty?.()}</div>
		{:else}
			<div class="frame">
				<button
					type="button"
					class="nav prev"
					tabindex="-1"
					aria-hidden="true"
					hidden={!canPrev}
					onpointerdown={(e) => e.preventDefault()}
					onclick={() => page(-1)}
				>
					<ChevronLeft size={18} aria-hidden="true" />
				</button>
				<!-- svelte-ignore a11y_no_noninteractive_element_interactions, a11y_no_noninteractive_tabindex -->
				<div
					bind:this={track}
					class="track"
					role="list"
					aria-label={listLabel}
					tabindex={staticTrack ? 0 : undefined}
					{onkeydown}
					{onfocusin}
					onscroll={measure}
				>
					{#each items as item, i (key(item))}
						<div class="tile" role="listitem" data-tile>{@render tile(item, i)}</div>
					{/each}
				</div>
				<button
					type="button"
					class="nav next"
					tabindex="-1"
					aria-hidden="true"
					hidden={!canNext}
					onpointerdown={(e) => e.preventDefault()}
					onclick={() => page(1)}
				>
					<ChevronRight size={18} aria-hidden="true" />
				</button>
			</div>
		{/if}
	</section>
{/if}

<style>
	.ds-carousel {
		container-type: inline-size;
		display: flex;
		flex-direction: column;
		gap: 10px;
		min-width: 0;
		--gap: 14px;
		--tile-w: min(var(--tile-min), 100%);
	}
	.head {
		display: flex;
		align-items: baseline;
		gap: 8px;
		min-width: 0;
	}
	.title {
		min-width: 0;
		margin: 0;
		overflow: hidden;
		color: var(--ds-text-1);
		font-size: var(--ds-text-lg);
		line-height: var(--ds-lh-lg);
		font-weight: 500;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.count {
		flex: none;
		color: var(--ds-text-3);
		font-size: var(--ds-text-sm);
		font-variant-numeric: tabular-nums;
	}
	.grow {
		flex: 1;
	}
	.see-all {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		flex: none;
		color: var(--ds-accent-text);
		font-size: var(--ds-text-sm);
		text-decoration: none;
	}
	.see-all:hover {
		text-decoration: underline;
	}
	.frame {
		position: relative;
		min-width: 0;
	}
	.track {
		display: flex;
		gap: var(--gap);
		min-width: 0;
		overflow-x: auto;
		overscroll-behavior-x: contain;
		scroll-snap-type: x mandatory;
		scroll-padding-inline: 2px;
		scrollbar-width: none;
		/* Room for a tile's focus ring, which the scroll container would otherwise clip. */
		padding: 4px 2px;
		margin: -4px -2px;
	}
	.track::-webkit-scrollbar {
		display: none;
	}
	.tile {
		flex: 0 0 var(--tile-w);
		min-width: 0;
		scroll-snap-align: start;
	}
	.track :global(.skeleton) {
		display: flex;
		gap: var(--gap);
		min-width: 0;
		overflow: hidden;
	}
	.track :global(.skeleton > *) {
		flex: 0 0 var(--tile-w);
	}
	.empty {
		color: var(--ds-text-3);
		font-size: var(--ds-text-sm);
	}
	/* Set on the container's children: a container query cannot style the container itself. */
	@container (max-width: 519.98px) {
		.frame,
		.track {
			--tile-w: calc((100cqi - 2 * var(--gap)) / 2.25);
		}
	}

	.nav {
		position: absolute;
		top: calc(var(--tile-w) * 9 / 32);
		z-index: var(--ds-z-raised);
		display: none;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		padding: 0;
		border: 1px solid var(--ds-border-strong);
		border-radius: var(--ds-radius-full);
		background: var(--ds-bg-3);
		box-shadow: var(--ds-elev-2);
		color: var(--ds-text-1);
		cursor: pointer;
		transform: translateY(-50%);
		transition: background-color var(--ds-dur-fast) var(--ds-ease-out);
	}
	.nav:hover {
		background: var(--ds-bg-4);
	}
	.prev {
		left: 6px;
	}
	.next {
		right: 6px;
	}
	.ds-carousel:is(:hover, :focus-within) .nav:not([hidden]) {
		display: inline-flex;
	}
	@media (hover: none), (pointer: coarse) {
		.ds-carousel:is(:hover, :focus-within) .nav:not([hidden]) {
			display: none;
		}
		.see-all {
			min-height: var(--ds-h-touch);
		}
	}
</style>
