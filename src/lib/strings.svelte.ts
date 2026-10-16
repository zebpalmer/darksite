// Every word darksite shows or speaks on its own: labels, announcements, time words. English by
// default. A product in another language overrides them once, before mounting its app, usually in
// the root layout:
//
//   import { setStrings } from 'darksite';
//   setStrings({ close: 'Fermer', dismiss: 'Ignorer', days: (n) => `${n} j` });
//
// A prop that names the same thing (a `label`, `emptyText`) still wins for that one instance.

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

const DEFAULTS = {
	// Common actions and names
	actions: 'Actions',
	cancel: 'Cancel',
	clearAll: 'Clear all',
	close: 'Close',
	confirm: 'Confirm',
	dismiss: 'Dismiss',
	done: 'Done',
	loading: 'Loading',
	moreInformation: 'More information',
	remove: 'Remove',
	/** A removable chip's button: "Remove Status: Open". */
	removeValue: (group: string, value: string) => `Remove ${group}: ${value}`,
	showAll: 'Show all',
	seeAll: 'See all',
	noValue: 'No value',
	/** What a screen reader hears for a dot badge. */
	newBadge: 'new',
	on: 'On',
	off: 'Off',

	// Shell
	primaryNavigation: 'Primary',
	more: 'More',
	search: 'Search',
	skipToContent: 'Skip to content',
	expandNavigation: 'Expand navigation',
	collapseNavigation: 'Collapse navigation',
	toolbar: 'Toolbar',
	notifications: 'Notifications',
	keyboardShortcuts: 'Keyboard shortcuts',

	// Filters
	filters: 'Filters',
	activeFilters: 'Active filters',
	any: 'Any',
	showFilters: (title: string, active: number) =>
		active ? `Show ${title.toLowerCase()} (${active} on)` : `Show ${title.toLowerCase()}`,
	collapseFilters: (title: string) => `Collapse ${title.toLowerCase()}`,

	// Combobox
	showOptions: 'Show options',
	hideOptions: 'Hide options',
	noMatches: 'No matches',
	searching: 'Searching…',
	optionCount: (n: number) => plural(n, 'option', 'options'),
	create: (text: string) => `Create "${text}"`,

	// Long lists
	loadMore: 'Load more',
	showing: (shown: number, total: number) =>
		`Showing ${shown.toLocaleString()} of ${total.toLocaleString()}`,
	chooseOption: 'Choose…',

	// Table
	selectRow: 'Select row',
	selectAllRows: 'Select all rows',
	nothingToShow: 'Nothing to show',

	// Forms
	chooseFile: 'Choose file',
	chooseFiles: 'Choose files',
	noFileChosen: 'No file chosen',
	fileCount: (n: number) => plural(n, 'file', 'files'),
	clearFile: 'Clear file',
	clearFiles: 'Clear files',
	increase: 'Increase',
	decrease: 'Decrease',
	notRated: 'Not rated',
	stars: (n: number, max: number) => `${n} of ${max} stars`,
	severity: 'Severity',

	// Media
	favorite: 'Favorite',
	images: 'images',
	rated: (n: number, max: number) => `rated ${n} of ${max}`,
	imageViewer: 'Image viewer',
	imageGrid: 'Images',
	zoomIn: 'Zoom in',
	zoomOut: 'Zoom out',
	previousImage: 'Previous image',
	nextImage: 'Next image',
	imageUnavailable: 'Image unavailable',
	loadingImage: 'Loading image',
	loadingMore: 'Loading more',

	// Timeline and menus
	history: 'History',
	showCount: (n: number) => `Show ${n.toLocaleString()}`,
	hideCount: (n: number) => `Hide ${n.toLocaleString()}`,
	system: (source: string) => `System: ${source}`,
	asksForNote: 'Asks for a note',

	// Modes
	theme: 'Theme',
	modeSystem: 'System',
	modeDark: 'Dark',
	modeLight: 'Light',
	modePaper: 'Paper',
	modeNight: 'Night',
	modeContrast: 'High contrast',

	// Error page
	goHome: 'Go home',
	tryAgain: 'Try again',

	// Time
	justNow: 'just now',
	today: 'today',
	underAMinute: '<1 min',
	minutes: (n: number) => `${n} min`,
	hours: (n: number) => `${n} h`,
	days: (n: number) => plural(n, 'day', 'days'),
	ago: (age: string) => `${age} ago`,
	inTime: (time: string) => `in ${time}`,
	dueToday: 'due today',
	overdue: (time: string) => `${time} overdue`,
	due: 'due'
};

export type Strings = typeof DEFAULTS;

/** The words in use. Read them; change them with `setStrings`. */
export const strings: Strings = $state({ ...DEFAULTS });

/** Override any of the words, app-wide. Call once, before the app mounts. */
export function setStrings(overrides: Partial<Strings>): void {
	Object.assign(strings, overrides);
}

/** Back to the English defaults (for tests). */
export function resetStrings(): void {
	Object.assign(strings, DEFAULTS);
}
