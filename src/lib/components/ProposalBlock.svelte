<script lang="ts">
	import AddButton from '$lib/components/AddButton.svelte';
	import DeleteButton from '$lib/components/DeleteButton.svelte';
	import ResizingTextInput from '$lib/components/ResizingTextInput.svelte';
	import { formState } from '$lib/state/formState.svelte';
	import ArrayTextInput from './ArrayTextInput.svelte';

	let includeStatistics = $state(false);

	$effect(() => {
		if (formState.proposals.length === 0) {
			formState.proposals.push({ position: '', who: [], statistics: '' });
		}
	});
</script>

<div class="space-y-4">
	<h2 class="text-lg font-semibold">Förslag</h2>

	<div>
		<input
			type="checkbox"
			id="includeStatistics"
			name="includeStatistics"
			class="accent-dsek text-sm font-medium"
			bind:checked={includeStatistics}
		/>
		<label for="includeStatistics" class="text-sm font-medium">Inkludera statistik</label>
	</div>

	{#each formState.proposals as p, i (i)}
		<div class="relative space-y-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
			{#if i !== 0}
				<DeleteButton
					onclick={() => formState.proposals.splice(i, 1)}
					aria-label="Ta bort förslag"
				/>
			{/if}

			<div class="grid grid-rows-1 gap-3">
				<ResizingTextInput
					name={`proposals[${i}].position`}
					bind:value={p.position}
					label="Post"
					class="w-full"
				/>
				<ArrayTextInput
					name={`proposals[${i}].who`}
					bind:value={p.who}
					placeholder={`
					Rosa Pantern
Cookie Monster`.trim()}
					label="Vem/Vilka"
					class="w-full"
					separator="\n"
					explanation="Separera med ny rad"
				/>
				{#if includeStatistics}
					<ResizingTextInput
						name={`proposals[${i}].statistics`}
						bind:value={p.statistics}
						label="Statistik (frivillig)"
						placeholder="5-10"
						class="w-full"
						explanation="Intervallet måste vara av storlek 5 där det första är 0-5. Giltiga intervall är alltså 0-5, 5-10, 10-15 osv. Detta definieras i 'Policy för val'"
					/>
				{:else}
					<input type="hidden" name={`proposals[${i}].statistics`} value="" />
				{/if}
			</div>
		</div>
	{/each}

	<div class="flex justify-end">
		<AddButton
			onclick={() => formState.proposals.push({ position: '', who: [], statistics: '' })}
			buttonText="➕ Lägg till förslag"
			aria-label="Lägg till förslag"
		/>
	</div>
</div>
