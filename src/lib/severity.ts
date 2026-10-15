// The severity scale: one place for its order, names and color roles (docs/severity.md). It is
// the built-in instance of the general ordinal scale (scale.ts); the helpers below keep their
// severity-specific names.

import { defineScale, type ScaleColors } from './scale.js';

export const SEVERITIES = ['info', 'low', 'medium', 'high', 'critical'] as const;
export type Severity = (typeof SEVERITIES)[number];

const LABELS: Record<Severity, string> = {
	info: 'Info',
	low: 'Low',
	medium: 'Medium',
	high: 'High',
	critical: 'Critical'
};

/** The built-in severity scale. scripts/check-contrast.mjs checks its tokens in every theme. */
export const severityScale = defineScale<Severity>({
	name: 'Severity',
	stops: SEVERITIES.map((s) => ({
		value: s,
		label: LABELS[s],
		mark: `var(--ds-sev-${s})`,
		bg: `var(--ds-sev-${s}-bg)`,
		ink: `var(--ds-sev-${s}-ink)`
	})),
	off: 'var(--ds-sev-off)'
});

export function severityLabel(severity: Severity): string {
	return severityScale.label(severity);
}

/** 1-based position on the scale: Info = 1 … Critical = 5. */
export function severityRank(severity: Severity): number {
	return severityScale.rank(severity);
}

/** CSS references for a stop's three roles: the mark, its tinted ground, and the ink on it. */
export function severityVars(severity: Severity): ScaleColors {
	return severityScale.vars(severity)!;
}
