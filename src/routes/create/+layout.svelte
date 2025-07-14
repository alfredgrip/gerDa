<script lang="ts">
	import { enhance } from '$app/forms';
	import PDFViewer from '$lib/components/PDFViewer.svelte';
	import SaveDraftButton from '$lib/components/SaveDraftButton.svelte';
	import SubmitButton from '$lib/components/SubmitButton.svelte';
	import { getAuthorContext } from '$lib/state/authorState.svelte';
	import { getClauseContext } from '$lib/state/clauseState.svelte';
	import { getFormContext } from '$lib/state/formState.svelte';
	import { getLocalStorageDrafts } from '$lib/state/localDraftsState.svelte';
	import { onMount } from 'svelte';

	let { children } = $props();
	let formState = getFormContext();
	let authorState = getAuthorContext();
	let clauseState = getClauseContext();
	let localDrafts = getLocalStorageDrafts();

	let formElement: HTMLFormElement;

	onMount(() => {
		const localDrafts = getLocalStorageDrafts();
		if (!localDrafts.currentDraftId) return null;

		const currentDraft = localDrafts.getDraft(localDrafts.currentDraftId);
		if (!currentDraft) return null;

		if (currentDraft) {
			formState.title = currentDraft.title || '';
			formState.meeting = currentDraft.meeting || '';
			formState.body = currentDraft.body || '';
			formState.demand = currentDraft.demand || '';
			authorState.authors = currentDraft.authors || [{ name: '', position: '', signMessage: '' }];
			clauseState.clauses = currentDraft.clauses || [{ toClause: '' }];
		}
	});
</script>

<svelte:window
	onkeydown={(e) => {
		if ((e.ctrlKey || e.metaKey) && e.key === 's') {
			e.preventDefault();
			formElement.requestSubmit();
		}
	}}
/>

<div class="flex flex-row">
	<div class="flex w-full flex-col gap-4 p-8">
		<form
			method="POST"
			action="/create?/compile"
			use:enhance={({ action }) => {
				// Before submitting the form...
				console.log('formState', formState);
				console.log('authorState', authorState);
				console.log('clauseState', clauseState);
				switch (action.search) {
					case '?/compile': {
						formState.isCompiling = true;
						// After submitting the form, this function will execute
						return async ({ update, result }) => {
							update({ reset: false });
							formState.isCompiling = false;
							if (result.type === 'success') {
								formState.iFrameUrl = (result.data?.result as any) || '/GUIDE.pdf';
							} else {
								console.error('Form submission failed:', result);
							}
						};
					}
					case '?/getTeX': {
						// After receiving the response:
						return async ({ update, result }) => {
							// The browser should download the TeX file
							if (result.type !== 'success') {
								console.error('Failed to get TeX:', result);
								return;
							}
							const blob = new Blob([result?.data?.result as any], { type: 'text/plain' });
							const url = URL.createObjectURL(blob);
							const a = document.createElement('a');
							a.href = url;
							a.download = `source-${new Date().toLocaleDateString('sv-SE')}.tex`;
							document.body.appendChild(a);
							a.click();
							document.body.removeChild(a);
							URL.revokeObjectURL(url);
							formState.isCompiling = false;
							update({ reset: false });
						};
					}
				}
			}}
			enctype="multipart/form-data"
			bind:this={formElement}
		>
			{@render children()}
			<SubmitButton />
			<SaveDraftButton />
		</form>
	</div>
	<PDFViewer />
</div>
