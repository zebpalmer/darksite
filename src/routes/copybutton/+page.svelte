<script lang="ts">
	import { CodeBlock, CopyButton, PageHeader } from '#lib';

	let copies = $state(0);
	const command =
		'npm install https://github.com/example/package/releases/download/v1.2.0/package-1.2.0.tgz';
	const config = `{
	"name": "acme",
	"accent": "#e85d3a",
	"fonts": { "sans": "Inter, system-ui, sans-serif" }
}`;
</script>

<svelte:head><title>CopyButton · darksite</title></svelte:head>
<PageHeader title="CopyButton and CodeBlock" />
<div class="demo">
	<h2>CopyButton</h2>
	<div class="row">
		<CopyButton value="https://example.com/r/R-00412" label="Copy link" oncopy={() => copies++} />
		<CopyButton value="R-00412" variant="ghost" />
	</div>
	<p>
		The label turns to "Copied" for two seconds, and a screen reader hears it. Copied {copies} times.
	</p>

	<h2>Inline, beside a mono value</h2>
	<p class="value">
		<span class="mono">R-00412</span>
		<CopyButton value="R-00412" inline label="Copy identifier" />
	</p>
	<p class="value">
		<span class="mono">3f9a2c71e0b4</span>
		<CopyButton value="3f9a2c71e0b4" inline label="Copy hash" />
	</p>

	<h2>CodeBlock</h2>
	<div class="stack wide">
		<CodeBlock code={command} label="Shell" />
		<CodeBlock code={config} label="brand.json" />
		<CodeBlock
			code="Plain output that wraps rather than scrolls, for log lines and messages that are read more than copied."
			wrap
			copy={false}
		/>
	</div>
</div>

<style>
	.value {
		display: flex;
		align-items: center;
		gap: 4px;
	}
	.mono {
		font-family: var(--font-mono);
		font-size: var(--ds-text-sm);
		font-variant-numeric: tabular-nums;
	}
	.wide {
		max-width: 560px;
	}
</style>
