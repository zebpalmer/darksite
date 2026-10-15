<script lang="ts">
	import type { MediaFlag } from '#lib';
	let { flag }: { flag: MediaFlag } = $props();
</script>

<p>{flag.current ? 'phone' : 'wide'}</p>
