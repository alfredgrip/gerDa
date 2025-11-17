<script lang="ts">
	import AuthorBlock from '$lib/components/AuthorBlock.svelte';
	import ResizingTextInput from '$lib/components/ResizingTextInput.svelte';
	import { getAgendaContext } from '$lib/state/agendaState.svelte';
	import { getFormContext } from '$lib/state/formState.svelte';
	import { SvelteDate } from 'svelte/reactivity';

	let formState = getFormContext();
	formState.documentClass = 'kallelse';

	let adjourn = $state(false);
	let includeAgenda = $state(false);

	let agendaState = getAgendaContext();
	// let agendaItems = $state(agendaState.items);

	// TODO
	let today: SvelteDate = new SvelteDate(SvelteDate.now());
</script>

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
			<label for={option.id} class="text-sm font-medium text-gray-700">{option.label}</label>
		</div>
	{/each}
</div>

<div class="flex flex-row gap-2">
	<label for="meetingDate" class="text-sm font-medium text-gray-700">Datum && Tid</label>
	<input
		type="datetime-local"
		id="meetingDate"
		name="meetingDate"
		bind:value={formState.meetingDate}
		class="text-sm font-medium text-gray-700"
	/>
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
		class="text-sm font-medium text-gray-700"
		bind:checked={adjourn}
	/>
	<label for="adjourn" class="text-sm font-medium text-gray-700">Ajournering?</label>
	{#if adjourn}
		<div class="flex justify-start gap-2">
			<div class="flex flex-col">
				<label for="adjournmentDate" class="text-sm font-medium text-gray-700">Datum && Tid</label>
				<input
					type="datetime-local"
					id="adjournmentDate"
					name="adjournmentDate"
					bind:value={formState.adjournmentDate}
					class="w-48 rounded-lg border border-gray-300 p-2"
				/>
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
	<input type="checkbox" id="includeAgenda" name="includeAgenda" bind:checked={includeAgenda} />
	<label for="includeAgenda" class="text-sm font-medium text-gray-700"
		>Inkludera föredragningslista?</label
	>
	<p class="text-xs font-medium text-gray-500">
		Föredragningslista ska finnas med vid kallelse av styrelsemöte, men inte sektionsmöte
	</p>
	{#if includeAgenda}
		<div class="space-y-4">
			<h2 class="text-lg font-semibold text-gray-800">Föredragningslista</h2>
			{#each agendaState.items as agendaItem, i (i)}
				<div class="relative space-y-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
					<!-- Remove button (X) -->
					{#if i !== 0}
						<button
							type="button"
							onclick={() => agendaState.removeItem(i)}
							class="absolute top-2 right-3 text-gray-400 hover:text-red-600"
							aria-label="Ta bort punkt"
						>
							✕
						</button>
					{/if}
					<div class="grid grid-cols-1 gap-3 md:grid-cols-3">
						<ResizingTextInput
							name={`agendaItem_${i}_title`}
							bind:value={agendaItem.title}
							label="Ärende"
							placeholder="OFMÖ"
							class="w-full"
						/>
						<ResizingTextInput
							name={`agendaItem_${i}_type`}
							bind:value={agendaItem.type}
							label="Åtgärd"
							placeholder="Beslut, diskussion, information"
							class="w-full"
						/>
						<ResizingTextInput
							name={`agendaItem_${i}_attachments`}
							bind:value={agendaItem.attachments}
							label="Bilagor (semikolon-separerat)"
							placeholder="minio.api.dsek.se/..."
							class="w-full"
						/>
					</div>
				</div>
			{/each}
			<div class="flex justify-end">
				<button
					type="button"
					onclick={() => agendaState.addItem()}
					class="inline-flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white shadow hover:bg-green-700"
				>
					➕ Lägg till punkt
				</button>
			</div>
		</div>
	{/if}
</div>

<AuthorBlock />
