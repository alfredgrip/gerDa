<script lang="ts">
	import type { DocumentType } from '$lib/schemas';

	let { documentType = $bindable() }: { documentType: DocumentType } = $props();
</script>

<input type="hidden" name="documentType" value={documentType} />
