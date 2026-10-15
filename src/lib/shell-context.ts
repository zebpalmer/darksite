// What AppShell hands down to the page's PageHeader: the shell-wide header actions and how they
// collapse on a phone. Internal — AppShell sets it, PageHeader reads it.

import { getContext, setContext, type Snippet } from 'svelte';

import type { IconComponent } from './types.js';

export interface HeaderActionsContext {
	/** The shell's `headerActions` snippet, or undefined when there is none. */
	readonly snippet: Snippet | undefined;
	/** The phone toggle's icon. */
	readonly icon: IconComponent;
	/** The phone toggle's accessible name, and the name of the row it opens. */
	readonly label: string;
	/** The key that focuses the first field in the actions; null for none. */
	readonly key: string | null;
	/** Whether the shell is in its phone layout. */
	readonly phone: boolean;
	/** The shell's current destination; a change is a navigation, and closes the phone row. */
	readonly current: string | undefined;
}

const KEY = Symbol('ds-header-actions');

export function setHeaderActions(context: HeaderActionsContext): void {
	setContext(KEY, context);
}

export function getHeaderActions(): HeaderActionsContext | undefined {
	return getContext<HeaderActionsContext | undefined>(KEY);
}
