<script lang="ts">
	import { DOCUMENT_CLASSES } from '$lib/schemas';
	import { getLocalStorageDrafts } from '$lib/state/localDraftsState.svelte';

	const routes = DOCUMENT_CLASSES.map((type) => ({
		name: type,
		path: `/create/${type}`
	}));
	const localDrafts = getLocalStorageDrafts();
</script>

<div class="flex min-h-screen flex-col items-center gap-6 bg-[rgb(248,184,201)] p-8">
	<h1 class="text-3xl font-bold text-gray-800">Skapa dokument</h1>

	<!-- Buttons container -->
	<div class="grid w-max gap-3">
		{#each routes as { name, path } (path)}
			<a
				class="inline-block w-full rounded-md bg-white px-4 py-2 text-center text-xl text-gray-800 shadow transition-colors duration-150 hover:bg-gray-100"
				href={path}
				onclick={() => (localDrafts.currentDraftId = null)}
			>
				{name}
			</a>
		{/each}

		{#if localDrafts.drafts.length > 0}
			<h1 class="mt-8 w-full text-center text-3xl font-bold text-gray-800">Utkast</h1>
			<a
				class="inline-block w-full rounded-md bg-white px-4 py-2 text-center text-xl text-gray-800 shadow transition-colors duration-150 hover:bg-gray-100"
				href="/drafts"
			>
				Hantera utkast
			</a>
		{/if}
	</div>
</div>
