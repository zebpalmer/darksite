<script lang="ts">
	import { PageHeader } from '#lib';
</script>

<svelte:head><title>Document page · darksite</title></svelte:head>
<PageHeader title="How the health check works" />
<article class="ds-prose">
	<p>
		A health check asks one question: over the last 24 hours, which observers heard this node, and
		how often? It reads the packets the observers forwarded and counts them per hour.
	</p>
	<h2>What counts as heard</h2>
	<p>
		A packet counts when an observer received it directly or through a repeater. Packets relayed
		more than three times are left out, because their path is too uncertain to say who was near.
	</p>
	<ul>
		<li>Direct: the observer heard the node itself.</li>
		<li>Relayed: a repeater passed it on; the path is kept.</li>
	</ul>
	<h2>Reading the result</h2>
	<p>
		The verdict is the share of hours with at least one packet. Run <code>check --node a3f9</code> to
		get the same numbers in a terminal.
	</p>
</article>
