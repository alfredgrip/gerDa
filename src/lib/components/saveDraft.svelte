<script lang="ts">
	import { drafts, selectedDraft } from '$lib/drafts/store';
	import type { Draft } from '$lib/drafts/types';
	import type { DocumentType } from '$lib/types';

	export let draftType: DocumentType;
	export let currentDraft: Draft;

	function importDraft() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'application/json';
		input.onchange = (event) => {
			const file = (event?.target as HTMLInputElement)?.files?.[0];
			const reader = new FileReader();
			reader.onload = (event) => {
				const draft = JSON.parse(event.target?.result as string);
				if (draft.draftType !== draftType) {
					alert(
						`Det importerade utkastet är av typen "${draft.draftType}" och kan därför inte importeras till "${draftType}"`
					);
					return;
				}
				currentDraft = draft;
				selectedDraft.set(draft);
			};
			reader.readAsText(file!);
		};
		input.click();
	}

	function exportDraft() {
		const draft = JSON.stringify(currentDraft);
		const blob = new Blob([draft], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${currentDraft.title}.json`;
		a.click();
	}

	function saveDraft() {
		let draftIsNew = !$drafts.map((draft) => draft.uuid).includes(currentDraft.uuid);
		if (!currentDraft.title) {
			alert('Du måste ange en titel');
			return;
		}
		const updatedDrafts = $drafts;
		if (!draftIsNew) {
			const index = updatedDrafts.findIndex((draft) => draft.uuid === currentDraft?.uuid);
			updatedDrafts[index] = currentDraft;
			drafts.set(updatedDrafts);
			localStorage.drafts = JSON.stringify(updatedDrafts);
		} else {
			drafts.set([...updatedDrafts, currentDraft]);
			localStorage.drafts = JSON.stringify([...updatedDrafts, currentDraft]);
		}
		if (draftIsNew) {
			alert(`Det nya utkastet "${currentDraft.title}" har sparats`);
		} else {
			alert(`Utkastet "${currentDraft.title}" har sparats`);
		}
		selectedDraft.set(JSON.parse(JSON.stringify(currentDraft)));
	}
</script>

<svelte:window
	on:beforeunload={(event) => {
		const changed = JSON.stringify($selectedDraft) !== JSON.stringify(currentDraft);
		console.log(changed, JSON.stringify($selectedDraft), JSON.stringify(currentDraft));
		if (changed) {
			event.preventDefault();
			event.returnValue = '';
		}
	}}
/>

<div class="draft-buttons">
	<button class="tex-button" on:click|preventDefault={saveDraft}>Spara utkast</button>
	<button class="tex-button" on:click|preventDefault={importDraft}>Importera utkast</button>
	<button class="tex-button" on:click|preventDefault={exportDraft}>Exportera utkast</button>
</div>
{#if $selectedDraft?.uuid}
	<p><strong>Utkast:</strong> {$selectedDraft.title} (id: {$selectedDraft?.uuid})</p>
{/if}

<style>
	.tex-button {
		background-color: rgb(147, 190, 239);
		border-radius: 0.5rem;
		padding: 0rem 1rem;
		border: 2px solid rgb(209, 209, 209);
	}

	.tex-button:hover {
		background-color: rgb(147, 190, 239, 0.8);
	}

	.draft-buttons {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.5rem;
		justify-content: space-evenly;
		align-items: center;
		min-width: 60%;
		align-self: center;
	}
	.draft-buttons button {
		width: 100%;
		min-height: 3rem;
	}

	p {
		margin: -0.5rem;
		text-align: center;
		align-self: center;
	}
</style>
