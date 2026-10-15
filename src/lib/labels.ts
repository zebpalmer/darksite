// Stored codes are never shown raw. Each product keeps one label map and formats through it;
// a code missing from the map still reads as words rather than as `missing_start_date`.

/** `missing_start_date` → `Missing start date`; `inProgress` → `In progress`. */
export function humanize(code: string): string {
	const words = code
		.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
		.replace(/[_\-.]+/g, ' ')
		.trim()
		.toLowerCase();
	return words ? words[0].toUpperCase() + words.slice(1) : '';
}

export interface Labels<K extends string> {
	/** The label for a code; a code not in the map is humanized. Empty for a missing value. */
	label(code: K | string | null | undefined): string;
	/** Whether the map names this code — useful in a test that every stored code has a label. */
	has(code: string): code is K;
	readonly map: Readonly<Record<K, string>>;
}

export function createLabels<K extends string>(map: Record<K, string>): Labels<K> {
	return {
		label: (code) =>
			code === null || code === undefined || code === '' ? '' : (map[code as K] ?? humanize(code)),
		has: (code): code is K => Object.prototype.hasOwnProperty.call(map, code),
		map
	};
}
