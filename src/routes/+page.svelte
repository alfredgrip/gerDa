<script lang="ts">
	import { DOCUMENT_TYPES } from '$lib/schemas';

	const routes = DOCUMENT_TYPES.map((type) => ({
		name: type,
		path: `/create/${type}`
	}));
</script>

<div class="flex flex-col gap-4 p-8">
	<h1 class="text-3xl font-bold">Skapa dokument</h1>
	{#each routes as { name, path }}
		<a class="text-blue-500 hover:underline" href={path}>{name}</a>
	{/each}
</div>

<style>
</style>
