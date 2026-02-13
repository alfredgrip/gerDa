<script lang="ts">
	import { beforeNavigate, goto } from '$app/navigation';
	import { dirty } from '$lib/state/appState.svelte';
	import { formState } from '$lib/state/formState.svelte';
	import { draftStore } from '$lib/state/localDraftsState.svelte';

	let showModal = $state(false);
	let pendingNavigation = $state<{ to: string } | null>(null);
	let confirmed = false;
	let currentDraft = $derived(draftStore.getDraft(draftStore.currentDraftId));

	beforeNavigate((navigation) => {
		if (confirmed || navigation.willUnload) return;
		if (!dirty.get()) return;
		navigation.cancel();
		pendingNavigation = { to: navigation.to?.url.pathname || '/' };
		showModal = true;
	});

	async function handleSaveAndExit() {
		if (currentDraft) {
			draftStore.updateDraft(currentDraft.id, formState);
		} else {
			draftStore.addDraft(formState);
		}

		completeNavigation();
	}

	function completeNavigation() {
		const url = pendingNavigation?.to;
		if (url) {
			confirmed = true;
			showModal = false;
			goto(url).then(() => {
				confirmed = false;
				pendingNavigation = null;
				dirty.set(false);
			});
		}
	}

	function handleDiscardAndExit() {
		completeNavigation();
	}

	function cancel() {
		showModal = false;
		pendingNavigation = null;
		confirmed = false;
	}
</script>

{#if showModal}
	<div class="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm">
		<div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
			<h2 class="text-xl font-bold">Osparade ändringar</h2>
			<p class="mt-2 text-gray-600">
				Du håller på att lämna sidan. Vad vill du göra med ditt utkast?
			</p>

			<div class="mt-6 flex flex-col gap-3">
				<button
					onclick={handleSaveAndExit}
					class="w-full rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"
				>
					Spara utkast och lämna
				</button>

				<button
					onclick={handleDiscardAndExit}
					class="w-full rounded-lg border border-gray-300 px-4 py-2 font-semibold text-red-600 hover:bg-red-100"
				>
					Lämna utan att spara
				</button>

				<button onclick={cancel} class="w-full px-4 py-2 text-sm text-gray-500 hover:underline">
					Avbryt (stanna kvar)
				</button>
			</div>
		</div>
	</div>
{/if}
