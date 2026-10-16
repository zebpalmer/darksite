// An ordinal scale: ordered stops, each with a name and three color roles, plus an optional
// "unknown" stop that is shown but never ranked. Severity is the built-in instance
// (severity.ts); an app defines its own with `defineScale` (docs/severity.md, "Custom scales").

/** CSS values for a stop's three roles: the mark, its tinted ground, and the ink on it. */
export interface ScaleColors {
	mark: string;
	bg: string;
	ink: string;
}

/** One ordered stop. Colors are CSS values, typically `var(--app-…)` properties the app defines. */
export interface ScaleStop<V extends string = string> extends ScaleColors {
	value: V;
	label: string;
}

/** The unknown stop as defined: colors default to neutral roles. */
export interface UnknownStopInput<V extends string = string> extends Partial<ScaleColors> {
	value: V;
	label: string;
	/**
	 * The key cap that picks it; `0` by default (the ordered stops have 1–9). `null` gives it no
	 * key: no cap in the picker, and no key picks it.
	 */
	key?: string | null;
}

export interface UnknownStop<V extends string = string> extends ScaleStop<V> {
	/** Its key cap, or `null` when it has none. */
	key: string | null;
}

export interface ScaleDefinition<V extends string = string> {
	/** The scale's name, used as the picker's accessible label: "Severity", "Confidence". */
	name: string;
	/** Lowest first. Two to nine stops. */
	stops: readonly ScaleStop<V>[];
	/**
	 * A stop for "assessed, but cannot say": shown with a dashed mark, never ranked, never under a
	 * ceiling, never the highest. Not the same as unset (`null`), which is no answer at all.
	 */
	unknown?: UnknownStopInput<V>;
	/** An unlit pip. Default `var(--ds-border)`, a neutral role. */
	off?: string;
}

export interface Scale<V extends string = string> {
	readonly name: string;
	/** The ordered stops, lowest first. Excludes unknown. */
	readonly stops: readonly ScaleStop<V>[];
	readonly unknown: UnknownStop<V> | null;
	readonly off: string;
	/** The ordered values, lowest first. Excludes unknown. */
	readonly values: readonly V[];
	/** True for any value on the scale, unknown included. */
	has(value: unknown): value is V;
	isUnknown(value: V | null | undefined): boolean;
	/** The stop for a value (unknown included); `null` when unset or not on the scale. */
	stop(value: V | null | undefined): ScaleStop<V> | null;
	/** The stop's name; an empty string when unset. */
	label(value: V | null | undefined): string;
	/** 1-based position on the scale; 0 for unset and for unknown. */
	rank(value: V | null | undefined): number;
	/** CSS values for the stop's three roles; `null` when unset. */
	vars(value: V | null | undefined): ScaleColors | null;
	/** The key cap for a stop: `1`–`9` by rank, the unknown stop's own key (empty when it has none). */
	key(value: V): string;
	/** The value a key picks, respecting a ceiling; `null` when it picks nothing. */
	fromKey(key: string, max?: V | null): V | null;
	/** The stops a picker shows: the ordered stops up to `max` (inclusive), then unknown. */
	options(max?: V | null): readonly ScaleStop<V>[];
	/** The highest-ranked value present; unknown and unset never win. `null` if none is ranked. */
	highest(values: Iterable<V | null | undefined>): V | null;
	/** Sort order: by rank, with unset and unknown below the lowest stop. */
	compare(a: V | null | undefined, b: V | null | undefined): number;
}

/** The most ordered stops a scale may have: key caps run 1–9, and the picker folds up to 10 cells. */
export const SCALE_MAX_STOPS = 9;

