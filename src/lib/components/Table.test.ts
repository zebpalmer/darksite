import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/svelte';
import TableComponent from './Table.svelte';
import type { TableColumn } from './Table.svelte';

interface Row {
	id: string;
	name: string;
	count: number | null;
}

const rows: Row[] = [
	{ id: 'r1', name: 'Alpha', count: 3 },
	{ id: 'r2', name: 'Bravo', count: null },
	{ id: 'r3', name: 'Charlie', count: 12 }
];
const columns: TableColumn<Row>[] = [
	{ key: 'name', label: 'Name', sortable: true },
	{ key: 'count', label: 'Count', align: 'end', sortable: true }
];
// Pin the generic: render() cannot infer a component's type parameter.
const Table = TableComponent<Row>;
const base = { rows, columns, rowKey: (r: Row) => r.id, label: 'Records' };

function bodyRows() {
	return within(screen.getByRole('table', { name: 'Records' })).getAllByRole('row').slice(1);
}

describe('Table', () => {
	it('renders a named table with a header and one row per record', () => {
		render(Table, base);
		expect(screen.getAllByRole('columnheader').map((h) => h.textContent?.trim())).toEqual(['Name', 'Count']);
		expect(bodyRows()).toHaveLength(3);
	});

	it('marks a missing value visibly and for screen readers', () => {
		render(Table, base);
		const cells = within(bodyRows()[1]).getAllByRole('cell');
		expect(cells[1].textContent).toContain('—');
		expect(cells[1].textContent).toContain('No value');
	});

	it('sorts one key at a time and reports it', async () => {
		const onsort = vi.fn();
		render(Table, { ...base, onsort });
		const [name] = screen.getAllByRole('columnheader');
		expect(name.getAttribute('aria-sort')).toBe('none');
		await fireEvent.click(within(name).getByRole('button'));
		expect(onsort).toHaveBeenLastCalledWith({ key: 'name', direction: 'asc' });
		expect(name.getAttribute('aria-sort')).toBe('ascending');
		await fireEvent.click(within(name).getByRole('button'));
		expect(onsort).toHaveBeenLastCalledWith({ key: 'name', direction: 'desc' });
		expect(name.getAttribute('aria-sort')).toBe('descending');
	});

	it('selects all, shows mixed for some, and selects a range with shift-click', async () => {
		render(Table, { ...base, selectable: true });
		const all = screen.getByRole('checkbox', { name: 'Select all rows' }) as HTMLInputElement;
		const rowBoxes = () => screen.getAllByRole('checkbox', { name: 'Select row' }) as HTMLInputElement[];

		await fireEvent.click(rowBoxes()[0]);
		expect(all.getAttribute('aria-checked')).toBe('mixed');
		expect(bodyRows()[0].hasAttribute('data-selected')).toBe(true);

		await fireEvent.click(rowBoxes()[2], { shiftKey: true });
		expect(bodyRows().every((r) => r.hasAttribute('data-selected'))).toBe(true);
		expect(all.checked).toBe(true);

		await fireEvent.click(all);
		expect(bodyRows().some((r) => r.hasAttribute('data-selected'))).toBe(false);
	});

	it('moves row focus with the arrow keys and toggles selection with Space', async () => {
		render(Table, { ...base, selectable: true });
		const r = bodyRows();
		r[0].focus();
		await fireEvent.keyDown(r[0], { key: 'ArrowDown' });
		expect(document.activeElement).toBe(r[1]);
		await fireEvent.keyDown(r[1], { key: ' ' });
		expect(r[1].hasAttribute('data-selected')).toBe(true);
	});

	it('opens a row link on click and on Enter, but not from a control inside the row', async () => {
		render(Table, { ...base, selectable: true, href: (row: Row) => `/records/${row.id}` });
		const link = bodyRows()[0].querySelector('a.row-link') as HTMLAnchorElement;
		expect(link.getAttribute('href')).toBe('/records/r1');
		const clicked = vi.fn((e: Event) => e.preventDefault());
		link.addEventListener('click', clicked);

		await fireEvent.click(within(bodyRows()[0]).getAllByRole('cell')[2]);
		expect(clicked).toHaveBeenCalledTimes(1);

		bodyRows()[0].focus();
		await fireEvent.keyDown(bodyRows()[0], { key: 'Enter' });
		expect(clicked).toHaveBeenCalledTimes(2);

		await fireEvent.click(within(bodyRows()[0]).getByRole('checkbox'));
		expect(clicked).toHaveBeenCalledTimes(2);
	});

	it('is busy with skeleton rows while loading, and shows an empty state with no rows', () => {
		const { unmount } = render(Table, { ...base, loading: true, loadingRows: 4 });
		expect(screen.getByRole('table').getAttribute('aria-busy')).toBe('true');
		expect(bodyRows()).toHaveLength(4);
		unmount();
		render(Table, { ...base, rows: [] });
		expect(screen.getByText('Nothing to show')).toBeTruthy();
	});
});
