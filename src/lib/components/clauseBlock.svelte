<script lang="ts">
	import AddButton from '$lib/components/AddButton.svelte';
	import DeleteButton from '$lib/components/DeleteButton.svelte';
	import ResizingTextInput from '$lib/components/ResizingTextInput.svelte';
	import { formState } from '$lib/state/formState.svelte';

	interface Props {
		clausePlaceHolder?: string;
		descriptionPlaceHolder?: string;
	}

	let {
		clausePlaceHolder = 'sjunga mer...',
		descriptionPlaceHolder = 'sång är bra för...'
	}: Props = $props();

	function removeClause(idx: number) {
		formState.clauses = formState.clauses.filter((_, i) => idx != i);
	}
	function addClause() {
		formState.clauses.push({ toClause: '', description: '' });
	}
</script>

<div class="space-y-4">
	<h2 class="text-lg font-semibold">Att-satser</h2>

	{#each formState.clauses as c, i (i)}
		<div class="relative rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
			{#if i !== 0}
				<DeleteButton onclick={() => removeClause(i)} aria-label="Ta bort att-sats" />
			{/if}

			<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
				<ResizingTextInput
					name={`clauses[${i}].toClause`}
					bind:value={c.toClause}
					placeholder={clausePlaceHolder}
					label="Att-sats"
					class="w-full"
				/>
				<ResizingTextInput
					name={`clauses[${i}].description`}
					bind:value={c.description}
					placeholder={descriptionPlaceHolder}
					label="Beskrivning (frivillig)"
					class="w-full"
				/>
			</div>
		</div>
	{/each}

	<div class="flex justify-end">
		<AddButton
			onclick={addClause}
			buttonText="➕ Lägg till att-sats"
			aria-label="Lägg till att-sats"
		/>
	</div>
</div>
