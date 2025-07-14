<script lang="ts">
	import { DOCUMENT_CLASSES } from '$lib/schemas';
	import { getFormContext } from '$lib/state/formState.svelte';
	import { getLocalStorageDrafts } from '$lib/state/localDraftsState.svelte';

	const routes = DOCUMENT_CLASSES.map((type) => ({
		name: type,
		path: `/create/${type}`
	}));
	const formState = getFormContext();
	const localDrafts = getLocalStorageDrafts();
</script>

<div class="flex flex-col gap-4 p-8">
	<h1 class="text-3xl font-bold">Skapa dokument</h1>
	{#each routes as { name, path }}
		<a
			class="text-blue-500 hover:underline"
			href={path}
			onclick={() => (localDrafts.currentDraftId = null)}>{name}</a
		>
	{/each}
	<h1 class="text-3xl font-bold">Utkast</h1>
	<a class="text-blue-500 hover:underline" href="/drafts">Hantera utkast</a>
</div>

<style>
</style>
