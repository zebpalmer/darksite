import { strings } from './strings.svelte.js';
import type { IconComponent } from './types.js';

/** One destination. Every navigation surface — rail, tab bar, More sheet, side nav — reads the
 *  same list, so they never drift apart. */
export interface NavItem {
	id: string;
	label: string;
	href: string;
	icon?: IconComponent;
	/** The id of the group it belongs to. */
	group?: string;
	/** A count, or `true` for a dot. */
	badge?: number | boolean | null;
}

export interface NavGroup {
	id: string;
	label: string;
}

export interface NavSection {
	group: NavGroup | null;
	items: NavItem[];
}

/** Items in group order; items without a known group come first, untitled. */
export function groupItems(
	items: readonly NavItem[],
	groups: readonly NavGroup[] = []
): NavSection[] {
	const known = new Set(groups.map((g) => g.id));
	const sections: NavSection[] = [];
	const loose = items.filter((i) => !i.group || !known.has(i.group));
	if (loose.length) sections.push({ group: null, items: loose });
	for (const group of groups) {
		const list = items.filter((i) => i.group === group.id);
		if (list.length) sections.push({ group, items: list });
	}
	return sections;
}

/** What a screen reader hears after the label for a badge: `, 12`, or `, new` for a dot. The visible
 *  badge is hidden from assistive technology so it is not read twice. */
export function badgeSpoken(text: string | null, dotLabel = strings.newBadge): string {
	if (text === null) return '';
	return `, ${text === '' ? dotLabel : text}`;
}

/** `12` → `12`, `140` → `99+`, `true` → a dot (empty string), `0`/`false`/`null` → nothing. */
export function badgeText(badge: NavItem['badge']): string | null {
	if (badge === true) return '';
	if (typeof badge === 'number' && badge > 0) return badge > 99 ? '99+' : String(badge);
	return null;
}
