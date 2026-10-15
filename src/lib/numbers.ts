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
 * `maximumFractionDigits` for sub-cent amounts, such as per-unit prices (`$0.0025`).
 */
export function formatMoney(
	amount: number,
	currency: string,
	options: NumberOptions & { minimumFractionDigits?: number } = {}
): string {
	return new Intl.NumberFormat(options.locale, {
		style: 'currency',
		currency,
		minimumFractionDigits: options.minimumFractionDigits,
		maximumFractionDigits: options.maximumFractionDigits
	}).format(amount);
}
