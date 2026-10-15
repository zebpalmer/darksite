<!--
@component
Card — the media card for a video or a gallery. No card chrome: the 16:9 thumbnail is the card and
the text sits under it. Put cards in a Grid or a horizontal row.

Overlays: severity bottom-left, duration (or an image count) bottom-right on a scrim pill, a
favorite heart top-right, a 3px progress bar along the bottom. A missing or broken thumbnail falls
back to a ds-bg-3 tile with an icon. The title and one meta line truncate; a `rating` (1–5) shows
as ★ n, display only.

- `href`, `title`, `thumbnail`, `kind` (`video` | `gallery`), `severity`, `duration` (seconds),
  `imageCount`, `favorite`, `progress` (0–1), `rating`, `meta`, `overlay` snippet, `class`, and
  `data-*` / `aria-*` passthrough.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import Film from '@lucide/svelte/icons/film';
	import Heart from '@lucide/svelte/icons/heart';
	import Images from '@lucide/svelte/icons/images';

	import SeverityBadge from './SeverityBadge.svelte';
	import type { Severity } from '../severity.js';
	import { formatDuration } from '../time.js';

	interface Props {
		href: string;
		title: string;
		thumbnail?: string | null;
		kind?: 'video' | 'gallery';
		severity?: Severity | null;
		duration?: number | null;
		imageCount?: number | null;
		favorite?: boolean;
		progress?: number | null;
		rating?: number | null;
		meta?: string;
		overlay?: Snippet;
		class?: string;
		[key: `data-${string}` | `aria-${string}`]: unknown;
	}

	let {
		href,
		title,
		thumbnail,
		kind = 'video',
		severity,
		duration,
		imageCount,
		favorite = false,
		progress,
		rating,
		meta,
		overlay,
		class: className = '',
		...rest
	}: Props = $props();

	let failed = $state<string | null>(null);
	const showImage = $derived(!!thumbnail && failed !== thumbnail);
	const pct = $derived(progress ? Math.min(1, Math.max(0, progress)) * 100 : 0);
	const Fallback = $derived(kind === 'gallery' ? Images : Film);
</script>

<a {href} class="ds-card {className}" {...rest}>
	<span class="thumb">
		{#if showImage}
			<img src={thumbnail} alt="" loading="lazy" onerror={() => (failed = thumbnail ?? null)} />
		{:else}
			<span class="fallback"><Fallback size={28} aria-hidden="true" /></span>
		{/if}
		{#if severity}<span class="sev"><SeverityBadge {severity} size="sm" /></span>{/if}
		{#if kind === 'gallery' && imageCount}
			<span class="pill"
				><Images size={12} aria-hidden="true" />{imageCount.toLocaleString()}<span class="ds-sr-only">
					images</span
				></span
			>
		{:else if duration}
			<span class="pill mono">{formatDuration(duration)}</span>
		{/if}
		{#if favorite}
			<span class="fav"><Heart size={14} fill="currentColor" aria-hidden="true" /><span class="ds-sr-only"
					>Favorite</span
				></span>
		{/if}
		{@render overlay?.()}
		{#if pct > 0}<span class="progress" style:width="{pct}%" aria-hidden="true"></span>{/if}
	</span>
	<span class="row">
		<span class="title" title={title}>{title}</span>
		{#if rating}<span class="rating"
				><span aria-hidden="true">★ {rating}</span><span class="ds-sr-only">, rated {rating} of 5</span
				></span
			>{/if}
	</span>
	{#if meta}<span class="meta" title={meta}>{meta}</span>{/if}
</a>

<style>
	.ds-card {
		display: flex;
		flex-direction: column;
		gap: 4px;
		min-width: 0;
		color: inherit;
		text-decoration: none;
	}
	.thumb {
		position: relative;
		display: block;
		aspect-ratio: 16 / 9;
		overflow: hidden;
		border-radius: var(--ds-radius-sm);
		background: var(--ds-bg-3);
	}
	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform var(--ds-dur-base) var(--ds-ease-out);
	}
	.ds-card:hover img {
		transform: scale(1.03);
	}
	.fallback {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: var(--ds-text-3);
	}
	.sev {
		position: absolute;
		left: 6px;
		bottom: 8px;
	}
	.pill {
		position: absolute;
		right: 6px;
		bottom: 8px;
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 1px 6px;
		border-radius: var(--ds-radius-sm);
		background: var(--ds-scrim);
		color: #fff;
		font-size: var(--ds-text-xs);
		line-height: var(--ds-lh-xs);
		font-variant-numeric: tabular-nums;
	}
	.mono {
		font-family: var(--font-mono);
	}
	.fav {
		position: absolute;
		top: 6px;
		right: 6px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: var(--ds-scrim);
		color: #fff;
	}
	.progress {
		position: absolute;
		left: 0;
		bottom: 0;
		height: 3px;
		background: var(--ds-accent);
	}
	.row {
		display: flex;
		align-items: baseline;
		gap: 8px;
		min-width: 0;
		margin-top: 4px;
	}
	.title,
	.meta {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.title {
		flex: 1;
		min-width: 0;
		color: var(--ds-text-1);
		font-size: var(--ds-text-md);
		font-weight: 500;
	}
	.rating {
		flex: none;
		color: var(--ds-text-2);
		font-size: var(--ds-text-sm);
	}
	.meta {
		color: var(--ds-text-3);
		font-size: var(--ds-text-sm);
	}
	@media (prefers-reduced-motion: reduce) {
		.ds-card:hover img {
			transform: none;
		}
	}
</style>
