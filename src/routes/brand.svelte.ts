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
export const gallery = $state({ brand: 'violet' });
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
