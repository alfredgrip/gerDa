<script lang="ts">
	import { separateDraftsByType } from '$lib/drafts/functions';
	import { drafts, selectedDraft } from '$lib/drafts/store';
	import { draftRoutes, draftTitles } from '$lib/drafts/types';

	function selectDraft(uuid: string) {
		const draft = $drafts.find((draft) => draft.uuid === uuid);
		if (!draft) {
			window.alert('Kunde inte hitta det utkastet.');
			return;
		}
		selectedDraft.set(draft);
	}

	function removeDraft(uuid: string) {
		const index = $drafts.findIndex((draft) => draft.uuid === uuid);
		if (index === -1) return;
		const confirmed = confirm(
			`Är du säker på att du vill ta bort utkastet "${$drafts[index].title}"?`
		);
		if (!confirmed) return;
		const currentDrafts = $drafts;
		currentDrafts.splice(index, 1);
		drafts.set(currentDrafts);
		localStorage.drafts = JSON.stringify(currentDrafts);
	}

	$: draftsByType = separateDraftsByType($drafts);
</script>

<a href="/" id="back-button"><strong>&#8592 Hem</strong></a>
<div class="container">
	<h1>Utkast</h1>
	{#each draftRoutes as route}
		{#if draftsByType[route].length > 0}
			<h2>{draftTitles[route]}</h2>
			{#each draftsByType[route] as draft (draft.uuid)}
				<div class="draft">
					<a
						href={`/create/${draft.draftType}`}
						class="wide button"
						on:click={() => selectDraft(draft.uuid)}
						><div class="titleUUID">
							<p style="font-weight: bold;">{draft.title}</p>
							<p style="font-size: small;">({draft.uuid})</p>
						</div></a
					>
					<button class="red button" on:click={() => removeDraft(draft.uuid)}>ta bort</button>
				</div>
			{/each}
		{/if}
	{/each}
	{#if $drafts.length === 0}
		<p>Inga utkast</p>
	{/if}
</div>

<style>
	.draft {
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
		justify-content: space-between;
	}

	.titleUUID {
		margin: 0;
		display: flex;
		flex-direction: column;
	}

	.titleUUID p {
		margin: 0;
		white-space: initial;
	}

	.container {
		display: grid;
		gap: 0.5rem;
		place-items: center;
	}

	.button {
		color: black;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0.5rem;
		/* min-height: fit-content; */
		font-size: larger;
		background-color: rgb(255, 241, 241);
		border: 1px solid rgb(255, 241, 241);
		border-radius: 0.5rem;
		cursor: pointer;
		max-width: 20rem;
		text-align: center;
		text-decoration: none;
		padding: 1rem;
		height: 100%;
	}
	.wide {
		width: 100%;
		min-width: 10rem;
	}
	.red {
		background-color: rgb(137, 25, 25);
		color: white;
		border: 1px solid rgb(137, 25, 25);
		min-width: 6rem;
	}

	#back-button {
		border-radius: 0.5rem;
		padding: 0.5rem 1rem; /* Adjusted padding for better proportions */
		border: 2px solid rgb(209, 209, 209);
		color: black;
		background-color: rgb(255, 241, 241);
		margin-top: 1rem;
		text-decoration: none;
		height: 2rem; /* Adjusted height */
	}
	#back-button:hover {
		background-color: rgb(255, 241, 241, 0.8);
	}
</style>
