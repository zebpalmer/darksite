// Server rendering: every component must render without touching window, document, matchMedia,
// localStorage or the observers, which do not exist on the server.
import { describe, expect, it } from 'vitest';
import { createRawSnippet, type Component } from 'svelte';
import { render } from 'svelte/server';
import * as lib from './index.js';

const page = createRawSnippet(() => ({ render: () => '<p>Page</p>' }));

const props: Record<string, Record<string, unknown>> = {
	ActiveFilters: { sections: [], value: {} },
	AppShell: { items: [{ id: 'a', label: 'Home', href: '/' }], current: 'a', children: page },
	Avatar: { name: 'Ada Lovelace' },
	Banner: { id: 'b', message: 'Maintenance tonight', dismissible: true },
	Card: { href: '/r/1', title: 'Record', duration: 90 },
	Chip: { label: 'Urgent' },
	Combobox: { items: [{ value: '1', label: 'North' }], label: 'Site' },
	EmptyState: { title: 'Nothing here' },
	EntityCard: { href: '/p/1', name: 'Grace Hopper' },
	FullBleed: { children: page },
	Intro: { title: 'Welcome', lead: 'A sentence.' },
	LinkCard: { href: '/x', title: 'Docs' },
	Steps: { steps: [{ title: 'One' }] },
	TopNav: {
		items: [
			{ id: 'a', label: 'Home', href: '/' },
			{ id: 'b', label: 'Setup', href: '/setup', group: 'g', section: 'Learn', description: 'How.' }
		],
		groups: [{ id: 'g', label: 'Guides' }],
		product: 'Acme'
	},
	FactList: { items: [{ label: 'Owner', value: null }] },
	FileInput: {},
	FilterRail: {
		sections: [{ key: 's', label: 'Status', options: [{ value: 'a', label: 'Open' }] }],
		value: {}
	},
	HelpTip: { text: 'A note' },
	Input: { value: 'x' },
	KeyCap: { keys: 'shift+enter' },
	LoadMore: { shown: 50, total: 295, onLoadMore: () => {} },
	ModePicker: {},
	Meter: { segments: [{ value: 1, label: 'Done' }], max: 2, label: 'Progress' },
	NavRail: { items: [{ id: 'a', label: 'Home', href: '/' }], rememberAs: 'main' },
	PageHeader: { title: 'Records', count: 12 },
	Select: { options: [{ value: 'a', label: 'Open' }] },
	SegmentedControl: { options: [{ value: 'a', label: 'A' }], value: 'a', label: 'Mode' },
	SeverityBadge: { severity: 'high' },
	SeverityPicker: { value: null },
	SideNav: { items: [{ id: 'a', label: 'General', href: '#g' }], label: 'Settings' },
	Stat: { label: 'Open', value: 12 },
	StatusBadge: { label: 'Review', until: '2026-10-20' },
	TabBar: { items: [{ id: 'a', label: 'Home', href: '/' }] },
	Table: {
		rows: [{ id: '1', name: 'Alpha' }],
		columns: [{ key: 'name', label: 'Name' }],
		rowKey: (r: { id: string }) => r.id,
		label: 'Records'
	},
	Tabs: { tabs: [{ value: 'a', label: 'Queue', count: 3 }], value: 'a', label: 'Lanes' },
	Textarea: { value: 'Note' },
	Toaster: {},
	TopBar: {},
	CopyButton: { value: 'R-00412', inline: true, label: 'Copy serial' },
	CodeBlock: { code: 'npm install', label: 'Shell' },
	Notice: { id: 'n', title: 'Provisional', message: 'Figures may change.', dismissible: true },
	CellBar: { value: 3, max: 10 },
	BarSeries: {
		series: [{ key: 'a', label: 'Opened' }],
		data: [{ label: 'Oct 1', values: { a: 3 } }],
		label: 'Records per day'
	},
	Ring: { segments: [{ label: 'Done', value: 3 }], max: 10, label: 'Progress' },
	Pager: { url: 'https://example.com/list?page=2', total: 120 },
	Slider: { value: 40, label: 'Level', ticks: [0, 50, 100], showValue: true },
	ThemeToggle: { showLabel: 'Appearance' },
	SearchPalette: {
		open: true,
		query: 'riv',
		search: () => [
			{ id: 'people', label: 'People', items: [{ id: 'p', title: 'A. Rivera', href: '/p' }] }
		],
		empty: page
	}
};

describe('server rendering', () => {
	for (const [name, p] of Object.entries(props)) {
		it(`renders ${name}`, () => {
			const component = (lib as unknown as Record<string, Component<Record<string, unknown>>>)[
				name
			];
			expect(component, `${name} is exported`).toBeTruthy();
			const { body } = render(component, { props: p });
			expect(body.length).toBeGreaterThan(0);
		});
	}
});

describe('server rendering the shell', () => {
	const find = createRawSnippet(() => ({
		render: () => '<input type="search" aria-label="Find">'
	}));
	const items = [{ id: 'a', label: 'Home', href: '/' }];

	it("renders the header actions' fallback bar, which CSS hides beside a level-1 header", () => {
		const { body } = render(lib.AppShell, {
			props: { items, current: 'a', headerActions: find, children: page }
		});
		expect(body).toContain('ds-appshell-fallback');
		expect(body).toContain('aria-label="Find"');
	});
});

describe('server rendering a hero dialog', () => {
	it('renders an open hero with its grab handle and a primary confirm', () => {
		const { body } = render(lib.Dialog, {
			props: { open: true, size: 'hero', title: 'Welcome', confirmLabel: 'Get started' }
		});
		expect(body).toContain('data-size="hero"');
		expect(body).toContain('class="grab');
		expect(body).toContain('data-variant="primary"');
	});

	it('renders a decorative mark and the primary before a ghost Cancel', () => {
		const mark = createRawSnippet(() => ({ render: () => '<svg class="logo"></svg>' }));
		const { body } = render(lib.Dialog, {
			props: { open: true, size: 'hero', title: 'Welcome', confirmLabel: 'Get started', mark }
		});
		expect(body).toMatch(/class="mark[^"]*"[^>]*aria-hidden="true"/);
		expect(body.indexOf('class="logo"')).toBeLessThan(body.indexOf('Welcome'));
		expect(body.indexOf('data-role="confirm"')).toBeLessThan(body.indexOf('data-role="cancel"'));
		expect(body).toContain('data-variant="ghost"');
	});
});

describe('server rendering a Stat broken down by level', () => {
	it('renders a badge and a count per level', () => {
		const { body } = render(lib.Stat, {
			props: {
				label: 'Needs attention',
				value: 6,
				scale: lib.severityScale,
				levels: [
					{ level: 'critical', value: 4 },
					{ level: 'medium', value: 2 }
				]
			}
		});
		expect(body.indexOf('Medium')).toBeLessThan(body.indexOf('Critical'));
		expect(body.match(/class="entry/g)).toHaveLength(2);
	});
});
