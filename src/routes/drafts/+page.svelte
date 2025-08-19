<script lang="ts">
	import { goto } from '$app/navigation';
	import { getLocalStorageDrafts } from '$lib/state/localDraftsState.svelte';

	let localDrafts = getLocalStorageDrafts();
	let sortedDrafts = localDrafts.drafts.sort((a, b) => b.lastEdit - a.lastEdit);
</script>

<h1>Drafts</h1>

{#if sortedDrafts.length === 0}
	<p>No drafts available.</p>
{:else}
	<ul>
		{#each sortedDrafts as draft (draft.id)}
			<li>
				<button
					class="focus:ring-opacity-50 rounded-lg bg-white px-4 py-2 text-lg font-bold text-purple-800 hover:bg-purple-200 focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
					onclick={() => {
						localDrafts.currentDraftId = draft.id;
						const documentClass = draft.documentClass;
						goto(`/create/${documentClass.toLowerCase()}`);
					}}>{draft.title || 'Titel saknas'}</button
				>
			</li>
		{/each}
	</ul>
{/if}
