export type Target = Record<string, number>;
export interface Pair {
	fg: string;
	bg: string;
	target: Target;
	why: string;
}
export interface Evaluated extends Pair {
	ratio: number;
	need: number;
	ok: boolean;
	shortfall: boolean;
}
export const TEXT: Target;
export const MARK: Target;
export const SEVERITIES: string[];
export const SHORTFALLS: Set<string>;
export function buildPairs(severities?: readonly string[]): Pair[];
export function isShortfall(fg: string, bg: string, theme: string): boolean;
export function targetFor(target: Target, theme: string, family: string): number;
export function evaluate(
	pairs: readonly Pair[],
	value: (role: string) => string,
	theme: string,
	family: string
): Evaluated[];
