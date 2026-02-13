<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { draftStore } from '$lib/state/localDraftsState.svelte';

	const localDrafts = $derived(draftStore);
	let sortedDrafts = $derived(localDrafts.drafts.toSorted((a, b) => b.lastEdit - a.lastEdit));

	function deleteDraft(id: string, e: MouseEvent) {
		e.stopPropagation();
		if (confirm('Vill du verkligen ta bort utkastet?')) {
			draftStore.removeDraft(id);
		}
	}
</script>

<div class="bg-dsek-highlight min-h-screen">
	<header class="px-8 py-10">
		<div class="mx-auto max-w-5xl">
			<a href="/" class="mb-4 inline-block text-sm font-semibold hover:underline">
				← Tillbaka till mallar
			</a>
			<h1 class="text-4xl font-extrabold tracking-tight">Dina utkast</h1>
		</div>
	</header>

	<main class="mx-auto max-w-5xl p-8">
		{#if sortedDrafts.length === 0}
			<div
				class="border-dsek flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-20 text-center"
			>
				<span class="mb-4 text-5xl">📄</span>
				<h2 class="text-xl font-bold">Inga utkast</h2>
				<a
					href="/"
					class="bg-dsek mt-6 rounded-lg px-6 py-2 font-bold text-white transition-transform hover:scale-105"
				>
					Skapa ditt första dokument
				</a>
			</div>
		{:else}
			<div class="flex flex-col gap-4">
				{#each sortedDrafts as draft (draft.id)}
					<div
						role="button"
						tabindex="0"
						onclick={() => {
							localDrafts.currentDraftId = draft.id;
							goto(resolve(`/create/${draft.documentClass}`));
						}}
						onkeydown={(e) => e.key === 'Enter' && goto(resolve(`/create/${draft.documentClass}`))}
						class="bg-dsek-pale hover:border-dsek group flex cursor-pointer items-center justify-between rounded-2xl border-2 border-transparent p-6 shadow-sm transition-all hover:shadow-md"
					>
						<div class="flex items-center gap-6 overflow-hidden">
							<div
								class="bg-dsek-pale flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
							>
								📄
							</div>
							<div class="min-w-0">
								<h2 class="truncate text-xl font-bold">
									{draft.title || 'Titel saknas'}
								</h2>
								<div class="mt-1 flex items-center gap-3 text-sm text-gray-600">
									<span class="font-bold tracking-tighter uppercase">
										{draft.documentClass.replace('-', ' ')}
									</span>
									<span>•</span>
									<span>
										Ändrad {new Date(draft.lastEdit).toLocaleDateString('sv-SE', {
											day: 'numeric',
											month: 'long',
											year: 'numeric',
											hour: '2-digit',
											minute: '2-digit'
										})}
									</span>
								</div>
							</div>
						</div>

						<div class="flex items-center gap-4">
							<button
								onclick={(e) => deleteDraft(draft.id, e)}
								class="flex h-10 w-10 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
								title="Ta bort utkast"
							>
								🗑️
							</button>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</main>
</div>
