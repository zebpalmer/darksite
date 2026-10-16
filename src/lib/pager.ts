// The URL side of a Pager: which page the URL asks for, and the link to another page. The page
// number lives in one query parameter (`?page=3`); page 1 drops it, so the first page has one URL.

/** A URL, its string, or anything with an `href` (SvelteKit's read-only `page.url`). */
export type UrlLike = string | URL | { readonly href: string };

const parse = (url: UrlLike) => new URL(typeof url === 'string' ? url : url.href, 'http://x');

/** The page a URL asks for: a whole number from 1, and 1 for anything else. */
export function pageFromUrl(url: UrlLike, param = 'page'): number {
	const raw = parse(url).searchParams.get(param);
	const n = raw === null ? NaN : Number(raw);
	return Number.isInteger(n) && n >= 1 ? n : 1;
}

/** The link to `page`, keeping the rest of the URL (filters, sort): its path, query and hash. */
export function pageHref(url: UrlLike, page: number, param = 'page'): string {
	const next = parse(url);
	if (page <= 1) next.searchParams.delete(param);
	else next.searchParams.set(param, String(page));
	return `${next.pathname}${next.search}${next.hash}`;
}
