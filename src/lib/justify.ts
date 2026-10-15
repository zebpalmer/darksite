// The justified-rows layout behind JustifiedGrid, kept pure so it can be tested on its own.

export interface JustifiedBox {
	/** Index into the input list. */
	index: number;
	width: number;
	height: number;
}

export interface JustifiedRow {
	height: number;
	boxes: JustifiedBox[];
}

export interface JustifyOptions {
	/** The width to fill, px. */
	width: number;
	/** The row height to land near, px. */
	target: number;
	gap?: number;
	/** No row grows past this multiple of the target. Default 1.6. */
	maxScale?: number;
}

/** Unknown or extreme ratios fall back to square or are clamped, so one odd image cannot break a row. */
export function clampAspect(aspect: number): number {
	if (!Number.isFinite(aspect) || aspect <= 0) return 1;
	return Math.min(5, Math.max(0.2, aspect));
}

/**
 * Lays out images, given as width ÷ height ratios, in rows that fill `width` exactly at their own
 * aspect ratio. Greedy: a row takes images until filling the width would make it shorter than the
 * target, then closes on whichever break lands nearer the target. The last row keeps the target
 * height, left-aligned, unless it already overfills.
 */
export function justifyRows(aspects: readonly number[], options: JustifyOptions): JustifiedRow[] {
	const { width, target, gap = 6, maxScale = 1.6 } = options;
	if (width <= 0 || target <= 0) return [];
	const ratios = aspects.map(clampAspect);
	const rows: JustifiedRow[] = [];
	const heightFor = (sum: number, n: number) => (width - gap * (n - 1)) / sum;

	const close = (start: number, end: number, height: number) => {
		rows.push({
			height,
			boxes: ratios
				.slice(start, end)
				.map((a, k) => ({ index: start + k, width: a * height, height }))
		});
	};

	let start = 0;
	let sum = 0;
	for (let i = 0; i < ratios.length; i++) {
		const withSum = sum + ratios[i];
		const withH = heightFor(withSum, i - start + 1);
		if (withH > target) {
			sum = withSum;
			continue;
		}
		// Adding image i brings the row to or under the target. Close before it if that is nearer.
		const n = i - start;
		const withoutH = n > 0 ? heightFor(sum, n) : Infinity;
		if (n > 0 && withoutH - target < target - withH && withoutH <= target * maxScale) {
			close(start, i, withoutH);
			start = i;
			sum = ratios[i];
			if (heightFor(sum, 1) <= target) {
				close(start, i + 1, heightFor(sum, 1));
				start = i + 1;
				sum = 0;
			}
		} else {
			close(start, i + 1, withH);
			start = i + 1;
			sum = 0;
		}
	}
	if (start < ratios.length) {
		close(start, ratios.length, Math.min(target, heightFor(sum, ratios.length - start)));
	}
	return rows;
}
