<script lang="ts">
	import { getFormContext } from '$lib/state/formState.svelte';
	let formState = getFormContext();
</script>

<button
	type="submit"
	class="focus:ring-opacity-50 rounded-lg bg-white px-4 py-2 text-lg font-bold text-purple-800 hover:bg-purple-200 focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
	disabled={formState.isCompiling}
>
	Skapa!
</button>

<button formaction="/create?/getTeX">Ladda ner TeX</button>
