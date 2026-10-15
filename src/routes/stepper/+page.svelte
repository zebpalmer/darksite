<script lang="ts">
	import { Field, PageHeader, Stepper } from '#lib';

	let copies = $state(2);
	let weight = $state(0.5);
</script>

<svelte:head><title>Stepper · darksite</title></svelte:head>
<PageHeader title="Stepper" />
<div class="demo">
	<p>
		The arrows step, PageUp and PageDown take ten steps, Home and End jump to the bounds. A typed
		value is clamped and snapped when you press Enter or leave the field.
	</p>
	<div class="stack">
		<div class="row">
			<Stepper bind:value={copies} min={1} max={20} label="Copies" hideLabel={false} />
		</div>
		<div class="row">
			<Stepper
				bind:value={weight}
				min={0}
				max={2}
				step={0.25}
				label="Weight"
				hideLabel={false}
				size="dense"
			/>
		</div>
		<div class="row"><Stepper value={3} label="Locked" hideLabel={false} disabled /></div>
		<p class="out">Copies {copies} · weight {weight}</p>
	</div>
</div>
