<script lang="ts">
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
	// const baseBtn = 'rounded p-2 text-white disabled:cursor-not-allowed disabled:opacity-50';

	// const getNaturalDocumentClass = (s: string) => {
	// 	switch (s) {
	// 		case 'motion':
	// 			return 'en motion';
	// 		case 'proposition':
	// 			return 'en proposition';
	// 		case 'styrelsens-svar':
	// 			return 'ett "styrelsens svar"';
	// 		case 'kallelse':
	// 			return 'en kallelse';
	// 		case 'kravprofil':
	// 			return 'en kravprofil';
	// 		case 'valförslag':
	// 			return 'ett valförslag';
	// 		case 'custom':
	// 			return 'ett anpassat dokument';
	// 	}
	// };
	let naturalDocumentClass = $state('');
	onMount(() => {
		naturalDocumentClass = getNaturalDocumentClass(formState.documentClass) ?? '';
	});
</script>

<nav class="sticky top-0 z-50 border-b border-gray-300 bg-[rgb(248,184,201)] shadow-sm">
	<div class="flex h-14 w-full items-center px-6">
		<!-- Left: Back link & document class -->
		<div class="flex w-1/2 items-center space-x-6">
			<a href="/" class="flex items-center gap-1 text-black hover:underline"> ← Hem </a>
			<h3 class="text-md text-gray-800">
				Skapar: <span class="font-semibold">{naturalDocumentClass}</span>
			</h3>
		</div>

		<!-- Middle: empty space to push buttons to the right -->

		<!-- Right: Action buttons -->
		<div class="flex w-1/2 items-center justify-between">
			<div class="px-6">
				<button
					{...compilePdf.enhance(async ({ submit }) => {
						enhanceFunction(submit);
					})}
					class="text-md inline-flex items-center gap-1 rounded-md bg-green-500 px-3 py-1.5 font-medium text-white shadow-sm hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
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
					class="text-md inline-flex items-center gap-1 rounded-md bg-blue-500 px-3 py-1.5 font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
				>
					<span>&#x2913;</span> Hämta PDF
				</button>
			</div>
			<div>
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
					class="inline-flex items-center gap-1 rounded-md bg-purple-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
				>
					Hämta TeX
				</button>

				<button
					type="button"
					class="inline-flex items-center gap-1 rounded-md bg-purple-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
					onclick={saveDraft}
				>
					Spara utkast
				</button>
			</div>
		</div>
	</div>
</nav>
