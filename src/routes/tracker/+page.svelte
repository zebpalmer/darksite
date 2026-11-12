<script lang="ts">
	import { SegmentedControl, Tracker } from '#lib';

	const steps = ['Asked', 'Checked', 'Approved', 'Downloading', 'Triaged', 'Filed'];
	const titled = [
		{ label: 'Asked', title: 'Submitted by a person' },
		{ label: 'Checked', title: 'Looked over for problems' },
		{ label: 'Approved', title: 'Cleared to start' },
		{ label: 'Downloading', title: 'Being fetched' },
		{ label: 'Triaged', title: 'Waiting for a decision' },
		{ label: 'Filed', title: 'In its final place' }
	];
	let current = $state('3');
	const options = steps.map((label, i) => ({ value: String(i), label }));
</script>

<svelte:head><title>Tracker · darksite</title></svelte:head>
<h1>Tracker</h1>
<p>Active: past steps complete, the current one marked.</p>
<Tracker {steps} current={Number(current)} />
<p>Choose the current step.</p>
<SegmentedControl {options} bind:value={current} label="Current step" />
<p>Stopped, in the danger tone (the default) and in warning.</p>
<Tracker {steps} current={3} state="stopped" />
<div class="gap"></div>
<Tracker {steps} current={1} state="stopped" stoppedTone="warning" />
<p>Done: every step complete.</p>
<Tracker {steps} current={5} state="done" />
<p>A tooltip per step: hover one.</p>
<Tracker steps={titled} current={2} />
<p>
	Narrow containers keep only the current step's label; the rest are marks. Drag the frame's corner.
</p>
<div class="frame"><Tracker {steps} current={3} /></div>
<div class="frame narrow"><Tracker {steps} current={3} state="stopped" /></div>

<style>
	h1 {
		margin: 0 0 var(--ds-space-6);
		font-size: var(--ds-text-xl);
		font-weight: 500;
	}
	p {
		color: var(--ds-text-2);
		font-size: var(--ds-text-md);
	}
	.gap {
		height: var(--ds-space-4);
	}
	.frame {
		width: 640px;
		max-width: 100%;
		min-width: 280px;
		margin-bottom: var(--ds-space-4);
		padding: var(--ds-space-3);
		overflow: hidden;
		border: 1px solid var(--ds-border-subtle);
		border-radius: var(--ds-radius-md);
		resize: horizontal;
	}
	.narrow {
		width: 320px;
	}
</style>
