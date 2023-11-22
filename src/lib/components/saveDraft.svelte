<script lang="ts">
	import { createEmptyDraft } from '$lib/drafts/functions';
	import { drafts, selectedDraft } from '$lib/drafts/store';
	import type { Draft, DraftType } from '$lib/drafts/types';

	export let draftType: DraftType;
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

<p>draftid: {$selectedDraft?.uuid}</p>

<button class="tex-button" on:click|preventDefault={importDraft}>Importera utkast</button>
<button class="tex-button" on:click|preventDefault={exportDraft}>Exportera utkast</button>
<button class="tex-button" on:click|preventDefault={saveDraft}>Spara utkast</button>

<style>
	.tex-button {
		background-color: rgb(123, 206, 142);
		border-radius: 0.5rem;
		padding: 0rem 1rem;
		border: 2px solid rgb(209, 209, 209);
	}

	.tex-button:hover {
		background-color: rgb(123, 206, 142, 0.8);
	}
</style>
