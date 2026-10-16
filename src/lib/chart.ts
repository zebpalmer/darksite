// What the small charts (CellBar, BarSeries, Ring) share: their colors. Charts take the
// categorical palette only — `ds-cat-1` … `ds-cat-5` and the second accent — never a semantic,
// severity or accent color, so a chart color never reads as a meaning.

/** A categorical series color: `ds-cat-1` … `ds-cat-5`, or the second accent. */
export type ChartTone = 1 | 2 | 3 | 4 | 5 | 'accent-2';

/** The six series colors in their default order. */
export const CHART_TONES: readonly ChartTone[] = [1, 2, 3, 4, 5, 'accent-2'];

/** The CSS color for a series: its own `tone`, else the next color by position. */
export function chartColor(tone: ChartTone | undefined, index: number): string {
	const t = tone ?? CHART_TONES[index % CHART_TONES.length];
	return t === 'accent-2' ? 'var(--ds-accent-2)' : `var(--ds-cat-${t})`;
}
