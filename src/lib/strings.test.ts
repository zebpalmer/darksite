import { afterEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Missing from './components/Missing.svelte';
import { formatAge, formatDue, formatRelative } from './time.js';
import { resetStrings, setStrings } from './strings.svelte.js';

afterEach(() => resetStrings());

describe('setStrings', () => {
	it('translates the words components speak', () => {
		setStrings({ noValue: 'Aucune valeur' });
		render(Missing);
		expect(screen.getByText('Aucune valeur')).toBeTruthy();
	});

	it('translates the relative time words', () => {
		const now = new Date('2026-10-14T12:00:00Z');
		setStrings({
			minutes: (n) => `${n} Min.`,
			days: (n) => `${n} ${n === 1 ? 'Tag' : 'Tage'}`,
			ago: (age) => `vor ${age}`,
			inTime: (t) => `in ${t}`
		});
		expect(formatAge(new Date(now.getTime() - 6 * 60_000), now)).toBe('6 Min.');
		expect(formatRelative(new Date(now.getTime() - 2 * 86_400_000), now)).toBe('vor 2 Tage');
		expect(formatDue('2026-10-17', '2026-10-14')).toBe('in 3 Tage');
	});
});
