<!--
@component
CodeBlock — a block of mono text to read or copy: a command, a configuration snippet, an API
response. `ds-bg-2` with a subtle edge at `ds-radius-md`, 13px mono with tabular figures, lines
kept whole: a long line scrolls the block sideways rather than wrapping or widening the page. The
scroller is focusable, so the keyboard can scroll it too.

An inline `CopyButton` sits in its own column at the top right, never over the text.

- `code` (the text), `label` (a caption above it — a file name, "Shell"; also the scroller's
  accessible name, default "Code"), `copy` (default true), `copyLabel` (default "Copy"),
  `wrap` (wrap long lines instead of scrolling; for prose-like output), `size` (`default` |
  `comfy`: 16px mono on 26px lines with more padding and a 32px copy button, to sit beside 18px
  `ds-reading` text), `class`.

No syntax highlighting: color in this system carries meaning, and token colors would not.
-->
<script lang="ts">
	import { strings } from '../strings.svelte.js';
	import CopyButton from './CopyButton.svelte';

	interface Props {
		code: string;
		label?: string;
		copy?: boolean;
		copyLabel?: string;
		wrap?: boolean;
		/** `comfy`: larger text, padding and copy button, for a reading page (`ds-reading`). */
		size?: 'default' | 'comfy';
		class?: string;
	}

	let {
		code,
		label,
		copy = true,
		copyLabel = strings.copy,
		wrap = false,
		size = 'default',
		class: className = ''
	}: Props = $props();
</script>

<figure class="ds-codeblock {className}" data-wrap={wrap ? '' : undefined} data-size={size}>
	{#if label}<figcaption>{label}</figcaption>{/if}
	<div class="frame">
		<!-- svelte-ignore a11y_no_noninteractive_tabindex (a scroller must take focus to scroll by keyboard) -->
		<pre tabindex="0" role="region" aria-label={label ?? strings.code}><code>{code}</code></pre>
		{#if copy}<span class="copy"><CopyButton value={code} label={copyLabel} inline {size} /></span>{/if}
	</div>
</figure>

<style>
	/* The root's margin reset sits in darksite's base layer at zero specificity, so it only clears
	   the browser's figure margin: the page's own rules, such as the article's rhythm, set the
	   space around the block. */
	@layer ds.base {
		:where(.ds-codeblock) {
			margin: 0;
		}
	}
	.ds-codeblock {
		min-width: 0;
	}
	figcaption {
		margin-bottom: 6px;
		color: var(--ds-text-3);
		font-size: var(--ds-text-xs);
		line-height: var(--ds-lh-xs);
	}
	.frame {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: start;
		min-width: 0;
		border: 1px solid var(--ds-border-subtle);
		border-radius: var(--ds-radius-md);
		background: var(--ds-bg-2);
	}
	pre {
		min-width: 0;
		margin: 0;
		padding: 10px 0 10px 12px;
		overflow-x: auto;
		border-radius: var(--ds-radius-md) 0 0 var(--ds-radius-md);
		color: var(--ds-text-1);
		font-family: var(--font-mono);
		font-size: var(--ds-text-sm);
		line-height: 20px;
		font-variant-numeric: tabular-nums;
		white-space: pre;
		tab-size: 4;
	}
	pre:focus-visible {
		outline-offset: -2px;
	}
	/* The text's right padding is inside the scroll, so the last character never touches the edge. */
	code {
		display: inline-block;
		padding-right: 12px;
		font: inherit;
	}
	[data-wrap] pre {
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}
	.copy {
		display: inline-flex;
		padding: 8px 8px 0 4px;
	}
	/* Comfy: beside 18px reading text. The copy button's center stays on the first line's. */
	[data-size='comfy'] figcaption {
		margin-bottom: 8px;
		font-size: var(--ds-text-sm);
		line-height: var(--ds-lh-sm);
	}
	[data-size='comfy'] pre {
		padding: 14px 0 14px 16px;
		font-size: var(--ds-text-lg);
		line-height: 26px;
	}
	[data-size='comfy'] code {
		padding-right: 16px;
	}
	[data-size='comfy'] .copy {
		padding: 11px 10px 0 4px;
	}
</style>
