// Numbers and money. The rule: thousands separators and currency in the viewer's locale; exact
// values in tables; compact values ("12.4K") only where space is tight, with the exact value in
// a tooltip. Money is in major units — dollars, not cents.

export interface NumberOptions {
	locale?: string;
	maximumFractionDigits?: number;
}

/** `12408` → `12,408` in the viewer's locale. */
export function formatNumber(value: number, options: NumberOptions = {}): string {
	return new Intl.NumberFormat(options.locale, {
		maximumFractionDigits: options.maximumFractionDigits ?? 2
	}).format(value);
}

/** `12408` → `12K`, `12480` → `12.5K`, `1250000` → `1.3M`. For tight spaces only — never a table. */
export function formatCompact(value: number, locale?: string): string {
	return new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(
		value
	);
}

/**
 * `1234.5, 'USD'` → `$1,234.50`. `amount` is in major units (dollars, not cents). Pass
 * `maximumFractionDigits` for sub-cent amounts, such as per-unit prices (`$0.0025`), or `0` for
 * whole units (`$1,235`) — either option alone is enough: the other is fitted to it, so the pair
 * never contradicts the currency's own default (a `RangeError` in some engines).
 */
export function formatMoney(
	amount: number,
	currency: string,
	options: NumberOptions & { minimumFractionDigits?: number } = {}
): string {
	let min = options.minimumFractionDigits;
	let max = options.maximumFractionDigits;
	if ((min === undefined) !== (max === undefined)) {
		// One side given: fit the other to it, from the currency's defaults.
		const fallback = new Intl.NumberFormat(options.locale, { style: 'currency', currency });
		const defaults = fallback.resolvedOptions();
		if (min === undefined) min = Math.min(max!, defaults.minimumFractionDigits ?? 2);
		else max = Math.max(min, defaults.maximumFractionDigits ?? 2);
	} else if (min !== undefined && max !== undefined && min > max) {
		min = max;
	}
	return new Intl.NumberFormat(options.locale, {
		style: 'currency',
		currency,
		minimumFractionDigits: min,
		maximumFractionDigits: max
	}).format(amount);
}

/**
 * A 0–1 confidence as a whole percentage: `0.873` → `87%`. Rounding never overstates certainty at
 * the ends: `100%` is only ever exactly 1 (`0.997` → `99%`) and `0%` only exactly 0 (`0.003` →
 * `<1%`). Out-of-range values are clamped; a missing or non-numeric value is an empty string, so
 * the caller shows its own missing-value mark.
 */
export function formatConfidence(value: number | null | undefined): string {
	if (value === null || value === undefined || !Number.isFinite(value)) return '';
	const v = Math.min(1, Math.max(0, value));
	if (v === 1) return '100%';
	if (v === 0) return '0%';
	const pct = Math.round(v * 100);
	if (pct >= 100) return '99%';
	if (pct < 1) return '<1%';
	return `${pct}%`;
}
