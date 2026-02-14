<script lang="ts">
	import AddButton from '$lib/components/AddButton.svelte';
	import ArrayTextInput from '$lib/components/ArrayTextInput.svelte';
	import AuthorBlock from '$lib/components/AuthorBlock.svelte';
	import DeleteButton from '$lib/components/DeleteButton.svelte';
	import ResizingTextInput from '$lib/components/ResizingTextInput.svelte';
	import { formState } from '$lib/state/formState.svelte';

	let adjourn = $state(false);
	let includeAgenda = $state(false);

	function addAgendaItem() {
		formState.agenda.push({ title: '', type: '', attachments: [] });
	}
	function removeAgendaItem(idx: number) {
		formState.agenda = formState.agenda.filter((_, i) => idx != i);
	}
	$effect(() => {
		if (includeAgenda && formState.agenda.length === 0) {
			addAgendaItem();
		}
	});
</script>

<input type="hidden" name="title" value={`Kallelse till ${formState.meetingType || 'möte'}`} />

<ResizingTextInput
	name="meeting"
	label="Möte"
	placeholder="Ex. S02, HTM-val, VTM1, SRD13"
	bind:value={formState.title}
/>

<div class="flex w-full max-w-lg flex-wrap gap-4">
	{#each [{ id: 'board', value: 'styrelsemöte', label: 'Styrelsemöte' }, { id: 'guild', value: 'sektionsmöte', label: 'Sektionsmöte' }, { id: 'srd', value: 'studierådsmöte', label: 'Studierådsmöte' }] as option}
		<div class="flex items-center gap-1">
			<input
				type="radio"
				id={option.id}
				name="meetingType"
				value={option.value}
				bind:group={formState.meetingType}
				class="accent-pink-400"
			/>
			<label for={option.id} class="text-sm font-medium">{option.label}</label>
		</div>
	{/each}
</div>

<div>
	<label for="meetingDate" class="text-sm font-medium">Datum && Tid</label>
	<div
		class="flex w-fit flex-row gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm"
	>
		<input
			type="datetime-local"
			id="meetingDate"
			name="meetingDate"
			bind:value={formState.meetingDate}
			class="text-sm font-medium"
		/>
	</div>
</div>
<ResizingTextInput
	name="meetingPlace"
	label="Plats"
	placeholder="Ex. E:1124, E:A"
	bind:value={formState.meetingPlace}
/>

<div>
	<input
		type="checkbox"
		id="adjourn"
		name="adjourn"
		class="accent-dsek text-sm font-medium"
		bind:checked={adjourn}
	/>
	<label for="adjourn" class="text-sm font-medium">Ajournering?</label>
	{#if adjourn}
		<div class="flex w-fit justify-start gap-2">
			<div class="flex flex-col">
				<label for="adjournmentDate" class="text-sm font-medium">Datum && Tid</label>
				<div
					class="flex w-fit flex-row gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm"
				>
					<input
						type="datetime-local"
						id="adjournmentDate"
						name="adjournmentDate"
						bind:value={formState.adjournmentDate}
						class="text-sm font-medium"
					/>
				</div>
			</div>
			<ResizingTextInput
				name="adjournmentPlace"
				label="Plats"
				placeholder="Ex. E:1124, E:A"
				bind:value={formState.adjournmentPlace}
			/>
		</div>
	{/if}
</div>

<ResizingTextInput
	name="body"
	label="Brödtext"
	numRows={2}
	explanation="Brödtexten kan beskriva bakgrunden till mötet, men brukar ofta utelämnas"
	bind:value={formState.body}
/>

<div>
	<input
		type="checkbox"
		id="includeAgenda"
		name="includeAgenda"
		class="accent-dsek text-sm font-medium"
		bind:checked={includeAgenda}
	/>
	<label for="includeAgenda" class="text-sm font-medium">Inkludera föredragningslista?</label>
	<p class="text-xs font-medium text-gray-500">
		Föredragningslista ska finnas med vid kallelse av styrelsemöte men inte sektionsmöte
	</p>
	{#if includeAgenda}
		<div class="space-y-4">
			<h2 class="text-sm font-medium">Föredragningslista</h2>
			{#each formState.agenda as agendaItem, i (i)}
				<div class="relative space-y-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
					{#if i !== 0}
						<DeleteButton onclick={() => removeAgendaItem(i)} aria-label="Ta bort punkt" />
					{/if}
					<div class="grid grid-cols-1 gap-3 md:grid-cols-3">
						<ResizingTextInput
							name={`agenda[${i}].title`}
							bind:value={agendaItem.title}
							label="Ärende"
							placeholder="OFMÖ"
							class="w-full"
						/>
						<ResizingTextInput
							name={`agenda[${i}].type`}
							bind:value={agendaItem.type}
							label="Åtgärd"
							placeholder="Beslut, diskussion, information"
							class="w-full"
						/>
						<ArrayTextInput
							name={`agenda[${i}].attachments`}
							bind:value={agendaItem.attachments}
							label="Bilagor (semikolon-separerat)"
							placeholder="länk1.pdf; länk2.pdf"
							separator=";"
							explanation="Separera länkar med semikolon"
						/>
					</div>
				</div>
			{/each}
			<div class="flex justify-end">
				<AddButton
					onclick={addAgendaItem}
					buttonText="➕ Lägg till punkt"
					aria-label="Lägg till punkt"
				/>
			</div>
		</div>
	{/if}
</div>

<AuthorBlock />
