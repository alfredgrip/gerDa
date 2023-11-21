<script lang="ts">
	import { writable, type Writable } from 'svelte/store';
	import ResizingTextInput from '$lib/components/resizingTextInput.svelte';
	import RemoveButton from '$lib/components/removeButton.svelte';
	import AddButton from '$lib/components/addButton.svelte';

	let clauses: Writable<
		Array<{
			name: string;
			description?: string;
			uuid: string;
		}>
	> = writable([{ name: '', description: '', uuid: Math.random().toString() }]);

	function addClause() {
		clauses.update((clauses) => [
			...clauses,
			{ name: '', description: '', uuid: Math.random().toString() }
		]);
	}
	function removeClause(uuid: string) {
		clauses.update((clauses) => clauses.filter((clause) => clause.uuid !== uuid));
	}
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<div class="clause-wrapper">
	<label>
		Att-satser
		<div>
			<input type="checkbox" name="numberedClauses" checked={false} />
			<label><small>Numrerade att-satser?</small></label>
		</div>
		{#each $clauses as clause, i (clause.uuid)}
			<div class="clause-div">
				<div class="inner-clause-div">
					<ResizingTextInput
						idName={`to-clause-${i.toString()}`}
						type="textArea"
						labelName=""
						required="true"
						placeholder="sjunga mer..."
					/>
					<ResizingTextInput
						idName={`to-clause-${i.toString()}-description`}
						type="textArea"
						placeholder="Beskrivning (frivillig)"
						labelName=""
					/>
				</div>
				{#if i !== 0}
					<RemoveButton
						buttonText={`Ta bort att-sats ${(i + 1).toString()}`}
						uuid={clause.uuid}
						removeFunction={removeClause}
					/>
				{/if}
			</div>
		{/each}
		<AddButton buttonText="Lägg till att-sats" addFunction={addClause} />
	</label>
</div>

<style>
	.clause-wrapper {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.clause-div {
		display: flex;
		flex-direction: column;
		margin: 0.5rem 0;
	}

	.inner-clause-div {
		display: flex;
		flex-direction: column;
		/* gap: 1rem; */
	}
</style>
