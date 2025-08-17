<script lang="ts">
	import PDFViewer from '$lib/components/PDFViewer.svelte';
	import SaveDraftButton from '$lib/components/SaveDraftButton.svelte';
	import SubmitButton from '$lib/components/SubmitButton.svelte';
	import { getAuthorContext } from '$lib/state/authorState.svelte';
	import { getClauseContext } from '$lib/state/clauseState.svelte';
	import { getFormContext } from '$lib/state/formState.svelte';
	import { getLocalStorageDrafts } from '$lib/state/localDraftsState.svelte';
	import { onMount } from 'svelte';
	import { compilePdf, generateTeX } from './compile.remote';

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

	const compileEnhance: Parameters<typeof compilePdf.enhance>[0] = async ({
		form,
		data,
		submit
	}) => {
		formState.isCompiling = true;
		await submit()
			.then(() => {
				formState.iFrameUrl = compilePdf.result?.filePath || '/GUIDE.pdf';
			})
			.catch((error) => {
				console.error('Error during PDF compilation:', error);
			})
			.finally(() => {
				formState.isCompiling = false;
			});
	};
</script>

<svelte:window
	onkeydown={(e) => {
		if ((e.ctrlKey || e.metaKey) && e.key === 's') {
			e.preventDefault();
			formElement.requestSubmit();
		}
	}}
/>
<form
	{...compilePdf.enhance(async ({ form, data, submit }) => {
		compileEnhance({ form, data, submit });
	})}
	enctype="multipart/form-data"
	bind:this={formElement}
>
	<nav class="sticky top-0 flex items-center gap-12 bg-purple-800 px-6 py-3 text-white">
		<div class="flex w-1/2">
			<a href="/" class="text-white hover:underline">Hem</a>
		</div>
		<div class="flex w-1/2">
			<button
				{...compilePdf.enhance(async ({ form, data, submit }) => {
					compileEnhance({ form, data, submit });
				})}
				class="rounded bg-purple-600 hover:bg-purple-700">Kompilera!</button
			>
			<button
				{...generateTeX.buttonProps.enhance(async ({ form, data, submit }) => {
					await submit()
						.then(() => {
							const laTeX = generateTeX.result?.laTeX;
							if (!laTeX) throw new Error('Failed to generate LaTeX');
							const anchorElement = document.createElement('a');
							anchorElement.href = URL.createObjectURL(new Blob([laTeX], { type: 'text/plain' }));
							anchorElement.download = `${formState.title}-${new Date().toLocaleDateString('sv-SE')}.tex`;
							document.body.appendChild(anchorElement);
							anchorElement.click();
							document.body.removeChild(anchorElement);
						})
						.catch((error) => {
							console.error('Error during TeX generation:', error);
						});
				})}
				class="ml-4 rounded bg-purple-600 hover:bg-purple-700"
			>
				Hämta TeX
			</button>
		</div>
	</nav>
	<div class="flex flex-row">
		<div class=" flex w-full flex-col gap-4 bg-red-200 px-6 py-3">
			{@render children()}
			<!-- <SubmitButton />
			<SaveDraftButton /> -->
		</div>
		<PDFViewer />
	</div>
</form>
