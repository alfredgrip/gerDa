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
	import { fade, fly } from 'svelte/transition';

	interface Props {
		formElement: HTMLFormElement;
		enhanceFunction: (submit: () => Promise<void>, data: RequestSchema) => Promise<void>;
	}
	let { formElement, enhanceFunction }: Props = $props();

	let compileButton: HTMLButtonElement;
	let latexButton: HTMLButtonElement;

	let isMacOS = $derived.by(() => {
		if (!browser) return false;
		return window.navigator.userAgent
			? window.navigator.userAgent.toLowerCase().includes('mac os')
			: /Mac/i.test(window.navigator.userAgent);
	});

	let saveSuccess = $state(false);

	async function saveDraft() {
		let draft = draftStore.getDraft(draftStore.currentDraftId);
		if (draft != null) {
			draftStore.updateDraft(draft.id, { ...formState });
		} else {
			draftStore.addDraft({ ...formState });
		}
		dirty.set(false);

		// Trigger Success Animation
		saveSuccess = true;
		setTimeout(() => {
			saveSuccess = false;
		}, 2000); // Reset after 2 seconds
	}

	function downloadPdf() {
		const filePath = pdfViewerUrl.get();
		if (filePath) {
			const a = document.createElement('a');
			a.href = filePath;
			a.download = 'document.pdf';
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
		}
	}

	let naturalDocumentClass = $state('');
	onMount(() => {
		naturalDocumentClass = getNaturalDocumentClass(formState.documentClass) ?? '';
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
				bind:this={compileButton}
				disabled={isCompiling.get()}
				class="group inline-flex flex-1 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 font-medium text-white shadow-sm ring-offset-1 transition-all hover:bg-emerald-700 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
			>
				<span
					class={isCompiling.get() ? 'animate-spin' : 'transition-transform group-hover:rotate-45'}
				>
					⚙️
				</span>
				<span>Kompilera</span>
				<span class="hidden text-xs opacity-80 lg:inline">({isMacOS ? '⌘' : 'Ctrl'} + S)</span>
			</button>

			<button
				type="button"
				onclick={downloadPdf}
				disabled={isCompiling.get()}
				class="inline-flex flex-1 items-center gap-1.5 rounded-lg bg-blue-500 px-3 py-1.5 font-medium text-white shadow-sm ring-offset-1 transition-all hover:bg-blue-600 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
			>
				<span class="transition-transform group-hover:-translate-y-0.5">⬇️</span> Hämta PDF
			</button>

			<button
				name="output"
				value="latex"
				disabled={isCompiling.get()}
				class="inline-flex flex-1 items-center gap-1.5 rounded-lg bg-blue-500 px-3 py-1.5 font-medium text-white shadow-sm ring-offset-1 transition-all hover:bg-blue-600 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
				bind:this={latexButton}
			>
				<span class="transition-transform group-hover:-translate-y-0.5">⬇️</span> Hämta TeX
			</button>

			<button
				type="button"
				onclick={saveDraft}
				disabled={isCompiling.get()}
				class="group inline-flex flex-1 items-center gap-1.5 rounded-lg bg-blue-500 px-3 py-1.5 font-medium text-white shadow-sm ring-offset-1 transition-all hover:bg-blue-600 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
			>
				<span class="transition-transform group-hover:-translate-y-0.5">💾</span>
				<span>Spara utkast</span>
			</button>
		</div>
	</div>
</nav>
