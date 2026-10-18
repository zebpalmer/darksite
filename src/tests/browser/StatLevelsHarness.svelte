<script lang="ts">
	// Browser-mode harness: a Stat broken down by level, in a tile too narrow for one line.
	import { Stat, severityScale } from '#lib';
</script>

<div style="width: 180px">
	<Stat
		label="Needs attention"
		value={24}
		scale={severityScale}
		level="critical"
		levels={[
			{ level: 'low', value: 12 },
			{ level: 'medium', value: 6 },
			{ level: 'high', value: 2 },
			{ level: 'critical', value: 4 }
		]}
	/>
</div>
