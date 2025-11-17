<script lang="ts">
	import ResizingTextInput from '$lib/components/ResizingTextInput.svelte';
	import { getFormContext } from '$lib/state/formState.svelte';
	import { getProposalContext } from '$lib/state/proposalState.svelte';

	let proposalState = getProposalContext();
	let formState = getFormContext();

	let rawProposalWhos = $state('');
	let parsedProposalWhos = $derived.by(() =>
		JSON.stringify(
			formState.proposals
				.split('\n')
				.map((prop) => prop.trim())
				.filter(Boolean)
		)
	);
</script>

<div class="space-y-4">
	<h2 class="text-lg font-semibold text-gray-800">Förslag</h2>

	{#each proposalState.proposals as p, i (i)}
		<div class="relative space-y-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
			{#if i !== 0}
				<button
					type="button"
					onclick={() => proposalState.removeProposal(i)}
					class="absolute top-2 right-3 text-gray-400 hover:text-red-600"
					aria-label="Ta bort förslag"
				>
					✕
				</button>
			{/if}

			<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
				<ResizingTextInput
					name={`proposal_${i}_position`}
					bind:value={p.position}
					placeholder="sjunga mer..."
					label="Post"
					class="w-full"
				/>
				<ResizingTextInput
					name={`proposal_${i}_who`}
					bind:value={rawProposalWhos}
					placeholder="sång är bra för..."
					label="Beskrivning (frivillig)"
					class="w-full"
				/>
				<input type="hidden" name={`proposal_${i}_who`} bind:value={p.who} />
			</div>
		</div>
	{/each}

	<div class="flex justify-end">
		<button
			type="button"
			onclick={() => proposalState.addProposal()}
			class="inline-flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white shadow hover:bg-green-700"
		>
			➕ Lägg till förslag
		</button>
	</div>
</div>
