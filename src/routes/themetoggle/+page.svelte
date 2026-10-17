<script lang="ts">
	import { mode, modeLabel, PageHeader, ThemeToggle } from '#lib';
</script>

<svelte:head><title>ThemeToggle · darksite</title></svelte:head>
<PageHeader title="ThemeToggle" />
<div class="demo">
	<h2>Icon</h2>
	<div class="row">
		<ThemeToggle />
		<span class="out">mode: {modeLabel(mode.current)}</span>
	</div>
	<h2>With a visible label</h2>
	<div class="row">
		<ThemeToggle showLabel="Appearance" />
	</div>
	<h2>Reading modes</h2>
	<div class="row">
		<ThemeToggle modes={['night', 'paper']} />
	</div>
	<p>
		One press flips between two modes and remembers the choice. A moon shows while a dark mode is
		on, a sun while a light one is; while the mode follows the system, the device decides. For the
		full set of modes use ModePicker.
	</p>
</div>
