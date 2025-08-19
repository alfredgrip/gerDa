<script lang="ts">
	import PDFViewer from '$lib/components/PDFViewer.svelte';
	import Toolbar from '$lib/components/Toolbar.svelte';
	import { compilePdf } from '$lib/formActions.remote';
	import { getAuthorContext } from '$lib/state/authorState.svelte';
	import { getClauseContext } from '$lib/state/clauseState.svelte';
	import { getFormContext } from '$lib/state/formState.svelte';
	import { getLocalStorageDrafts } from '$lib/state/localDraftsState.svelte';
	import { onMount } from 'svelte';

	let { children } = $props();
	let formState = getFormContext();
	let authorState = getAuthorContext();
	let clauseState = getClauseContext();
	// let localDrafts = getLocalStorageDrafts();

	let formElement: HTMLFormElement;

	const compileEnhance = async (submit: () => Promise<void>) => {
		formState.isCompiling = true;
		await submit()
			.then(() => {
				formState.iFrameUrl = compilePdf.result?.filePath || '/GUIDE.pdf';
			})
			.catch((error) => {
				console.error('Error during PDF compilation:', error);
				formState.iFrameUrl = '/error';
			})
			.finally(() => {
				formState.isCompiling = false;
			});
	};

	onMount(() => {
		const localDrafts = getLocalStorageDrafts();
		console.log(localDrafts);
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
<main class="flex min-h-screen flex-col">
	<form
		{...compilePdf.enhance(async ({ submit }) => {
			compileEnhance(submit);
		})}
		enctype="multipart/form-data"
		bind:this={formElement}
		class="flex flex-1 flex-col"
	>
		<Toolbar enhanceFunction={compileEnhance} />
		<div class="flex flex-1 flex-row">
			<div class="w-full space-y-4 px-6 py-3">
				{@render children()}
			</div>
			<PDFViewer />
		</div>
	</form>
</main>
