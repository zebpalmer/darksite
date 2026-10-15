<script lang="ts">
	import { Dialog, Sheet, Toaster, ToastStore } from '#lib';

	let {
		store = new ToastStore(),
		sheet = $bindable(false),
		dialog = $bindable(false),
		dirty = false,
		onbeforeclose
	}: {
		store?: ToastStore;
		sheet?: boolean;
		dialog?: boolean;
		dirty?: boolean;
		onbeforeclose?: () => boolean | void;
	} = $props();
</script>

<Toaster {store} />
<Sheet bind:open={sheet} title="Edit record" {dirty} {onbeforeclose}>
	<p>Body</p>
</Sheet>
<Dialog bind:open={dialog} title="Discard changes?" onconfirm={() => true} />
