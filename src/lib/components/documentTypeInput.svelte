<script lang="ts">
	import type { DocumentType } from '$lib/types';
	export let documentType: DocumentType;
</script>

<input type="hidden" name="documentType" value={documentType} />
