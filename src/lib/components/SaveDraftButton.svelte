<!-- <script lang="ts">
	import { getAuthorContext } from '$lib/state/authorState.svelte';
	import { getClauseContext } from '$lib/state/clauseState.svelte';
	import { getFormContext } from '$lib/state/formState.svelte';
	import { getLocalStorageDrafts } from '$lib/state/localDraftsState.svelte';

	let formState = getFormContext();
	let authorState = getAuthorContext();
	let clauseState = getClauseContext();
	let localDrafts = getLocalStorageDrafts();

	async function saveDraft() {
		let draft = localDrafts.getDraft(localDrafts.currentDraftId);
		console.log('authorState:', authorState);
		if (draft != null) {
			// If a draft with the current ID exists, update it
			localDrafts.updateDraft(draft.id, {
				...formState.getFields(),
				authors: [...authorState.getFields()],
				clauses: [...clauseState.getFields()]
			});
		} else {
			// If no draft exists, create a new one
			draft = {
				id: crypto.randomUUID(),
				lastEdit: Date.now(),
				...formState.getFields(),
				authors: [...authorState.getFields()],
				clauses: [...clauseState.getFields()]
			};
			console.log('Saving draft:', draft);
			console.log('Stringified draft:', JSON.stringify(draft, null, 2));
			localDrafts.addDraft(draft);
		}
	}
</script>

<button
	type="button"
	class="focus:ring-opacity-50 rounded-lg bg-white px-4 py-2 text-lg font-bold text-purple-800 hover:bg-purple-200 focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
	onclick={saveDraft}
>
	Spara utkast
</button> -->
