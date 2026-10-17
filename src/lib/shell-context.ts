// What AppShell hands down to the page's PageHeader and to the TopBar: the shell-wide header
// actions, how they collapse on a phone, and whether a page has claimed them. Internal — AppShell
// sets it, PageHeader and TopBar read it.

import { getContext, setContext, type Snippet } from 'svelte';

import type { IconComponent } from './types.js';

export interface HeaderActionsContext {
	/** The shell's `headerActions` snippet, or undefined when there is none. */
	readonly snippet: Snippet | undefined;
	/** The collapsed toggle's icon. */
	readonly icon: IconComponent;
	/** The collapsed toggle's accessible name, and the name of the row it opens. */
	readonly label: string;
	/** The key that focuses the first field in the actions; null for none. */
	readonly key: string | null;
	/** Whether the shell is in its phone layout. */
	readonly phone: boolean;
	/** The shell's current destination; a change is a navigation, and closes the open row. */
	readonly current: string | undefined;
	/** Whether a page that claims nothing shows them in a bar instead. */
	readonly fallback: boolean;
	/** Which bar holds them then: the TopNav (`nav`, a top-nav shell with no TopBar) or a TopBar. */
	readonly host: 'nav' | 'bar';
	/** Whether a level-1 PageHeader is on the page: it hosts them, or opted out of them. */
	readonly claimed: boolean;
	/** A level-1 PageHeader claims them while it is mounted; the return value releases. */
	claim(): () => void;
}

const KEY = Symbol('ds-header-actions');

export function setHeaderActions(context: HeaderActionsContext): void {
	setContext(KEY, context);
}

export function getHeaderActions(): HeaderActionsContext | undefined {
	return getContext<HeaderActionsContext | undefined>(KEY);
}
