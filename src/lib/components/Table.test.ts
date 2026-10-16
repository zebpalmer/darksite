import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRawSnippet } from 'svelte';
import { fireEvent, render, screen, within } from '@testing-library/svelte';
import TableComponent, { hiddenPriorities } from './Table.svelte';
import type { TableColumn } from './Table.svelte';
import TableBindHarness from '../../tests/TableBindHarness.svelte';

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

	it('binds sort and selection to map entries that start undefined', async () => {
		render(TableBindHarness);
		expect(screen.getByTestId('sort').textContent).toBe('none');
		await fireEvent.click(screen.getByRole('button', { name: 'Name' }));
		expect(screen.getByTestId('sort').textContent).toBe('name asc');
		await fireEvent.click(screen.getAllByRole('checkbox', { name: 'Select row' })[1]);
		expect(screen.getByTestId('picks').textContent).toBe('r2');
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

	it('groups rows under header rows with a count, in the order groups first appear', async () => {
		const grouped = [
			{ id: 'a', name: 'Alpha', count: 1, queue: 'Open' },
			{ id: 'b', name: 'Bravo', count: 2, queue: 'Closed' },
			{ id: 'c', name: 'Charlie', count: 3, queue: 'Open' }
		];
		type G = (typeof grouped)[number];
		const GTable = TableComponent<G>;
		render(GTable, {
			rows: grouped,
			columns: [{ key: 'name', label: 'Name' }],
			rowKey: (r: G) => r.id,
			label: 'Records',
			groupBy: (r: G) => r.queue,
			groupLabel: (k: string) => `${k} queue`
		});
		const table = screen.getByRole('table', { name: 'Records' });
		const headers = within(table).getAllByRole('rowheader');
		expect(headers.map((h) => h.textContent?.replace(/\s+/g, ' ').trim())).toEqual([
			'Open queue 2',
			'Closed queue 1'
		]);
		expect(headers[0].getAttribute('scope')).toBe('rowgroup');
		expect(headers[0].getAttribute('colspan')).toBe('1');
		expect(table.querySelectorAll('tbody')).toHaveLength(2);
		// Rows show group by group, and the arrow keys follow that order across groups.
		const dataRows = [...table.querySelectorAll('tbody tr:not(.group-row)')] as HTMLElement[];
		expect(dataRows.map((r) => r.textContent?.trim())).toEqual(['Alpha', 'Charlie', 'Bravo']);
		dataRows[1].focus();
		await fireEvent.keyDown(dataRows[1], { key: 'ArrowDown' });
		expect(document.activeElement).toBe(dataRows[2]);
	});

	it('renders a custom group header', () => {
		const group = createRawSnippet((g: () => { label: string; count: number }) => ({
			render: () => `<span class="custom">${g().label} (${g().count})</span>`
		}));
		render(Table, { ...base, groupBy: (r: Row) => (r.count === null ? 'Unknown' : 'Known'), group });
		expect(screen.getByText('Known (2)')).toBeTruthy();
		expect(screen.getByText('Unknown (1)')).toBeTruthy();
	});

	it('marks a row with a tone or a severity stripe', () => {
		render(Table, {
			...base,
			rowTone: (r: Row) => (r.count === null ? 'warning' : null),
			rowSeverity: (r: Row) => (r.id === 'r3' ? 'high' : null)
		});
		const r = bodyRows();
		expect(r[0].hasAttribute('data-mark')).toBe(false);
		expect(r[1].dataset.tone).toBe('warning');
		expect(r[1].style.getPropertyValue('--row-mark')).toBe('var(--ds-warning)');
		expect(r[2].dataset.tone).toBe('high');
		expect(r[2].style.getPropertyValue('--row-mark')).toBe('var(--ds-sev-high)');
	});
});

describe('Table column priority widths', () => {
	afterEach(() => vi.unstubAllGlobals());

	it('hides priorities below the default or the given widths', () => {
		expect(hiddenPriorities(800)).toEqual([]);
		expect(hiddenPriorities(600)).toEqual([3]);
		expect(hiddenPriorities(400)).toEqual([2, 3]);
		expect(hiddenPriorities(900, { 3: 960 })).toEqual([3]);
		expect(hiddenPriorities(600, { 2: 640, 3: 960 })).toEqual([2, 3]);
	});

	it('measures its own width when hideBelow is set', async () => {
		let notify = () => {};
		vi.stubGlobal(
			'ResizeObserver',
			class {
				constructor(cb: () => void) {
					notify = cb;
				}
				observe() {}
				disconnect() {}
			}
		);
		const width = vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(900);
		const { container } = render(Table, {
			...base,
			columns: [...columns, { key: 'id', label: 'Id', priority: 3 }],
			hideBelow: { 3: 960 }
		});
		const root = container.querySelector('.ds-table') as HTMLElement;
		expect(root.hasAttribute('data-priority-at')).toBe(true);
		await vi.waitFor(() => expect(root.dataset.hide).toBe('3'));
		width.mockReturnValue(1200);
		notify();
		await vi.waitFor(() => expect(root.dataset.hide).toBeUndefined());
		width.mockRestore();
	});
});

describe('Table keyboard stop', () => {
	it('keeps one row in the tab order after the rows shrink', async () => {
		const { rerender } = render(Table, base);
		const rowsBefore = bodyRows();
		await fireEvent.focus(rowsBefore[2]);
		expect(rowsBefore[2].tabIndex).toBe(0);
		await rerender({ ...base, rows: rows.slice(0, 1) });
		const after = bodyRows();
		expect(after.filter((r) => r.tabIndex === 0)).toHaveLength(1);
	});
});

describe('Table column tips', () => {
	it('puts a named HelpTip beside a header, outside its sort button', () => {
		const cols: TableColumn<Row>[] = [
			{ key: 'name', label: 'Name', sortable: true, tip: 'The name as filed' },
			{ key: 'count', label: 'Count', align: 'end' }
		];
		render(Table, { ...base, columns: cols });
		const tip = screen.getByRole('button', { name: 'About Name' });
		expect(tip.closest('th')).toBeTruthy();
		expect(tip.closest('button.sort')).toBeNull();
		expect(document.getElementById(tip.getAttribute('aria-describedby')!)?.textContent).toBe('The name as filed');
		expect(screen.getByRole('button', { name: /^Name/ }).classList.contains('sort')).toBe(true);
	});
});
