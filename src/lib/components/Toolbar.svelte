<script lang="ts">
	import { page } from '$app/state';
	import { compilePdf, generateTeX } from '$lib/formActions.remote';
	import { getAuthorContext } from '$lib/state/authorState.svelte';
	import { getClauseContext } from '$lib/state/clauseState.svelte';
	import { getFormContext } from '$lib/state/formState.svelte';
	import { getLocalStorageDrafts } from '$lib/state/localDraftsState.svelte';
	import { getNaturalDocumentClass } from '$lib/utils';
	import { onMount } from 'svelte';

	interface ToolbarProps {
		enhanceFunction: (submit: () => Promise<void>) => Promise<void>;
	}
	let { enhanceFunction }: ToolbarProps = $props();

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

	let naturalDocumentClass = $state('');
	onMount(() => {
		naturalDocumentClass = getNaturalDocumentClass(formState.documentClass) ?? '';
	});
</script>

<nav class="sticky top-0 z-50 border-b border-gray-300 bg-[rgb(248,184,201)] shadow-sm">
	<div class="flex flex-wrap items-center justify-between px-4 py-2 sm:px-6 sm:py-3">
		<div class="flex min-w-0 flex-1 items-center space-x-3 sm:space-x-6">
			<a href="/" class="flex items-center p-2 text-xl text-gray-800 hover:underline"> ← </a>
			<h3 class="truncate text-lg text-gray-800">
				Skapar: <span class="font-semibold">
					{getNaturalDocumentClass(page.route.id?.split('/').pop() ?? '')}
				</span>
			</h3>
		</div>

		<div class="mt-2 flex flex-wrap items-center gap-2 sm:mt-0 sm:gap-4">
			<button
				{...compilePdf.enhance(async ({ submit }) => {
					enhanceFunction(submit);
				})}
				class="inline-flex flex-1 items-center gap-1 rounded-md bg-green-500 px-3 py-1.5 font-medium text-white shadow-sm hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
			>
				<span>&#128260;</span> Kompilera
			</button>

			<button
				type="button"
				onclick={() => {
					const filePath = compilePdf.result?.filePath;
					if (filePath) {
						const a = document.createElement('a');
						a.href = filePath;
						a.download = 'document.pdf';
						document.body.appendChild(a);
						a.click();
						document.body.removeChild(a);
					}
				}}
				disabled={!compilePdf.result?.filePath || formState.isCompiling}
				class="inline-flex flex-1 items-center gap-1 rounded-md bg-blue-500 px-3 py-1.5 font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
			>
				<span>&#x2913;</span> Hämta PDF
			</button>

			<button
				{...generateTeX.buttonProps.enhance(async ({ submit }) => {
					await submit()
						.then(() => {
							const laTeX = generateTeX.result?.laTeX;
							if (!laTeX) throw new Error('Failed to generate LaTeX');
							const a = document.createElement('a');
							a.href = URL.createObjectURL(new Blob([laTeX], { type: 'text/plain' }));
							a.download = `${formState.title}-${new Date().toLocaleDateString('sv-SE')}.tex`;
							document.body.appendChild(a);
							a.click();
							document.body.removeChild(a);
						})
						.catch((error) => console.error('Error during TeX generation:', error));
				})}
				class="inline-flex flex-1 items-center gap-1 rounded-md bg-purple-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
			>
				Hämta TeX
			</button>

			<button
				type="button"
				class="inline-flex flex-1 items-center gap-1 rounded-md bg-purple-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
				onclick={saveDraft}
			>
				Spara utkast
			</button>
		</div>
	</div>
</nav>
