<script lang="ts">
	import ResizingTextInput from '$lib/components/ResizingTextInput.svelte';
	import { getClauseContext } from '$lib/state/clauseState.svelte';

	let clauseState = getClauseContext();
</script>

<div>
	<label>
		<b>Att-satser</b>
		{#each clauseState.clauses as c, i}
			<div class="flex flex-col items-end gap-2 py-2">
				<div class="flex w-full flex-col gap-2">
					<ResizingTextInput
						name={`clause_${i.toString()}_toClause`}
						bind:value={c.toClause}
						placeholder="sjunga mer..."
					/>
					<ResizingTextInput
						name={`toClause_${i.toString()}_description`}
						bind:value={c.description}
						placeholder="Beskrivning (frivillig)"
					/>
				</div>
				{#if i !== 0}
					<button
						type="button"
						onclick={() => clauseState.removeClause(i)}
						class="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
					>
						Ta bort att-sats {(i + 1).toString()}
					</button>
				{/if}
			</div>
		{/each}
		<button
			type="button"
			onclick={() => clauseState.addClause()}
			class="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
		>
			Lägg till att-sats
		</button>
	</label>
</div>
