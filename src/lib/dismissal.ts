// Remembered dismissal, shared by Banner and Notice: a dismissed notice stays dismissed for this
// viewer in this browser. Storage that is unavailable (a private window, a blocked site) never
// throws: the notice shows, and a dismissal lasts for this page view only.

/** The storage key for one notice: `darksite:<kind>:<viewer>:<id>`, the viewer part optional. */
export function dismissalKey(kind: string, id: string, viewer?: string): string {
	return `darksite:${kind}:${viewer ? `${viewer}:` : ''}${id}`;
}

/** Whether this key was dismissed before. False when storage is unavailable. */
export function wasDismissed(key: string): boolean {
	try {
		return localStorage.getItem(key) === '1';
	} catch {
		return false;
	}
}

/** Remember a dismissal. Does nothing when storage is unavailable. */
export function rememberDismissal(key: string): void {
	try {
		localStorage.setItem(key, '1');
	} catch {
		/* storage unavailable: dismissed for this page view only */
	}
}
