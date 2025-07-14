<script lang="ts">
	import type { DocumentClass } from '$lib/schemas';

	let { documentClass = $bindable() }: { documentClass: DocumentClass } = $props();
</script>

<input type="hidden" name="documentClass" value={documentClass} />
