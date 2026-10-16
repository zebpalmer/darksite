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
	TopBar: {}
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
