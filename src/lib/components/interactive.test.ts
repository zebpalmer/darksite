import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/svelte';
import ActiveFilters from './ActiveFilters.svelte';
import Banner from './Banner.svelte';
import Chip from './Chip.svelte';
import FilterRail from './FilterRail.svelte';
import Timeline from './Timeline.svelte';
import type { FilterSection } from '../filters.js';
import type { TimelineEntry } from './Timeline.svelte';

describe('Chip', () => {
	it('is a toggle that reports mixed', () => {
		render(Chip, { selected: 'mixed', onclick: () => {} });
		expect(screen.getByRole('button').getAttribute('aria-pressed')).toBe('mixed');
	});

	it('is a removable token whose × is its own named button', async () => {
		const onremove = vi.fn();
		render(Chip, { removable: true, removeLabel: 'Remove Urgent', onremove });
		await fireEvent.click(screen.getByRole('button', { name: 'Remove Urgent' }));
		expect(onremove).toHaveBeenCalledTimes(1);
	});

	it('is a dashed suggestion with its source', () => {
		const { container } = render(Chip, { suggestion: true, source: 'Model', confidence: 0.8 });
		expect((container.querySelector('.ds-chip') as HTMLElement).dataset.state).toBe('suggested');
		expect(container.textContent).toContain('Model');
	});
});

const sections: FilterSection[] = [
	{ key: 'status', label: 'Status', options: [{ value: 'ready', label: 'Ready', count: 12 }, { value: 'hold', label: 'On hold', count: 3 }] },
	{ key: 'owner', label: 'Owner', multiple: false, options: [{ value: 'field', label: 'Field team' }] }
];

describe('FilterRail', () => {
	it('toggles options, counts what is on, and clears all', async () => {
		const onchange = vi.fn();
		render(FilterRail, { sections, onchange });
		const rail = screen.getByRole('complementary', { name: 'Filters' });
		await fireEvent.click(within(rail).getByRole('checkbox', { name: 'Ready' }));
		expect(onchange).toHaveBeenLastCalledWith({ status: ['ready'] });
		await fireEvent.click(within(rail).getByRole('radio', { name: 'Field team' }));
		expect(onchange).toHaveBeenLastCalledWith({ status: ['ready'], owner: ['field'] });
		expect(within(rail).getByText('2 on')).toBeTruthy();
		await fireEvent.click(within(rail).getByRole('button', { name: 'Clear all' }));
		expect(onchange).toHaveBeenLastCalledWith({});
	});

	it('collapses to a strip whose toggle says how many filters are on', async () => {
		render(FilterRail, { sections, value: { status: ['hold'] } });
		const rail = screen.getByRole('complementary', { name: 'Filters' });
		await fireEvent.click(within(rail).getByRole('button', { name: 'Collapse filters' }));
		expect(within(rail).getByRole('button', { name: 'Show filters (1 on)' })).toBeTruthy();
	});
});

describe('ActiveFilters', () => {
	it('shows each applied filter as a removable chip', async () => {
		const onchange = vi.fn();
		render(ActiveFilters, { sections, value: { status: ['ready', 'hold'] }, onchange });
		await fireEvent.click(screen.getByRole('button', { name: 'Remove Status: On hold' }));
		expect(onchange).toHaveBeenLastCalledWith({ status: ['ready'] });
	});

	it('renders nothing with no filters on', () => {
		render(ActiveFilters, { sections, value: {} });
		expect(screen.queryByRole('group', { name: 'Active filters' })).toBeNull();
	});
});

const now = '2026-10-14T12:00:00Z';
const entries: TimelineEntry[] = [
	{ id: '1', at: '2026-10-14T11:54:00Z', actor: 'A. Rivera', verb: 'assigned', object: [{ code: 'R-00412' }, ' to M. Lund'], detail: 'Was unassigned' },
	...Array.from({ length: 3 }, (_, i) => ({ id: `b${i}`, at: '2026-10-14T09:00:00Z', actor: 'M. Lund', verb: 'set', object: `R-0${i}`, batchKey: 'req-7' })),
	{ id: '5', at: '2026-10-12T09:00:00Z', source: 'Nightly import', verb: 'created', object: [{ code: 'R-00413' }] }
];

describe('Timeline', () => {
	it('writes each entry as a sentence with identifiers in mono and a relative time', () => {
		const { container } = render(Timeline, { entries, now });
		const first = container.querySelector('li') as HTMLElement;
		expect(first.textContent?.replace(/\s+/g, ' ')).toContain('A. Rivera assigned R-00412 to M. Lund');
		expect(first.querySelector('code')?.textContent).toBe('R-00412');
		expect(first.querySelector('time')?.textContent).toBe('6 min ago');
		expect(first.textContent).toContain('Was unassigned');
	});

	it('collapses a batch into one row that expands', async () => {
		render(Timeline, { entries, now, batchSummary: (list: readonly TimelineEntry[]) => `${list.length} records to Ready` });
		expect(screen.getByText(/3 records to Ready/)).toBeTruthy();
		const toggle = screen.getByRole('button', { name: /Show 3/ });
		await fireEvent.click(toggle);
		expect(toggle.getAttribute('aria-expanded')).toBe('true');
		expect(screen.getByText('R-01')).toBeTruthy();
	});

	it('shows a system actor as a source and limits the slice with a Show all link', () => {
		const { container } = render(Timeline, { entries, now, limit: 2, allHref: '/history' });
		expect(screen.getAllByRole('listitem').filter((li) => li.parentElement?.getAttribute('aria-label') === 'History')).toHaveLength(2);
		expect(screen.getByRole('link', { name: 'Show all' }).getAttribute('href')).toBe('/history');
		expect(container.textContent).not.toContain('Nightly import');
	});
});

describe('Banner', () => {
	it('announces a warning politely and remembers a dismissal', async () => {
		localStorage.clear();
		const { unmount } = render(Banner, { id: 'sync', tone: 'warning', message: 'The nightly sync has failed.', dismissible: true });
		expect(screen.getByRole('status').textContent).toContain('nightly sync');
		await fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
		expect(screen.queryByRole('status')).toBeNull();
		unmount();
		render(Banner, { id: 'sync', tone: 'warning', message: 'The nightly sync has failed.', dismissible: true });
		await vi.waitFor(() => expect(screen.queryByRole('status')).toBeNull());
	});

	it('is an alert that cannot be dismissed while it is a danger', () => {
		render(Banner, { id: 'ro', tone: 'danger', message: 'Read-only maintenance from 18:00.', dismissible: true });
		expect(screen.getByRole('alert')).toBeTruthy();
		expect(screen.queryByRole('button', { name: 'Dismiss' })).toBeNull();
	});
});
