<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { gerdaForm, latexForm } from '$lib/form.remote';
	import type { RequestSchema } from '$lib/schemas';
	import { dirty, isCompiling, pdfViewerUrl } from '$lib/state/appState.svelte';
	import { formState } from '$lib/state/formState.svelte';
	import { draftStore } from '$lib/state/localDraftsState.svelte';
	import { getNaturalDocumentClass } from '$lib/utils';
	import { onMount } from 'svelte';

	interface Props {
		formElement: HTMLFormElement;
		enhanceFunction: (submit: () => Promise<void>, data: RequestSchema) => Promise<void>;
	}
	let { formElement, enhanceFunction }: Props = $props();

	let compileButton: HTMLButtonElement;
	let latexButton: HTMLButtonElement;

	async function saveDraft() {
		let draft = draftStore.getDraft(draftStore.currentDraftId);
		if (draft != null) {
			draftStore.updateDraft(draft.id, {
				...formState
			});
		} else {
			draftStore.addDraft({ ...formState });
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

<svelte:window
	onkeydown={(e) => {
		if ((e.ctrlKey || e.metaKey) && e.key === 's') {
			e.preventDefault();
			formElement.requestSubmit(compileButton);
		}
	}}
/>

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
				name="output"
				value="pdf"
				{...gerdaForm.for('compileButton').enhance(async ({ submit, data }) => {
					enhanceFunction(submit, data);
				})}
				class="inline-flex flex-1 items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 font-medium text-white shadow-sm hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
				bind:this={compileButton}
				disabled={isCompiling.get()}
			>
				<span>⚙️</span> Kompilera ({isMacOS ? '⌘' : 'Ctrl'} + S)
			</button>

			<button
				type="button"
				onclick={() => {
					const filePath = pdfViewerUrl.get();
					if (filePath) {
						const a = document.createElement('a');
						a.href = filePath;
						a.download = 'document.pdf';
						document.body.appendChild(a);
						a.click();
						document.body.removeChild(a);
					}
				}}
				disabled={isCompiling.get()}
				class="inline-flex flex-1 items-center gap-1 rounded-lg bg-blue-500 px-3 py-1.5 font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
			>
				<span>⬇️</span> Hämta PDF
			</button>

			<button
				name="output"
				value="latex"
				class="inline-flex flex-1 items-center gap-1 rounded-lg bg-blue-500 px-3 py-1.5 font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
				bind:this={latexButton}
				disabled={isCompiling.get()}
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
