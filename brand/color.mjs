// Color math for brands: hex and rgba parsing, OKLCH (perceptual lightness, chroma, hue) and WCAG
// 2.1 contrast. No dependencies.

/** `#rrggbb` or `rgba(r, g, b, a)` → [r, g, b, a], channels 0–255. */
export function parse(raw) {
	const m = /^rgba?\(([^)]+)\)$/.exec(String(raw).trim());
	if (m) {
		const [r, g, b, a = 1] = m[1].split(',').map(Number);
		return [r, g, b, a];
	}
	const h = String(raw).trim().replace('#', '');
	const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h;
	if (!/^[0-9a-f]{6}$/i.test(full)) throw new Error(`not a color: ${raw}`);
	return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)).concat(1);
}

export const toHex = ([r, g, b]) =>
	'#' +
	[r, g, b]
		.map((c) =>
			Math.round(Math.min(255, Math.max(0, c)))
				.toString(16)
				.padStart(2, '0')
		)
		.join('');

const lin = (c) => ((c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const unlin = (c) => 255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

/** A color → { l, c, h }: OKLCH lightness 0–1, chroma, hue in degrees. */
export function oklch(raw) {
	const [r, g, b] = parse(raw).slice(0, 3).map(lin);
	const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
	const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
	const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
	const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
	const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
	const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
	const c = Math.hypot(A, B);
	const h = c < 1e-5 ? 0 : ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360;
	return { l: L, c, h };
}

function rgbOf({ l: L, c, h }) {
	const A = c * Math.cos((h * Math.PI) / 180);
	const B = c * Math.sin((h * Math.PI) / 180);
	const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
	const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
	const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
	return [
		4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
		-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
		-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
	];
}

const inGamut = (rgb) => rgb.every((v) => v >= -1e-4 && v <= 1 + 1e-4);

/** { l, c, h } → hex, reducing chroma (never lightness or hue) until the color fits in sRGB. */
export function fromOklch({ l, c, h }) {
	l = Math.min(1, Math.max(0, l));
	let lo = 0;
	let hi = Math.max(0, c);
	if (!inGamut(rgbOf({ l, c: hi, h }))) {
		for (let i = 0; i < 24; i++) {
			const mid = (lo + hi) / 2;
			if (inGamut(rgbOf({ l, c: mid, h }))) lo = mid;
			else hi = mid;
		}
		hi = lo;
	}
	return toHex(rgbOf({ l, c: hi, h }).map(unlin));
}

export function luminance(raw) {
	const [r, g, b] = parse(raw).slice(0, 3).map(lin);
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.1 contrast of two opaque colors. */
export function contrast(a, b) {
	const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
	return (x + 0.05) / (y + 0.05);
}

/** A translucent ground over whatever is behind it, as the opaque colors to check: over white and
 *  over black. An opaque ground is itself. */
export function grounds(raw) {
	const [r, g, b, a] = parse(raw);
	if (a >= 1) return [toHex([r, g, b])];
	return [255, 0].map((k) => toHex([r, g, b].map((ch) => ch * a + k * (1 - a))));
}

/** Contrast of a foreground on a ground that may be translucent: the worst case. */
export const contrastOn = (fg, bg) =>
	Math.min(...grounds(bg).map((g) => contrast(toHex(parse(fg)), g)));
