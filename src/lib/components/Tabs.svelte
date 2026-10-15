<script lang="ts" module>
	export interface TabItem<T> {
		value: T;
		label: string;
		count?: number | null;
		/** Colors the count only. */
		tone?: 'danger' | 'warning';
		href?: string;
		disabled?: boolean;
	}

	/** The id of a tab in tabs mode, for the panel's `aria-labelledby`. */
	export function tabId(idPrefix: string, value: string | number): string {
		return `${idPrefix}-tab-${value}`;
	}

	/** The id the panel for a tab must carry. */
	export function panelId(idPrefix: string, value: string | number): string {
		return `${idPrefix}-panel-${value}`;
	}
</script>

<!--
@component
Tabs — sections of one thing, counts inline. With an `href` on every tab it is a `<nav>` of links
(`aria-current="page"`); without, a WAI-ARIA tablist (←/→ move and select, one tab stop) whose
panel you render with `id={panelId(idPrefix, value)}` and
`aria-labelledby={tabId(idPrefix, value)}`.

- `tabs` (`{ value, label, count?, tone?, href?, disabled? }[]`), `value` (bindable),
  `onchange(value)`, `label`, `idPrefix` (required in tabs mode), `variant` (`underline` |
  `pill`), `full`, `class`.
-->
<script lang="ts" generics="T extends string | number">
	interface Props {
		tabs: readonly TabItem<T>[];
		value?: T;
		onchange?: (value: T) => void;
		label: string;
		idPrefix?: string;
		variant?: 'underline' | 'pill';
		full?: boolean;
		class?: string;
	}

	let {
		tabs,
		value = $bindable(),
		onchange,
		label,
		idPrefix = 'tabs',
		variant = 'underline',
		full = false,
		class: className = ''
	}: Props = $props();

	const links = $derived(tabs.length > 0 && tabs.every((t) => t.href));
	const enabled = $derived(tabs.filter((t) => !t.disabled));
	const stop = $derived(tabs.find((t) => t.value === value && !t.disabled)?.value ?? enabled[0]?.value);
	const els: HTMLElement[] = $state([]);

	function choose(tab: TabItem<T>) {
		if (tab.disabled) return;
		if (tab.value !== value) {
			value = tab.value;
			onchange?.(tab.value);
		}
		els[tabs.indexOf(tab)]?.focus();
	}

	function onkeydown(event: KeyboardEvent) {
		if (!enabled.length) return;
		const at = enabled.findIndex((t) => t.value === stop);
		let next = -1;
		if (event.key === 'ArrowRight') next = (at + 1) % enabled.length;
		else if (event.key === 'ArrowLeft') next = (at - 1 + enabled.length) % enabled.length;
		else if (event.key === 'Home') next = 0;
		else if (event.key === 'End') next = enabled.length - 1;
		if (next < 0) return;
		event.preventDefault();
		choose(enabled[next]);
	}
</script>

{#snippet inner(tab: TabItem<string | number>)}
	<span class="text">{tab.label}</span>
	{#if tab.count !== undefined && tab.count !== null}
		<span class="count" data-tone={tab.tone}>{tab.count.toLocaleString()}</span>
	{/if}
{/snippet}

{#if links}
	<nav
		class="ds-tabs {className}"
		aria-label={label}
		data-variant={variant}
		data-full={full ? '' : undefined}
	>
		{#each tabs as tab, i (tab.value)}
			<a
				bind:this={els[i]}
				href={tab.disabled ? undefined : tab.href}
				class="tab"
				aria-current={tab.value === value ? 'page' : undefined}
				aria-disabled={tab.disabled ? 'true' : undefined}
				onclick={() => {
					if (!tab.disabled && tab.value !== value) {
						value = tab.value;
						onchange?.(tab.value);
					}
				}}>{@render inner(tab)}</a
			>
		{/each}
	</nav>
{:else}
	<div
		class="ds-tabs {className}"
		role="tablist"
		aria-label={label}
		tabindex="-1"
		data-variant={variant}
		data-full={full ? '' : undefined}
		{onkeydown}
	>
		{#each tabs as tab, i (tab.value)}
			<button
				bind:this={els[i]}
				type="button"
				role="tab"
				class="tab"
				id={tabId(idPrefix, tab.value)}
				aria-controls={panelId(idPrefix, tab.value)}
				aria-selected={tab.value === value}
				tabindex={tab.value === stop ? 0 : -1}
				disabled={tab.disabled}
				onclick={() => choose(tab)}>{@render inner(tab)}</button
			>
		{/each}
	</div>
{/if}

<style>
	.ds-tabs {
		display: flex;
		max-width: 100%;
		overflow-x: auto;
		scrollbar-width: none;
	}
	.ds-tabs:focus {
		outline: none;
	}
	.tab {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		flex: none;
		border: 0;
		background: transparent;
		color: var(--ds-text-2);
		font-family: var(--font-sans);
		font-size: var(--ds-text-md);
		text-decoration: none;
		white-space: nowrap;
		cursor: pointer;
	}
	[data-full] .tab {
		flex: 1 0 auto;
	}
	.tab:is(:disabled, [aria-disabled='true']) {
		opacity: 0.45;
		cursor: not-allowed;
	}
	.count {
		color: var(--ds-text-3);
		font-size: var(--ds-text-sm);
		font-variant-numeric: tabular-nums;
	}
	.count[data-tone='danger'] {
		color: var(--ds-danger-text);
	}
	.count[data-tone='warning'] {
		color: var(--ds-warning-text);
	}

	[data-variant='underline'] {
		gap: 20px;
	}
	[data-variant='underline'] .tab {
		height: 40px;
		padding: 0 2px;
		box-shadow: inset 0 -2px 0 transparent;
	}
	[data-variant='underline'] .tab:hover:not(:disabled, [aria-disabled='true']) {
		color: var(--ds-text-1);
	}
	[data-variant='underline'] .tab:is([aria-selected='true'], [aria-current='page']) {
		color: var(--ds-text-1);
		box-shadow: inset 0 -2px 0 var(--ds-accent);
	}

	[data-variant='pill'] {
		display: inline-flex;
		gap: 2px;
		padding: 2px;
		border: 1px solid var(--ds-border-subtle);
		border-radius: var(--ds-radius-md);
		background: var(--ds-bg-2);
	}
	[data-variant='pill'][data-full] {
		display: flex;
	}
	[data-variant='pill'] .tab {
		height: 28px;
		padding: 0 10px;
		border-radius: var(--ds-radius-sm);
		font-size: var(--ds-text-sm);
	}
	@media (pointer: coarse) {
		[data-variant='pill'] .tab {
			height: 40px;
		}
	}
	[data-variant='pill'] .tab:hover:not(:disabled, [aria-disabled='true']) {
		color: var(--ds-text-1);
	}
	[data-variant='pill'] .tab:is([aria-selected='true'], [aria-current='page']) {
		background: var(--ds-bg-4);
		color: var(--ds-text-1);
	}
</style>