export function defineScale<const V extends string>(definition: ScaleDefinition<V>): Scale<V> {
	const stops = Object.freeze(definition.stops.map((s) => Object.freeze({ ...s })));
	if (stops.length < 2 || stops.length > SCALE_MAX_STOPS)
		throw new Error(
			`defineScale: ${definition.name} needs 2–${SCALE_MAX_STOPS} stops, not ${stops.length}`
		);
	const u = definition.unknown;
	const unknown: UnknownStop<V> | null = u
		? Object.freeze({
				value: u.value,
				label: u.label,
				key: u.key === undefined ? '0' : u.key || null,
				mark: u.mark ?? 'var(--ds-text-3)',
				bg: u.bg ?? 'var(--ds-bg-3)',
				ink: u.ink ?? 'var(--ds-text-2)'
			})
		: null;
	const values = Object.freeze(stops.map((s) => s.value));
	const all = unknown ? [...stops, unknown] : stops;
	const seen = new Set<string>();
	for (const s of all) {
		if (seen.has(s.value)) throw new Error(`defineScale: ${definition.name} repeats ${s.value}`);
		seen.add(s.value);
	}
	const byValue = new Map<string, ScaleStop<V>>(all.map((s) => [s.value, s]));
	const rank = (value: V | null | undefined) => (value == null ? 0 : values.indexOf(value) + 1);
	const options = (max?: V | null) => {
		const ceiling = max != null && rank(max) > 0 ? rank(max) : stops.length;
		const shown = stops.slice(0, ceiling);
		return unknown ? [...shown, unknown] : shown;
	};

	return Object.freeze({
		name: definition.name,
		stops,
		unknown,
		off: definition.off ?? 'var(--ds-border)',
		values,
		has: (value: unknown): value is V => typeof value === 'string' && byValue.has(value),
		isUnknown: (value: V | null | undefined) => unknown !== null && value === unknown.value,
		stop: (value: V | null | undefined) => (value == null ? null : (byValue.get(value) ?? null)),
		label: (value: V | null | undefined) =>
			value == null ? '' : (byValue.get(value)?.label ?? ''),
		rank,
		vars(value: V | null | undefined) {
			const s = value == null ? undefined : byValue.get(value);
			return s ? { mark: s.mark, bg: s.bg, ink: s.ink } : null;
		},
		key: (value: V) =>
			unknown && value === unknown.value ? (unknown.key ?? '') : String(rank(value)),
		fromKey(key: string, max?: V | null) {
			if (unknown?.key && key === unknown.key) return unknown.value;
			const n = Number(key);
			if (!/^[1-9]$/.test(key)) return null;
			return options(max).find((s, i) => i + 1 === n && s !== unknown)?.value ?? null;
		},
		options,
		highest(list: Iterable<V | null | undefined>) {
			let best: V | null = null;
			for (const v of list) if (rank(v) > rank(best)) best = v as V;
			return best;
		},
		compare: (a: V | null | undefined, b: V | null | undefined) => rank(a) - rank(b)
	});
}

// Contrast: a custom scale's colors are the app's, so the app checks them (docs/severity.md).

/** WCAG 2.1 contrast ratio of two colors given as `#rgb`, `#rrggbb` or `rgb()`/`rgba()`. */
export function contrastRatio(a: string, b: string): number {
	const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
	return (x + 0.05) / (y + 0.05);
}

function channels(color: string): [number, number, number] {
	const c = color.trim();
	const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(c);
	if (hex) {
		const h = hex[1].length === 3 ? [...hex[1]].map((d) => d + d).join('') : hex[1];
		return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
	}
	const rgb = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(c);
	if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
	throw new Error(`contrastRatio: cannot read the color ${color}`);
}

function luminance(color: string): number {
	const f = (v: number) => {
		const c = v / 255;
		return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	};
	const [r, g, b] = channels(color);
	return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export interface ScaleContrastResult {
	value: string;
	pair: 'ink on bg' | 'mark on ground';
	fg: string;
	bg: string;
	ratio: number;
	target: number;
	ok: boolean;
}

export interface ScaleContrastOptions {
	/**
	 * Turns a CSS value (`var(--app-…)`) into a color. Default: computed in the live document, in
	 * whatever theme is applied, so call it once per theme. Pass your own map in a test.
	 */
	resolve?: (css: string) => string;
	/**
	 * Where the default resolver reads the colors: an element inside the scope that defines the
	 * app's custom properties. Default `document.body`.
	 */
	within?: Element;
	/** Grounds a mark must stand out from. Default `var(--ds-bg-1)` and `var(--ds-bg-3)`. */
	grounds?: string[];
	/** Default 4.5; use 7 for the high-contrast theme. */
	text?: number;
	/** Default 3. */
	mark?: number;
}

/**
 * Checks every stop of a scale the way scripts/check-contrast.mjs checks the built-in severity
 * scale: its ink on its ground (text), and its mark on the page grounds (non-text).
 */
export function checkScaleContrast<V extends string>(
	scale: Scale<V>,
	{
		within,
		resolve = resolveIn(within ?? document.body),
		grounds = ['var(--ds-bg-1)', 'var(--ds-bg-3)'],
		text = 4.5,
		mark = 3
	}: ScaleContrastOptions = {}
): ScaleContrastResult[] {
	const out: ScaleContrastResult[] = [];
	const push = (
		value: string,
		pair: ScaleContrastResult['pair'],
		fg: string,
		bg: string,
		target: number
	) => {
		const ratio = contrastRatio(resolve(fg), resolve(bg));
		out.push({ value, pair, fg, bg, ratio, target, ok: ratio >= target });
	};
	for (const s of scale.unknown ? [...scale.stops, scale.unknown] : scale.stops) {
		push(s.value, 'ink on bg', s.ink, s.bg, text);
		for (const g of grounds) push(s.value, 'mark on ground', s.mark, g, mark);
	}
	return out;
}

// An unresolvable var() is invalid at computed-value time, so the probe inherits: give it a
// sentinel parent color to tell "unresolved" from a real color.
const SENTINEL = 'rgb(1, 2, 3)';

function resolveIn(within: Element): (css: string) => string {
	return (css) => {
		const box = document.createElement('span');
		const probe = document.createElement('span');
		box.style.cssText = `display: none; color: ${SENTINEL}`;
		probe.style.color = css;
		box.appendChild(probe);
		within.appendChild(box);
		const color = getComputedStyle(probe).color;
		box.remove();
		if (color === SENTINEL) throw new Error(`checkScaleContrast: ${css} does not resolve here`);
		return color;
	};
}
