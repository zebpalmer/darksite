// darksite — Svelte 5 components for operator software.
// Load the stylesheets once at the root:
//   import 'darksite/tokens.css';
//   import 'darksite/base.css';

export { default as ActionBar } from './components/ActionBar.svelte';
export { default as ActiveFilters } from './components/ActiveFilters.svelte';
export { default as AppShell } from './components/AppShell.svelte';
export { default as Avatar } from './components/Avatar.svelte';
export { default as Banner } from './components/Banner.svelte';
export { default as Button } from './components/Button.svelte';
export { default as Card } from './components/Card.svelte';
export { default as Checkbox } from './components/Checkbox.svelte';
export { default as Chip } from './components/Chip.svelte';
export { default as Combobox } from './components/Combobox.svelte';
export { default as Dialog } from './components/Dialog.svelte';
export { default as EmptyState } from './components/EmptyState.svelte';
export { default as EntityCard } from './components/EntityCard.svelte';
export { default as Field } from './components/Field.svelte';
export { default as FilterRail } from './components/FilterRail.svelte';
export { default as Grid } from './components/Grid.svelte';
export { default as HelpTip } from './components/HelpTip.svelte';
export { default as Input } from './components/Input.svelte';
export { default as JustifiedGrid } from './components/JustifiedGrid.svelte';
export { default as KeyCap } from './components/KeyCap.svelte';
export { default as Menu } from './components/Menu.svelte';
export { default as Meter } from './components/Meter.svelte';
export { default as NavRail } from './components/NavRail.svelte';
export { default as NewBadge } from './components/NewBadge.svelte';
export { default as PageHeader } from './components/PageHeader.svelte';
export { default as Pane } from './components/Pane.svelte';
export { default as Popover } from './components/Popover.svelte';
export { default as Radio } from './components/Radio.svelte';
export { default as SegmentedControl } from './components/SegmentedControl.svelte';
export { default as SeverityBadge } from './components/SeverityBadge.svelte';
export { default as SeverityPicker } from './components/SeverityPicker.svelte';
export { default as Sheet } from './components/Sheet.svelte';
export { default as SheetItem } from './components/SheetItem.svelte';
export { default as SideNav } from './components/SideNav.svelte';
export { default as SkeletonLoader } from './components/SkeletonLoader.svelte';
export { default as SourceBadge } from './components/SourceBadge.svelte';
export { default as Spinner } from './components/Spinner.svelte';
export { default as Stat } from './components/Stat.svelte';
export { default as StatRow } from './components/StatRow.svelte';
export { default as StatusBadge } from './components/StatusBadge.svelte';
export { default as Switch } from './components/Switch.svelte';
export { default as TabBar } from './components/TabBar.svelte';
export { default as Table } from './components/Table.svelte';
export { default as Tabs } from './components/Tabs.svelte';
export { default as Timeline } from './components/Timeline.svelte';
export { default as Toaster } from './components/Toaster.svelte';
export { default as TopBar } from './components/TopBar.svelte';

export type { MenuAction, MenuEntry, MenuTriggerAttrs } from './components/Menu.svelte';
export type { MeterSegment } from './components/Meter.svelte';
export type { TableColumn, TableSort } from './components/Table.svelte';
export type { TimelineEntry, TimelinePart } from './components/Timeline.svelte';

export {
	countActive,
	filtersFromParams,
	filtersToParams,
	type FilterOption,
	type FilterSection,
	type FilterValue
} from './filters.js';
export { formatKey, formatKeys, isTypingTarget, matchesKey } from './keycap.js';
export { createLabels, humanize, type Labels } from './labels.js';
export { formatCompact, formatMoney, formatNumber, type NumberOptions } from './numbers.js';
export {
	SEVERITIES,
	severityLabel,
	severityRank,
	severityVars,
	type Severity
} from './severity.js';
export { formatAge, formatDuration, formatExact, formatRelative, type DateInput } from './time.js';
export type { ControlSize, IconComponent } from './types.js';
export { badgeText, groupItems, type NavGroup, type NavItem, type NavSection } from './nav.js';
export {
	toasts,
	ToastStore,
	type Toast,
	type ToastAction,
	type ToastOptions,
	type ToastTone
} from './toast.svelte.js';
export type { ComboboxItem } from './components/Combobox.svelte';
export type { FieldControl } from './components/Field.svelte';
export type { PopoverTriggerAttrs } from './components/Popover.svelte';
export type { SegmentOption } from './components/SegmentedControl.svelte';
export { panelId, tabId, type TabItem } from './components/Tabs.svelte';
export {
	clampAspect,
	justifyRows,
	type JustifiedBox,
	type JustifiedRow,
	type JustifyOptions
} from './justify.js';
export { modals, topmost, trackModal, type TrackModalOptions } from './layers.svelte.js';
export { COARSE_QUERY, media, MediaFlag, PHONE_QUERY } from './media.svelte.js';
