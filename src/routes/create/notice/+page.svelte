<script lang="ts">
	import ResizingTextInput from '$lib/components/resizingTextInput.svelte';
	import DocumentTypeInput from '$lib/components/documentTypeInput.svelte';
	import ClauseBlock from '$lib/components/clauseBlock.svelte';
	import AuthorBlock from '$lib/components/authorBlock.svelte';
	import SaveDraft from '$lib/components/saveDraft.svelte';
	import { importDraft } from '$lib/drafts/functions';
	import type { Draft } from '$lib/drafts/types';
	import { selectedDraft } from '$lib/drafts/store';
	import { onMount } from 'svelte';
	import RemoveButton from '$lib/components/removeButton.svelte';
	import AddButton from '$lib/components/addButton.svelte';

	let currentDraft: Draft = importDraft('notice', $selectedDraft);
	let adjourn = false;
	let includeAgenda = false;

	interface AgendaItem {
		uuid: string;
		title: string;
		type?: string;
		attachments?: string;
	}

	let agendaItems: AgendaItem[] = [
		{
			uuid: Math.random().toString(),
			title: '',
			type: '',
			attachments: ''
		}
	];

	function addAgendaItem() {
		agendaItems = [
			...agendaItems,
			{
				uuid: Math.random().toString(),
				title: '',
				type: '',
				attachments: ''
			}
		];
	}

	function removeAgendaItem(uuid: string) {
		agendaItems = agendaItems.filter((item) => item.uuid !== uuid);
	}
</script>

<DocumentTypeInput documentType="notice" />

<ResizingTextInput
	required="true"
	idName="meeting"
	labelName="Möte"
	placeholder="Ex. S02, HTM-val, VTM1, SRD13"
	bind:value={currentDraft.title}
/>

<div>
	<input
		type="radio"
		id="board"
		name="meetingType"
		value="styrelsemöte"
		bind:group={currentDraft.meetingType}
	/>
	<label for="board">Styrelsemöte</label>
	<input
		type="radio"
		id="guild"
		name="meetingType"
		value="sektionsmöte"
		bind:group={currentDraft.meetingType}
	/>
	<label for="guild">Sektionsmöte</label>
	<input
		type="radio"
		id="srd"
		name="meetingType"
		value="studierådsmöte"
		bind:group={currentDraft.meetingType}
	/>
	<label for="srd">Studierådsmöte</label>
</div>

<div class="date-place-time">
	<div class="date-and-time">
		<label for="date">Datum && Tid</label>
		<input
			type="datetime-local"
			id="meetingDate"
			name="meetingDate"
			bind:value={currentDraft.meetingDate}
			style="width: 12rem; border: 1px solid rgb(209, 209, 209); border-radius: 0.5rem; padding: 0.5rem;"
			required
		/>
	</div>
	<ResizingTextInput
		idName="meetingPlace"
		labelName="Plats"
		placeholder="Ex. E:1124, E:A"
		bind:value={currentDraft.meetingPlace}
		required="true"
	/>
</div>

<div>
	<input type="checkbox" id="adjourn" name="adjourn" bind:checked={adjourn} />
	<label for="adjourn">Ajournering?</label>
	{#if adjourn}
		<div style="display: flex; justify-content: flex-start; gap: 1rem;">
			<div style="display: flex; flex-direction: column;">
				<label for="date">Datum && Tid</label>
				<input
					type="datetime-local"
					id="adjournmentDate"
					name="adjournmentDate"
					bind:value={currentDraft.adjournmentDate}
					style="width: 12rem; border: 1px solid rgb(209, 209, 209); border-radius: 0.5rem; padding: 0.5rem;"
					required
				/>
			</div>
			<ResizingTextInput
				idName="adjournmentPlace"
				labelName="Plats"
				placeholder="Ex. E:1124, E:A"
				bind:value={currentDraft.adjournmentPlace}
				required="true"
			/>
		</div>
	{/if}
</div>

<ResizingTextInput
	idName="body"
	labelName="Brödtext"
	numRows="2"
	explaination="Brödtexten kan beskriva bakgrunden till mötet, men brukar ofta utelämnas"
	bind:value={currentDraft.body}
/>

<div>
	<input type="checkbox" id="includeAgenda" name="includeAgenda" bind:checked={includeAgenda} />
	<label for="includeAgenda">Inkludera föredragningslista?</label>
	<small
		><p>
			Föredragningslista ska finnas med vid kallelse av styrelsemöte, men inte sektionsmöte
		</p></small
	>
	{#if includeAgenda}
		<div>
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label>
				Punkter på föredragningslistan
				<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
					<p>Ärende</p>
					<p>Åtgärd</p>
					<p>Bilagor <small>(semikolon-separerad lista)</small></p>
				</div>
				{#each agendaItems as agendaItem, i}
					<div class="agenda-div">
						<div class="inner-agenda-div">
							<ResizingTextInput
								idName={`agenda-item-${i.toString()}-title`}
								bind:value={agendaItem.title}
								required="true"
								labelName=""
								placeholder="OFMÖ"
							/>
							<ResizingTextInput
								idName={`agenda-item-${i.toString()}-type`}
								bind:value={agendaItem.type}
								labelName=""
								placeholder="Beslut, diskussion, information"
							/>
							<ResizingTextInput
								idName={`agenda-item-${i.toString()}-attachments`}
								bind:value={agendaItem.attachments}
								labelName=""
								placeholder="minio.api.dsek.se/..."
							/>
						</div>
						{#if i !== 0}
							<RemoveButton
								buttonText={`Ta bort punkt ${(i + 1).toString()}`}
								uuid={agendaItem.uuid}
								removeFunction={removeAgendaItem}
							/>
						{/if}
					</div>
				{/each}
				<AddButton buttonText="Lägg till punkt" addFunction={addAgendaItem} />
			</label>
		</div>
	{/if}
</div>

<AuthorBlock bind:authors={currentDraft.authors} signmessage="Lund, dag som ovan" />

<SaveDraft draftType="notice" bind:currentDraft />

<style>
	.agenda-div {
		display: flex;
		flex-direction: column;
		margin: 0.5rem 0;
	}

	.inner-agenda-div {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
	}

	.date-and-time {
		display: flex;
		flex-direction: column;
	}

	.date-place-time {
		display: flex;
		gap: 1rem;
	}

	@media only screen and (max-width: 600px) {
		.inner-agenda-div {
			grid-template-columns: 1fr;
		}

		.agenda-div {
			margin: 0;
		}

		.date-and-time {
			flex-direction: column;
		}

		.date-place-time {
			flex-direction: column;
		}
	}
</style>
