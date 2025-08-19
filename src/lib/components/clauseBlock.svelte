<script lang="ts">
	import ResizingTextInput from '$lib/components/ResizingTextInput.svelte';
	import { getClauseContext } from '$lib/state/clauseState.svelte';

	let clauseState = getClauseContext();
</script>

<div class="space-y-4">
	<h2 class="text-lg font-semibold text-gray-800">Att-satser</h2>

	{#each clauseState.clauses as c, i (i)}
		<div class="relative space-y-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
			<!-- Remove button (X) -->
			{#if i !== 0}
				<button
					type="button"
					onclick={() => clauseState.removeClause(i)}
					class="absolute top-2 right-2 text-gray-400 hover:text-red-600"
					aria-label="Ta bort att-sats"
				>
					✕
				</button>
			{/if}

			<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
				<ResizingTextInput
					name={`clause_${i}_toClause`}
					bind:value={c.toClause}
					placeholder="sjunga mer..."
					label="Att-sats"
					class="w-full"
				/>
				<ResizingTextInput
					name={`clause_${i}_description`}
					bind:value={c.description}
					placeholder="Beskrivning (frivillig)"
					label="Beskrivning"
					class="w-full"
				/>
			</div>
		</div>
	{/each}

	<div class="flex justify-end">
		<button
			type="button"
			onclick={() => clauseState.addClause()}
			class="inline-flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white shadow hover:bg-green-700"
		>
			➕ Lägg till att-sats
		</button>
	</div>
</div>
