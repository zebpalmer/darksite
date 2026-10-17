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
	/** A sentence about the destination: SideNav shows it as the item's tooltip, TopNav as a
	 *  second line under the label in its group's menu. */
	description?: string;
	/** A heading inside its group's TopNav menu. A group whose items have sections lays its menu
	 *  out in one column per section, in first-appearance order; its items without one form a
	 *  footer row under them ("All guides"). The phone sheet shows the headings too. */
	section?: string;
}

export interface NavGroup {
	id: string;
	label: string;
	/** In a collapsible SideNav, how the group starts: `true` closed, `false` open. Unset, it starts
	 *  open only when it holds the current page. A group holding the current page always starts
	 *  open. */
	collapsed?: boolean;
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

export interface NavMenuSection {
	title: string;
	items: NavItem[];
}

/** A group's items split by `section`: the sections in first-appearance order, and the items with
 *  none (`rest`). No item with a section gives no sections. */
export function sectionItems(items: readonly NavItem[]): {
	sections: NavMenuSection[];
	rest: NavItem[];
} {
	const sections: NavMenuSection[] = [];
	const rest: NavItem[] = [];
	for (const item of items) {
		if (!item.section) {
			rest.push(item);
			continue;
		}
		const found = sections.find((s) => s.title === item.section);
		if (found) found.items.push(item);
		else sections.push({ title: item.section, items: [item] });
	}
	return { sections, rest };
}
