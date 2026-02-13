<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { gerdaForm, latexForm } from '$lib/form.remote';
	import type { RequestSchema } from '$lib/schemas';
	import { dirty, isCompiling, output } from '$lib/state/appState.svelte';
	import { formState } from '$lib/state/formState.svelte';
	import { draftStore } from '$lib/state/localDraftsState.svelte';
	import { getNaturalDocumentClass } from '$lib/utils';
	import { onMount, tick } from 'svelte';

	interface Props {
		enhanceFunction: (submit: () => Promise<void>) => Promise<void>;
	}
	let { enhanceFunction }: Props = $props();

	let localDrafts = $derived(draftStore);

	async function saveDraft() {
		let draft = localDrafts.getDraft(localDrafts.currentDraftId);
		if (draft != null) {
			// If a draft with the current ID exists, update it
			localDrafts.updateDraft(draft.id, {
				...formState
			});
		} else {
			// If no draft exists, create a new one
			draft = {
				id: crypto.randomUUID(),
				lastEdit: Date.now(),
				...formState
			};
			console.log('Saving draft:', draft);
			console.log('Stringified draft:', JSON.stringify(draft, null, 2));
			localDrafts.addDraft(draft);
		}
		dirty.set(false);
	}

	let naturalDocumentClass = $state('');
	onMount(() => {
		naturalDocumentClass = getNaturalDocumentClass(formState.documentClass) ?? '';
	});

	let isMacOS = $derived.by(() => {
		if (!browser) return false;
		return window.navigator.userAgent
			? window.navigator.userAgent.toLowerCase().includes('mac os')
			: /Mac/i.test(window.navigator.userAgent);
	});
</script>

<nav class="bg-dsek-highlight sticky top-0 z-50 border-b border-gray-300 shadow-sm">
	<div class="flex flex-wrap items-center justify-between px-4 py-2 sm:px-6 sm:py-3">
		<div class="flex min-w-0 flex-1 items-center space-x-3 sm:space-x-6">
			<a href="/" class="flex items-center p-2 text-xl hover:underline"> ← </a>
			<h3 class="truncate text-lg">
				Skapar: <span class="font-semibold">
					{getNaturalDocumentClass(page.route.id?.split('/').pop() ?? '')}
				</span>
			</h3>
		</div>

		<div class="mt-2 flex flex-wrap items-center gap-2 sm:mt-0 sm:gap-4">
			<button
				{...gerdaForm.for('compileButton').enhance(async ({ submit }) => {
					enhanceFunction(submit);
				})}
				class="inline-flex flex-1 items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 font-medium text-white shadow-sm hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
			>
				<span>⚙️</span> Kompilera ({isMacOS ? '⌘' : 'Ctrl'} + S)
			</button>

			<button
				type="button"
				onclick={() => {
					if (!gerdaForm.result) return;
					const filePath = gerdaForm.result?.filePath;
					if (filePath) {
						const a = document.createElement('a');
						a.href = filePath;
						a.download = 'document.pdf';
						document.body.appendChild(a);
						a.click();
						document.body.removeChild(a);
					}
				}}
				disabled={!gerdaForm.result?.filePath || isCompiling.get()}
				class="inline-flex flex-1 items-center gap-1 rounded-lg bg-blue-500 px-3 py-1.5 font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
			>
				<span>⬇️</span> Hämta PDF
			</button>

			<button
				{...latexForm.for('latex').enhance(async ({ submit }) => {
					await submit()
						.then(() => {
							const laTeX = latexForm.result?.laTeX;
							if (!laTeX) throw new Error('Failed to generate LaTeX');
							const a = document.createElement('a');
							a.href = URL.createObjectURL(new Blob([laTeX], { type: 'text/plain' }));
							a.download = `${formState.title}-${new Date().toLocaleDateString('sv-SE')}.tex`;
							document.body.appendChild(a);
							a.click();
							document.body.removeChild(a);
						})
						.catch((error) => console.error('Error during TeX generation:', error))
						.finally(() => {
							output.set('pdf');
						});
				})}
				class="inline-flex flex-1 items-center gap-1 rounded-lg bg-blue-500 px-3 py-1.5 font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
			>
				<span>⬇️</span> Hämta TeX
			</button>

			<button
				type="button"
				class="inline-flex flex-1 items-center gap-1 rounded-lg bg-blue-500 px-3 py-1.5 font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
				onclick={saveDraft}
			>
				<span>💾</span> Spara utkast
			</button>
		</div>
	</div>
</nav>
