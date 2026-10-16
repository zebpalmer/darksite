<!--
@component
Pager — page links for a list someone will link to: a public listing, search results, an archive.
Newer on the left, "1–50 of 295" in the middle, Older on the right. Each end is a real link to a
URL (`?page=2`), so a page can be bookmarked, shared and opened in a new tab; an end with nowhere
to go stays in place, disabled. Lists inside an app keep `LoadMore` (docs/layout.md, "Long lists").

The page comes from the URL: pass `url` (in SvelteKit, `page.url`) and the Pager reads `param`
(default `page`) from it and links to the same URL with the next or previous page, keeping every
other parameter. Page 1 drops the parameter. Pass `page` and `href(page)` instead to own the URL.

- `url`, `param`, `page` (1-based; default from `url`), `pageSize` (default 50), `total` (when
  known), `hasMore` (Older's state when `total` is unknown), `href(page)`, `newerLabel` /
  `olderLabel` (default "Newer" / "Older"; "Previous" / "Next" for a list not ordered by time),
  `label` (the nav's accessible name, default "Pagination"), `class`.
-->
<script lang="ts">
	import { strings } from '../strings.svelte.js';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Button from './Button.svelte';
	import { pageFromUrl, pageHref, type UrlLike } from '../pager.js';

	interface Props {
		url?: UrlLike;
		param?: string;
		page?: number;
		pageSize?: number;
		total?: number | null;
		hasMore?: boolean;
		href?: (page: number) => string;
		newerLabel?: string;
		olderLabel?: string;
		label?: string;
		class?: string;
	}

	let {
		url,
		param = 'page',
		page,
		pageSize = 50,
		total = null,
		hasMore,
		href,
		newerLabel = strings.newer,
		olderLabel = strings.older,
		label = strings.pagination,
		class: className = ''
	}: Props = $props();

	const current = $derived(Math.max(1, page ?? (url ? pageFromUrl(url, param) : 1)));
	const link = (n: number) => (href ? href(n) : url ? pageHref(url, n, param) : `?${param}=${n}`);

	const last = $derived(total === null ? current * pageSize : Math.min(current * pageSize, total));
	const first = $derived(Math.min((current - 1) * pageSize + 1, last));
	const newer = $derived(current > 1);
	const older = $derived(total === null ? (hasMore ?? false) : current * pageSize < total);
</script>

<nav class="ds-pager {className}" aria-label={label}>
	<Button
		href={link(current - 1)}
		rel="prev"
		icon={ChevronLeft}
		disabled={!newer}
		class="newer">{newerLabel}</Button
	>
	<span class="range">
		<span aria-hidden="true">{strings.pageRange(first, last, total)}</span>
		<span class="ds-sr-only">{strings.pageRangeSpoken(first, last, total)}</span>
	</span>
	<Button
		href={link(current + 1)}
		rel="next"
		iconEnd={ChevronRight}
		disabled={!older}
		class="older">{olderLabel}</Button
	>
</nav>

<style>
	.ds-pager {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		min-width: 0;
		padding: 12px 0;
	}
	.range {
		min-width: 0;
		color: var(--ds-text-3);
		font-size: var(--ds-text-sm);
		line-height: var(--ds-lh-sm);
		font-variant-numeric: tabular-nums;
		text-align: center;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
