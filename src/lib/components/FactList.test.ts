import { describe, expect, it } from 'vitest';
import { createRawSnippet } from 'svelte';
import { render, screen } from '@testing-library/svelte';
import FactList from './FactList.svelte';
import Missing from './Missing.svelte';

describe('Missing', () => {
	it('draws an em dash in muted ink and announces "No value"', () => {
		const { container } = render(Missing);
		const mark = container.querySelector('.ds-missing') as HTMLElement;
		expect(mark.querySelector('[aria-hidden="true"]')?.textContent).toBe('—');
		expect(mark.querySelector('.ds-sr-only')?.textContent).toBe('No value');
	});

	it('takes another mark and spoken label', () => {
		const { container } = render(Missing, { mark: 'n/a', label: 'Not set' });
		expect(container.textContent).toBe('n/aNot set');
	});
});

describe('FactList', () => {
	const items = [
		{ label: 'Owner', value: 'A. Rivera' },
		{ label: 'Serial', value: 'R-00412', mono: true },
		{ label: 'Location', value: null },
		{ label: 'Note', value: 'Checked at intake', wide: true, tip: 'Free text from the last edit' }
	];

	it('is a description list with one term and one definition per fact', () => {
		render(FactList, { items });
		expect(screen.getAllByRole('term').map((t) => t.querySelector('.label')?.textContent)).toEqual([
			'Owner',
			'Serial',
			'Location',
			'Note'
		]);
		const values = screen.getAllByRole('definition');
		expect(values).toHaveLength(4);
		expect(values[0].textContent?.trim()).toBe('A. Rivera');
		expect(values[1].hasAttribute('data-mono')).toBe(true);
	});

	it('renders the missing-value mark for an empty value', () => {
		render(FactList, { items });
		const location = screen.getAllByRole('definition')[2];
		expect(location.querySelector('.ds-missing')).toBeTruthy();
		expect(location.textContent).toContain('No value');
	});

	it('puts a tip beside its label and lets a wide fact span both columns', () => {
		const { container } = render(FactList, { items });
		expect(screen.getByRole('tooltip').textContent).toBe('Free text from the last edit');
		const facts = container.querySelectorAll('.fact');
		expect(facts[3].hasAttribute('data-wide')).toBe(true);
		expect(container.querySelector('.ds-facts')?.getAttribute('data-columns')).toBe('2');
	});

	it('hands an item\'s own cell snippet its item and value', () => {
		const cell = createRawSnippet((args: () => { item: { label: string }; value: unknown }) => ({
			render: () => `<i>${args().item.label} = ${String(args().value)}</i>`
		}));
		render(FactList, {
			items: [
				{ label: 'Opened', value: 'Mon', cell },
				{ label: 'Due', value: 'Fri', cell }
			]
		});
		expect(screen.getAllByRole('definition').map((d) => d.textContent)).toEqual(['Opened = Mon', 'Due = Fri']);
	});

	it('renders values through a fallback cell snippet', () => {
		const cell = createRawSnippet((args: () => { item: { label: string }; value: unknown }) => ({
			render: () => `<b>${args().item.label}: ${String(args().value)}</b>`
		}));
		render(FactList, { items: [{ label: 'Count', value: 3 }], columns: 1, cell });
		expect(screen.getByRole('definition').textContent).toBe('Count: 3');
	});
});
