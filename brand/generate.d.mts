/** A color, or a color per mode (`dark`, `light`, `paper`, `night`, `contrast`). A plain string is
 *  the color in the dark modes; the light modes take its hue at their own lightness. */
export type BrandColor =
	string | Partial<Record<'dark' | 'light' | 'paper' | 'night' | 'contrast', string>>;

export interface Brand {
	name: string;
	/** The accent: primary buttons, the current item, focus, links. */
	accent?: BrandColor;
	/** A second color for highlights and charts; never a button or a meaning. */
	accent2?: BrandColor;
	success?: BrandColor;
	warning?: BrandColor;
	danger?: BrandColor;
	/** The grays' tint: a hue in degrees, and chroma as a multiple of the default tint (0 is gray). */
	neutral?: { hue: number; chroma?: number };
	/** Explicit page and text colors per mode; the other grounds and edges follow them. */
	surfaces?: Partial<
		Record<'dark' | 'light' | 'paper' | 'night' | 'contrast', { bg?: string; text?: string }>
	>;
	/** The navigation chrome's own color: the rail, and the top bar and tab bar. */
	chrome?: { rail?: BrandColor; bar?: BrandColor };
	fonts?: { sans?: string; mono?: string; reading?: string };
	/** Exact role values, never adjusted (they still have to pass): `{ "ds-…": "#…" }` at the top
	 *  holds in every mode, and a mode's own map (`{ dark: { "ds-…": "#…" } }`) overrides it. */
	roles?: Record<string, string | Record<string, string>>;
	label?: string;
	note?: string;
	scheme?: boolean;
}

export interface GeneratedBrand {
	name: string;
	/** Per mode, every role the brand changes. */
	modes: Record<string, Record<string, string>>;
	fonts: NonNullable<Brand['fonts']>;
	/** Each color the solver moved to meet a contrast target. */
	notes: string[];
	/** Pairs that still fall short; a brand with any is not usable. */
	failures: string[];
	resolve(mode: string): (role: string) => string;
}

export function generateBrand(tokens: unknown, brand: Brand): GeneratedBrand;
export function brandCss(tokens: unknown, generated: GeneratedBrand, scope?: string): string;
export function themesOf(tokens: unknown): { id: string }[];
