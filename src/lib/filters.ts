// Filter state for FilterRail and ActiveFilters, and its round trip through the URL.

export interface FilterOption {
	value: string;
	label: string;
	count?: number;
}

export interface FilterSection {
	key: string;
	label: string;
	/**
	 * `options` (default): checkboxes, or radios with `multiple: false`. `text`: one free-text value
	 * ("Name contains"). `search`: a Combobox over `options`, for a list too long to show — owners,
	 * assignees — with the chosen values as removable chips.
	 */
	type?: 'options' | 'text' | 'search';
	/** The choices of an `options` or `search` section. A `search` section may load them as typed. */
	options?: readonly FilterOption[];
	/** Default true: any number of options. False: at most one, with "Any" to clear it. */
	multiple?: boolean;
	/**
	 * A single-choice section's label for its unset choice (default "Any"). Name what no filter
	 * means here — "Default" when the unset value is a default rather than every value.
	 */
	unsetLabel?: string;
	/** The input's placeholder in a `text` or `search` section. */
	placeholder?: string;
	/**
	 * A readable label for a value that is not among `options` — from a linked URL, or not loaded
	 * yet (an id whose name the app can look up). Without it the value is shown as it is.
	 */
	labelFor?: (value: string) => string | undefined;
	/** A `search` section's server search: called with the typed text; feed results back as `options`. */
	onsearch?: (text: string) => void;
	/** A `search` section is waiting for `onsearch` results. */
	loading?: boolean;
	/** Drop values from the URL that are not among `options`, instead of keeping them. */
	strict?: boolean;
}

/** Selected option values per section key. A missing or empty list means "no filter". */
export type FilterValue = Record<string, string[]>;

/** A query string, or anything that serializes to one (URLSearchParams, a read-only view of it). */
export type ParamsInput = string | { toString(): string };

export function countActive(value: FilterValue): number {
	return Object.values(value).reduce((n, list) => n + list.length, 0);
}

/**
 * The label for a value in a section: its option's label, else `labelFor(value)`, else the value
 * itself — so a value the options do not list is still shown, never dropped.
 */
export function filterLabel(section: FilterSection, value: string): string {
	return (
		section.options?.find((o) => o.value === value)?.label ?? section.labelFor?.(value) ?? value
	);
}

/** Values selected in a section that its `options` do not list (from a URL, or not loaded yet). */
export function unlistedValues(section: FilterSection, value: FilterValue): string[] {
	const listed = new Set((section.options ?? []).map((o) => o.value));
	return (value[section.key] ?? []).filter((v) => !listed.has(v));
}

/**
 * Write filters into search params: one entry per selected value (`?status=ready&status=hold`).
 * Other params are kept; the keys of `sections` are replaced.
 */
export function filtersToParams(
	value: FilterValue,
	sections: readonly FilterSection[],
	base?: ParamsInput
): URLSearchParams {
	const params = new URLSearchParams(base === undefined ? '' : base.toString());
	for (const section of sections) {
		params.delete(section.key);
		for (const v of value[section.key] ?? []) params.append(section.key, v);
	}
	return params;
}

/**
 * Read filters back. Values a section's options do not list are **kept** — a linked view keeps its
 * filters even when the options are partial or still loading — unless the section is `strict`.
 * Empty values are dropped; a `text` section, or one with `multiple: false`, keeps the first.
 */
export function filtersFromParams(
	params: ParamsInput,
	sections: readonly FilterSection[]
): FilterValue {
	const p = new URLSearchParams(params.toString());
	const value: FilterValue = {};
	for (const section of sections) {
		let picked = [...new Set(p.getAll(section.key).map((v) => v.trim()))].filter(Boolean);
		if (section.strict) {
			const allowed = new Set((section.options ?? []).map((o) => o.value));
			picked = picked.filter((v) => allowed.has(v));
		}
		if (picked.length)
			value[section.key] =
				section.type === 'text' || section.multiple === false ? picked.slice(0, 1) : picked;
	}
	return value;
}
