// Filter state for FilterRail and ActiveFilters, and its round trip through the URL.

export interface FilterOption {
	value: string;
	label: string;
	count?: number;
}

export interface FilterSection {
	key: string;
	label: string;
	options: readonly FilterOption[];
	/** Default true: any number of options. False: at most one, with "Any" to clear it. */
	multiple?: boolean;
}

/** Selected option values per section key. A missing or empty list means "no filter". */
export type FilterValue = Record<string, string[]>;

/** A query string, or anything that serializes to one (URLSearchParams, a read-only view of it). */
export type ParamsInput = string | { toString(): string };

export function countActive(value: FilterValue): number {
	return Object.values(value).reduce((n, list) => n + list.length, 0);
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

/** Read filters back, keeping only values that are options of their section. */
export function filtersFromParams(
	params: ParamsInput,
	sections: readonly FilterSection[]
): FilterValue {
	const p = new URLSearchParams(params.toString());
	const value: FilterValue = {};
	for (const section of sections) {
		const allowed = new Set(section.options.map((o) => o.value));
		const picked = p.getAll(section.key).filter((v) => allowed.has(v));
		if (picked.length)
			value[section.key] = section.multiple === false ? picked.slice(0, 1) : picked;
	}
	return value;
}
