// The gallery's component list: the index page lists it, the shell's search finds in it.

const route: Record<string, string> = {
	ActiveFilters: 'filterrail',
	SheetItem: 'sheet',
	ModePicker: 'brands',
	TopNav: 'overview',
	Intro: 'overview',
	Steps: 'overview',
	LinkCard: 'overview',
	CodeBlock: 'copybutton',
	CellBar: 'charts',
	BarSeries: 'charts',
	Ring: 'charts'
};

export const groups: Record<string, string[]> = {
	Actions: ['Button', 'CopyButton', 'KeyCap', 'KeyLegend', 'Tooltip'],
	Theming: ['ModePicker'],
	'Page types': ['Intro', 'Steps', 'LinkCard'],
	Selection: ['Chip', 'SegmentedControl', 'Tabs'],
	Filtering: ['ActiveFilters', 'FilterRail'],
	Scales: ['ScaleBadge', 'ScalePicker', 'SeverityBadge', 'SeverityPicker'],
	Forms: [
		'Checkbox',
		'Combobox',
		'Field',
		'FileInput',
		'Input',
		'Radio',
		'Select',
		'Switch',
		'Textarea',
		'Rating',
		'Slider',
		'Stepper'
	],
	Data: [
		'Meter',
		'Stat',
		'Table',
		'Timeline',
		'ListRow',
		'FactList',
		'Missing',
		'LoadMore',
		'Pager',
		'CodeBlock'
	],
	Charts: ['CellBar', 'BarSeries', 'Ring'],
	Overlays: ['Dialog', 'Menu', 'Popover', 'Sheet', 'SheetItem'],
	Feedback: [
		'EmptyState',
		'HelpTip',
		'Notice',
		'NewBadge',
		'SkeletonLoader',
		'SourceBadge',
		'Spinner',
		'Toaster',
		'ErrorPage'
	],
	Content: ['Avatar', 'EntityCard'],
	// Optional: for products whose content is images and video.
	Media: ['Card', 'Carousel', 'JustifiedGrid', 'Lightbox'],
	Layout: ['ActionBar', 'Grid', 'PageHeader', 'Pane', 'WorkView', 'FullBleed'],
	Shell: ['AppShell', 'NavRail', 'SideNav', 'TabBar', 'TopBar', 'TopNav']
};

export const names: string[] = Object.values(groups).flat().sort();

export function componentHref(name: string): string {
	return `/${route[name] ?? name.toLowerCase()}`;
}

/** The best match for a query: an exact name, then a prefix, then anywhere in the name. */
export function findComponent(query: string): string | undefined {
	const q = query.trim().toLowerCase();
	if (!q) return undefined;
	const lower = names.map((n) => n.toLowerCase());
	const i = [
		lower.indexOf(q),
		lower.findIndex((n) => n.startsWith(q)),
		lower.findIndex((n) => n.includes(q))
	].find((x) => x >= 0);
	return i === undefined ? undefined : names[i];
}
