<script lang="ts">
	import {
		Button,
		PageHeader,
		ScalePicker,
		checkScaleContrast,
		type ScaleContrastResult
	} from '#lib';
	import { confidence, type Confidence } from '../scale-demo.js';
	import '../scale-demo.css';

	let value = $state<Confidence | null>(null);
	let capped = $state<Confidence | null>('unknown');
	let narrow = $state<Confidence | null>('c4');
	let results = $state<ScaleContrastResult[] | null>(null);
	let scope = $state<HTMLElement>();
	const failing = $derived(results?.filter((r) => !r.ok) ?? []);

	function check() {
		const contrast = document.documentElement.dataset.theme === 'contrast';
		results = checkScaleContrast(confidence, { within: scope, text: contrast ? 7 : 4.5 });
	}
</script>

<svelte:head><title>ScalePicker · darksite</title></svelte:head>
<PageHeader title="ScalePicker" />
<div class="demo confidence" bind:this={scope}>
	<p>
		A neutral eight-stop confidence scale the demo app defines with <code>defineScale</code>, plus
		an unknown stop: nine cells. Its colors are the app's own, never severity colors.
	</p>

	<h2>Unset, with a suggestion and key caps</h2>
	<ScalePicker scale={confidence} bind:value suggested="c6" keycaps />
	<p class="out">value={String(value)}</p>

	<h2>Capped at Likely, with counts</h2>
	<p>The ceiling hides the two stops above it. Unknown is never under a ceiling.</p>
	<div style="max-width: 720px">
		<ScalePicker
			scale={confidence}
			bind:value={capped}
			max="c6"
			counts={{ c1: 3, c2: 9, c3: 14, c4: 22, c5: 11, c6: 6, unknown: 2 }}
		/>
	</div>

	<h2>Folding: two rows, then three</h2>
	<p>Nine cells fold to 5 + 4 below 720px, and to 3 + 3 + 3 below 400px.</p>
	<div class="stack" style="max-width: none">
		<div style="max-width: 560px">
			<ScalePicker scale={confidence} bind:value={narrow} keycaps />
		</div>
		<div style="max-width: 340px">
			<ScalePicker scale={confidence} bind:value={narrow} keycaps />
		</div>
	</div>

	<h2>Checking the app's colors</h2>
	<p>
		<code>checkScaleContrast</code> resolves each stop in the live theme: ink on its ground, and the mark
		on the page grounds. Switch the theme and check again.
	</p>
	<div class="row">
		<Button onclick={check}>Check contrast</Button>
		{#if results}
			<span class="out">
				{failing.length
					? `${failing.length} of ${results.length} pairs fail: ${failing.map((f) => `${f.value} ${f.pair} ${f.ratio.toFixed(2)}`).join(', ')}`
					: `All ${results.length} pairs pass.`}
			</span>
		{/if}
	</div>
</div>
