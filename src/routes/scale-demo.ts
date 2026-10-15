// A neutral eight-stop confidence scale with an unknown stop, for the ScaleBadge and ScalePicker
// gallery pages. Its colors are the demo app's own (scale-demo.css), never severity colors.
import { defineScale } from '#lib';

const names = [
	'Remote',
	'Unlikely',
	'Doubtful',
	'Even',
	'Probable',
	'Likely',
	'Very likely',
	'Certain'
] as const;

export const confidence = defineScale({
	name: 'Confidence',
	stops: names.map((label, i) => ({
		value: `c${i + 1}` as `c${number}`,
		label,
		mark: `var(--app-conf-${i + 1})`,
		bg: `var(--app-conf-${i + 1}-bg)`,
		ink: `var(--app-conf-${i + 1}-ink)`
	})),
	unknown: { value: 'unknown', label: 'Unknown' }
});

export type Confidence = (typeof confidence.values)[number];
