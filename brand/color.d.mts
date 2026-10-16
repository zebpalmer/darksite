export type Rgba = [number, number, number, number];
export interface Oklch {
	l: number;
	c: number;
	h: number;
}
export function parse(raw: string): Rgba;
export function toHex(rgb: readonly number[]): string;
export function oklch(raw: string): Oklch;
export function fromOklch(color: Oklch): string;
export function luminance(raw: string): number;
export function contrast(a: string, b: string): number;
export function grounds(raw: string): string[];
export function contrastOn(fg: string, bg: string): number;
