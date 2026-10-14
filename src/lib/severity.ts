// The severity scale: one place for its order, names and color roles (docs/severity.md).

export const SEVERITIES = ['info', 'low', 'medium', 'high', 'critical'] as const;
export type Severity = (typeof SEVERITIES)[number];

const LABELS: Record<Severity, string> = {
	info: 'Info',
	low: 'Low',
	medium: 'Medium',
	high: 'High',
	critical: 'Critical'
};

export function severityLabel(severity: Severity): string {
	return LABELS[severity];
}

/** 1-based position on the scale: Info = 1 … Critical = 5. */
export function severityRank(severity: Severity): number {
	return SEVERITIES.indexOf(severity) + 1;
}

/** CSS references for a stop's three roles: the mark, its tinted ground, and the ink on it. */
export function severityVars(severity: Severity): { mark: string; bg: string; ink: string } {
	return {
		mark: `var(--ds-sev-${severity})`,
		bg: `var(--ds-sev-${severity}-bg)`,
		ink: `var(--ds-sev-${severity}-ink)`
	};
}
