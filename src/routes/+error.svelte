<script lang="ts">
	import { page } from '$app/stores';
</script>

<h2>Något gick fel</h2>
<p>Se gärna till att du har fyllt i alla fält korrekt.</p>
<p>Felmeddelande: {$page.error?.message}</p>
