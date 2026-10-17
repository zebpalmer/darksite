// The gallery's brand switcher: every prebuilt brand is loaded, scoped to :root[data-brand], and
// this picks one. A product sets its brand once instead (see the README, "Brands").
import index from '../lib/brands/index.json';

import.meta.glob('../lib/brands/*.css', { eager: true });

interface BrandEntry {
	name: string;
	label: string;
	scheme: boolean;
	note: string | null;
	swatches: Record<string, Record<string, string>>;
}

export const brands = index as BrandEntry[];
export const gallery = $state<{ brand: string; nav: 'rail' | 'top' | 'site' }>({
	brand: 'violet',
	nav: 'rail'
});
const KEY = 'darksite-gallery:brand';

export function setBrand(name: string, persist = true) {
	if (!brands.some((b) => b.name === name)) return;
	gallery.brand = name;
	document.documentElement.dataset.brand = name;
	if (!persist) return;
	try {
		localStorage.setItem(KEY, name);
	} catch {
		/* storage unavailable */
	}
}

export function initBrand() {
	const asked = new URLSearchParams(location.search).get('brand');
	let saved: string | null = null;
	try {
		saved = localStorage.getItem(KEY);
	} catch {
		/* storage unavailable */
	}
	setBrand(asked ?? saved ?? 'violet', !asked);
}

const NAV_KEY = 'darksite-gallery:nav';

/** The gallery's own navigation shape: the rail, the top bar, or the top bar with the content
 *  capped at 1060px (a site). */
export function setNav(nav: 'rail' | 'top' | 'site', persist = true) {
	gallery.nav = nav;
	if (!persist) return;
	try {
		localStorage.setItem(NAV_KEY, nav);
	} catch {
		/* storage unavailable */
	}
}

export function initNav() {
	const asked = new URLSearchParams(location.search).get('nav');
	let saved: string | null = null;
	try {
		saved = localStorage.getItem(NAV_KEY);
	} catch {
		/* storage unavailable */
	}
	const nav = asked ?? saved;
	if (nav === 'rail' || nav === 'top' || nav === 'site') setNav(nav, !asked);
}
