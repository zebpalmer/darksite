<script lang="ts">
	import { Button, ModePicker, PageHeader, Pane } from '#lib';
	import { brands, gallery, setBrand } from '../brand.svelte.js';

	const modes = ['dark', 'light', 'paper', 'night', 'contrast'] as const;
	const swatch = [
		'ds-bg-1',
		'ds-bg-3',
		'ds-text-1',
		'ds-accent',
		'ds-accent-2',
		'ds-success',
		'ds-warning',
		'ds-danger'
	];
</script>

<svelte:head><title>Brands and modes · darksite</title></svelte:head>
<PageHeader title="Brands and modes" count={brands.length} />
<div class="demo">
	<p>
		A <strong>brand</strong> is a product's colors and fonts; a <strong>mode</strong> is the viewer's
		choice of dark, light, a reading mode or high contrast. Every brand works in every mode. Pick one
		to see the whole gallery in it.
	</p>

	<h2>Modes</h2>
	<div style="max-width: 640px"><ModePicker variant="segmented" /></div>

	<h2>Brands</h2>
	<div class="brands">
		{#each brands as b (b.name)}
			<button
				type="button"
				class="brand"
				aria-pressed={gallery.brand === b.name}
				onclick={() => setBrand(b.name)}
			>
				<span class="name"
					>{b.label}{#if b.scheme}<span class="tag">color scheme</span>{/if}</span
				>
				{#each modes as m (m)}
					<span class="strip" title={m}>
						{#each swatch as r (r)}<span class="chip" style:background={b.swatches[m][r]}
							></span>{/each}
					</span>
				{/each}
				{#if b.note}<span class="note">{b.note}</span>{/if}
			</button>
		{/each}
	</div>

	<h2>Reading modes, on part of the page</h2>
	<p>
		A mode can be set on any element, so a reader column can be paper or night while the rest stays
		as it is.
	</p>
	<div class="readers">
		{#each ['paper', 'night'] as m (m)}
			<div class="reader" data-ds-theme={m}>
				<article class="ds-reading">
					<h3>Chapter one</h3>
					<p>
						The harbor was quiet before dawn. Lanterns swung over the water and the tide pulled at
						the ropes, patient as ever, while the town slept on the hill above.
					</p>
					<p>She read the letter twice more, then folded it along its old creases and went out.</p>
				</article>
			</div>
		{/each}
	</div>

	<h2>A brand of your own</h2>
	<Pane title="brand.json" padded>
		<pre class="code">{`{
  "name": "acme",
  "accent": "#e85d3a",
  "neutral": { "hue": 40, "chroma": 0.5 },
  "chrome": { "rail": "#24130d" },
  "fonts": { "sans": "Inter, system-ui, sans-serif" }
}`}</pre>
	</Pane>
	<pre class="code">npx darksite-theme brand.json --out src/brand.css</pre>
	<div class="row">
		<Button href="https://github.com/zebpalmer/darksite#brands">How brands work</Button>
	</div>
</div>

<style>
	.brands {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(240px, 100%), 1fr));
		gap: 12px;
	}
	.brand {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 10px;
		border: 1px solid var(--ds-border-subtle);
		border-radius: var(--ds-radius-md);
		background: var(--ds-bg-2);
		color: var(--ds-text-1);
		font: inherit;
		text-align: start;
		cursor: pointer;
	}
	.brand:hover {
		background: var(--ds-bg-3);
	}
	.brand[aria-pressed='true'] {
		border-color: var(--ds-accent);
	}
	.name {
		display: flex;
		align-items: center;
		gap: 8px;
		font-weight: 500;
	}
	.tag,
	.note {
		color: var(--ds-text-3);
		font-size: var(--ds-text-xs);
		font-weight: 400;
	}
	.strip {
		display: flex;
		height: 14px;
		overflow: hidden;
		border-radius: var(--ds-radius-xs);
	}
	.chip {
		flex: 1;
	}
	.readers {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
		gap: 12px;
	}
	.reader {
		padding: 20px 24px;
		border-radius: var(--ds-radius-md);
		background: var(--ds-bg-1);
	}
	.reader h3 {
		margin: 0 0 0.6em;
		font-weight: 500;
	}
	.code {
		margin: 0 0 12px;
		color: var(--ds-text-2);
		font-family: var(--font-mono);
		font-size: var(--ds-text-sm);
		white-space: pre-wrap;
	}
</style>
