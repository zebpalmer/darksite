import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/svelte';
import KeyLegend from './KeyLegend.svelte';
import { buildHotkeyMap, type HotkeyBinding } from '../hotkeys.js';

const bindings: HotkeyBinding[] = [
	{ keys: ['j', 'down'], action: 'next', label: 'Next record', group: 'Move' },
	{ keys: 'shift+enter', action: 'save', label: 'Save and next', group: 'Record' },
	{ keys: 'e', action: 'edit', label: 'Edit', group: 'Record', when: () => false },
	{ keys: '?', action: 'legend', label: 'Show shortcuts', group: 'Help' },
	{ keys: 'ctrl+k', action: 'search', label: 'Search', group: 'Help', hidden: true }
];

describe('KeyLegend', () => {
	it('lists bindings by group, in the given order, with always-visible caps', () => {
		render(KeyLegend, { bindings, order: ['Help'] });
		const legend = screen.getByRole('group', { name: 'Keyboard shortcuts' });
		const headings = within(legend).getAllByRole('heading');
		expect(headings.map((h) => h.textContent)).toEqual(['Help', 'Move', 'Record']);
		const move = within(legend).getByRole('region', { name: 'Move' });
		const cap = move.querySelector('kbd') as HTMLElement;
		expect(cap.textContent).toBe('j / ↓');
		expect(cap.hasAttribute('data-hint')).toBe(false);
		expect(move.querySelector('dd')?.textContent).toBe('Next record');
		expect(legend.textContent).toContain('⇧Enter');
		expect(legend.textContent).not.toContain('Search');
	});

	it('takes a map and can leave out bindings that are not live', () => {
		render(KeyLegend, { bindings: buildHotkeyMap(bindings), activeOnly: true, label: 'Keys' });
		const legend = screen.getByRole('group', { name: 'Keys' });
		expect(legend.textContent).toContain('Save and next');
		expect(legend.textContent).not.toContain('Edit');
	});
});
