<script lang="ts">
	import { page } from '$app/state';
	import NavigationGuard from '$lib/components/NavigationGuard.svelte';
	import PDFViewer from '$lib/components/PDFViewer.svelte';
	import Toolbar from '$lib/components/Toolbar.svelte';
	import { gerdaForm } from '$lib/form.remote';
	import { isDocumentClass, type RequestSchema } from '$lib/schemas';
	import { pdfViewerUrl, isCompiling } from '$lib/state/appState.svelte';
	import { formState, resetFormState } from '$lib/state/formState.svelte';
	import { draftStore } from '$lib/state/localDraftsState.svelte';
	import { error, type RemoteFormInput } from '@sveltejs/kit';
	import { onMount } from 'svelte';

	let { children } = $props();

	let formElement: HTMLFormElement;

	const compileEnhance = async (submit: () => Promise<void>, data: RemoteFormInput) => {
		isCompiling.set(data.output === 'pdf');
		await submit()
			.then(() => {
				if (gerdaForm.result?.filePath) {
					pdfViewerUrl.set(gerdaForm.result.filePath);
				} else if (gerdaForm.result?.laTeX) {
					const a = document.createElement('a');
					a.href = URL.createObjectURL(new Blob([gerdaForm.result.laTeX], { type: 'text/plain' }));
					a.download = `${formState.title}-${new Date().toLocaleDateString('sv-SE')}.tex`;
					document.body.appendChild(a);
					a.click();
					document.body.removeChild(a);
				}
			})
			.catch((error) => {
				console.error('Error during PDF compilation:', error);
				pdfViewerUrl.set('/error');
			})
			.finally(() => {
				isCompiling.set(false);
			});
	};

	onMount(() => {
		pdfViewerUrl.set('/GUIDE.pdf');

		const currentDraftId = draftStore.currentDraftId;
		if (currentDraftId) {
			const draft = draftStore.getDraft(currentDraftId);
			if (draft) {
				Object.assign(formState, draft);
			}
		} else {
			resetFormState();
		}
		return () => {
			draftStore.currentDraftId = null;
		};
	});

	$effect(() => {
		const documentClassInUrl = decodeURI(page.url.pathname.split('/')[2]);
		if (documentClassInUrl && isDocumentClass(documentClassInUrl)) {
			formState.documentClass = documentClassInUrl;
		} else {
			error(404, 'Dokumentklassen finns inte');
		}
	});
</script>

<NavigationGuard />

<main class="flex min-h-screen flex-col">
	<form
		{...gerdaForm.enhance(async ({ submit, data }) => {
			compileEnhance(submit, data);
		})}
		enctype="multipart/form-data"
		bind:this={formElement}
		class="flex flex-1 flex-col"
	>
		<Toolbar enhanceFunction={compileEnhance} {formElement} />

		<input type="hidden" name="documentClass" value={formState.documentClass} />

		<div class="flex min-h-0 flex-1 flex-col gap-y-8 py-3 lg:flex-row">
			<div class="flex w-full flex-col gap-y-4 px-6 lg:overflow-y-auto">
				{@render children()}
			</div>

			<div class="w-full lg:sticky lg:top-20 lg:h-[calc(100vh-120px)]">
				<PDFViewer />
			</div>
		</div>
	</form>
</main>
