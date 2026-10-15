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
export { default as FileInput } from './components/FileInput.svelte';
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
export { default as WorkView } from './components/WorkView.svelte';
export { default as ScaleBadge } from './components/ScaleBadge.svelte';
export { default as ScalePicker } from './components/ScalePicker.svelte';
export { default as Carousel } from './components/Carousel.svelte';
export { default as Lightbox } from './components/Lightbox.svelte';
export { default as KeyLegend } from './components/KeyLegend.svelte';
export { default as ListRow } from './components/ListRow.svelte';
export { default as Rating } from './components/Rating.svelte';
export { default as Stepper } from './components/Stepper.svelte';
export { default as ErrorPage } from './components/ErrorPage.svelte';
export { default as FactList } from './components/FactList.svelte';
export { default as Missing } from './components/Missing.svelte';

export type { MenuAction, MenuEntry, MenuTriggerAttrs } from './components/Menu.svelte';
export type { MeterSegment } from './components/Meter.svelte';
export {
	DEFAULT_PRIORITY_WIDTHS,
	hiddenPriorities,
	type TableColumn,
	type TableGroup,
	type TablePriorityWidths,
	type TableRowTone,
	type TableSort
} from './components/Table.svelte';
export type { TimelineEntry, TimelinePart } from './components/Timeline.svelte';
export type { LightboxItem } from './components/Lightbox.svelte';
export type { FactItem } from './components/FactList.svelte';

export {
	countActive,
	filterLabel,
	filtersFromParams,
	filtersToParams,
	type FilterOption,
	type FilterSection,
	type FilterValue,
	type ParamsInput,
	unlistedValues
} from './filters.js';
export { formatKey, formatKeys, isTypingTarget, matchesKey } from './keycap.js';
export { createLabels, humanize, type Labels } from './labels.js';
export { formatCompact, formatMoney, formatNumber, type NumberOptions } from './numbers.js';
export {
	SEVERITIES,
	severityLabel,
	severityRank,
	severityScale,
	severityVars,
	type Severity
} from './severity.js';
export {
	checkScaleContrast,
	contrastRatio,
	defineScale,
	SCALE_MAX_STOPS,
	type Scale,
	type ScaleColors,
	type ScaleContrastOptions,
	type ScaleContrastResult,
	type ScaleDefinition,
	type ScaleStop,
	type UnknownStop,
	type UnknownStopInput
} from './scale.js';
export {
	formatAge,
	formatDate,
	formatDue,
	formatDueExact,
	formatDuration,
	formatExact,
	formatRelative,
	isCalendarDate,
	toDate,
	type DateInput,
	type DateOptions
} from './time.js';
export type { ControlSize, IconComponent } from './types.js';
export {
	badgeSpoken,
	badgeText,
	groupItems,
	type NavGroup,
	type NavItem,
	type NavSection
} from './nav.js';
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
export {
	bindingKeys,
	buildHotkeyMap,
	focusShortcut,
	groupBindings,
	hotkeys,
	installHotkeys,
	resolveHotkey,
	type HotkeyBinding,
	type HotkeyConflict,
	type HotkeyGroup,
	type HotkeyHandler,
	type HotkeyMap,
	type InstallOptions,
	type ResolveOptions
} from './hotkeys.js';
export { normalizeKey } from './keycap.js';
export { daysUntil, formatCountdown } from './time.js';
export { formatConfidence } from './numbers.js';
export { initials } from './labels.js';
export { errorCopy, type ErrorCopy } from './components/ErrorPage.svelte';
export type { RailSlotArgs, TipHandlers } from './components/NavRail.svelte';
export { resetStrings, setStrings, strings, type Strings } from './strings.svelte.js';
