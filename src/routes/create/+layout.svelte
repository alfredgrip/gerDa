<script lang="ts">
	import { page } from '$app/state';
	import NavigationGuard from '$lib/components/NavigationGuard.svelte';
	import PDFViewer from '$lib/components/PDFViewer.svelte';
	import Toolbar from '$lib/components/Toolbar.svelte';
	import { gerdaForm } from '$lib/form.remote';
	import { isDocumentClass, type RequestSchema } from '$lib/schemas';
	import { iFrameUrl, isCompiling, output } from '$lib/state/appState.svelte';
	import { formState, resetFormState } from '$lib/state/formState.svelte';
	import { draftStore } from '$lib/state/localDraftsState.svelte';
	import { error } from '@sveltejs/kit';
	import { onMount } from 'svelte';

	let { children } = $props();

	let outputFormat = $derived(output.get());

	let formElement: HTMLFormElement;

	const compileEnhance = async (submit: () => Promise<void>) => {
		isCompiling.set(true);
		await submit()
			.then(() => {
				iFrameUrl.set(gerdaForm.result?.filePath || '/GUIDE.pdf');
			})
			.catch((error) => {
				console.error('Error during PDF compilation:', error);
				iFrameUrl.set('/error');
			})
			.finally(() => {
				isCompiling.set(false);
			});
	};

	onMount(() => {
		iFrameUrl.set('/GUIDE.pdf');

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
			// reset draftId when leaving page
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

	$inspect(formState);
</script>

<svelte:window
	onkeydown={(e) => {
		if ((e.ctrlKey || e.metaKey) && e.key === 's') {
			e.preventDefault();
			formElement.requestSubmit();
		}
	}}
/>

<NavigationGuard />

<main class="flex min-h-screen flex-col">
	<form
		{...gerdaForm.for('root').enhance(async ({ submit }) => {
			compileEnhance(submit);
		})}
		enctype="multipart/form-data"
		bind:this={formElement}
		class="flex flex-1 flex-col"
	>
		<Toolbar enhanceFunction={compileEnhance} />

		<input type="hidden" name="documentClass" value={formState.documentClass} />
		<input type="hidden" name="output" bind:value={outputFormat} />

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
