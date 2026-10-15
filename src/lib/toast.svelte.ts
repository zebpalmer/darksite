// The toast queue. Pages push; the one Toaster (mounted by AppShell) renders. At most two show:
// a third pushes out the oldest. Timing pauses while a toast is hovered or focused.

export type ToastTone = 'info' | 'success' | 'warning' | 'error';

export interface ToastAction {
	label: string;
	/** A hotkey token; pressing it runs the action while the toast shows. */
	keycap?: string;
	onAction: () => void;
}

export interface ToastOptions {
	message: string;
	tone?: ToastTone;
	action?: ToastAction;
	/** ms. Default: 10s with an action, 8s for an error, 4s otherwise. */
	duration?: number;
	/** Show the m:ss countdown and draining bar. Default: on for action toasts. */
	countdown?: boolean;
	/** Pushing an id that is already showing replaces it. */
	id?: string;
	onDismiss?: () => void;
}

export interface Toast {
	id: string;
	message: string;
	tone: ToastTone;
	action?: ToastAction;
	countdown: boolean;
	duration: number;
	/** ms left, valid while paused. */
	remaining: number;
	/** When it ends; null while paused. */
	deadline: number | null;
	onDismiss?: () => void;
}

const MAX = 2;

export class ToastStore {
	items = $state<Toast[]>([]);
	#timers = new Map<string, ReturnType<typeof setTimeout>>();
	#seq = 0;

	push(options: ToastOptions): string {
		const id = options.id ?? `toast-${++this.#seq}`;
		if (this.items.some((t) => t.id === id)) this.#remove(id, false);
		const duration =
			options.duration ?? (options.action ? 10_000 : options.tone === 'error' ? 8_000 : 4_000);
		this.items.push({
			id,
			message: options.message,
			tone: options.tone ?? 'info',
			action: options.action,
			countdown: options.countdown ?? options.action !== undefined,
			duration,
			remaining: duration,
			deadline: Date.now() + duration,
			onDismiss: options.onDismiss
		});
		while (this.items.length > MAX) this.dismiss(this.items[0].id);
		this.#schedule(id, duration);
		return id;
	}

	info = (message: string, options: Omit<ToastOptions, 'message' | 'tone'> = {}) =>
		this.push({ ...options, message, tone: 'info' });
	success = (message: string, options: Omit<ToastOptions, 'message' | 'tone'> = {}) =>
		this.push({ ...options, message, tone: 'success' });
	warning = (message: string, options: Omit<ToastOptions, 'message' | 'tone'> = {}) =>
		this.push({ ...options, message, tone: 'warning' });
	error = (message: string, options: Omit<ToastOptions, 'message' | 'tone'> = {}) =>
		this.push({ ...options, message, tone: 'error' });

	dismiss(id: string) {
		this.#remove(id, true);
	}

	clear() {
		for (const t of [...this.items]) this.dismiss(t.id);
	}

	pause(id: string) {
		const t = this.items.find((x) => x.id === id);
		if (!t || t.deadline === null) return;
		clearTimeout(this.#timers.get(id));
		t.remaining = Math.max(0, t.deadline - Date.now());
		t.deadline = null;
	}

	resume(id: string) {
		const t = this.items.find((x) => x.id === id);
		if (!t || t.deadline !== null) return;
		t.deadline = Date.now() + t.remaining;
		this.#schedule(id, t.remaining);
	}

	#schedule(id: string, ms: number) {
		clearTimeout(this.#timers.get(id));
		this.#timers.set(
			id,
			setTimeout(() => this.dismiss(id), ms)
		);
	}

	#remove(id: string, notify: boolean) {
		clearTimeout(this.#timers.get(id));
		this.#timers.delete(id);
		const t = this.items.find((x) => x.id === id);
		this.items = this.items.filter((x) => x.id !== id);
		if (notify) t?.onDismiss?.();
	}
}

/** The app's toast queue. */
export const toasts = new ToastStore();
