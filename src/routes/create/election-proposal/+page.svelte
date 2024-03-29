<script lang="ts">
	import AddButton from '$lib/components/addButton.svelte';
	import AuthorBlock from '$lib/components/authorBlock.svelte';
	import DocumentTypeInput from '$lib/components/documentTypeInput.svelte';
	import RemoveButton from '$lib/components/removeButton.svelte';
	import ResizingTextInput from '$lib/components/resizingTextInput.svelte';
	import SaveDraft from '$lib/components/saveDraft.svelte';
	import { importDraft } from '$lib/drafts/functions';
	import { selectedDraft } from '$lib/drafts/store';
	import type { Draft } from '$lib/drafts/types';
	import { uuid } from '$lib/utils';

	let currentDraft: Draft = importDraft('election-proposal', $selectedDraft);

	if (currentDraft.whatToWho.length === 0) {
		addWhatToWho();
	}

	function addWhatToWho() {
		currentDraft.whatToWho = [
			...currentDraft.whatToWho,
			{ what: '', who: [], whoString: '', numberOfApplicants: '', uuid: uuid() }
		];
	}

	function removeWhatToWho(uuid: string) {
		currentDraft.whatToWho = currentDraft.whatToWho.filter((item) => item.uuid !== uuid);
	}
</script>

<DocumentTypeInput documentType="election-proposal" />

<ResizingTextInput
	explaination="Ex. ''Valberedningens förslag inför HTM-val'' eller ''Pepparvalberedningens förslag till Peppare''"
	idName="title"
	labelName="Titel"
	required="true"
	bind:value={currentDraft.title}
/>

<ResizingTextInput
	idName="meeting"
	labelName="Möte"
	required="true"
	placeholder="Ex. HTM-val, S02, VTM1"
	bind:value={currentDraft.meeting}
/>

<label>
	Förslag
	<div>
		<input
			style="align-self: flex-start; "
			type="checkbox"
			name="isStatistics"
			bind:checked={currentDraft.includeStatistics}
		/>
		<label for="isStatistics"><small>Inkludera statistik?</small></label><br /><small
			>Om valet hade en stängd nomineringslista ska statistik inkluderas, annars ej</small
		>
	</div>
	{#each currentDraft.whatToWho as item, i (item.uuid)}
		<div style="margin: 0.5rem 0;">
			<ResizingTextInput
				idName={`what-to-who-${i.toString()}-what`}
				labelName=""
				required="true"
				placeholder="Vilken post?"
				bind:value={item.what}
			/>
			<ResizingTextInput
				idName={`what-to-who-${i.toString()}-who-singlerow`}
				labelName=""
				required="true"
				placeholder="Vem? (Om flera personer, skriv namnen på separata rader)"
				bind:value={item.whoString}
			/>
			{#if currentDraft.includeStatistics}
				<ResizingTextInput
					idName={`statistics-${i.toString()}-interval`}
					labelName=""
					required="true"
					placeholder="Hur många sökte? Ange i intervall om storlek 5 (ex. 5-10)"
					bind:value={item.numberOfApplicants}
				/>
			{/if}
			{#if i !== 0}
				<RemoveButton
					uuid={item.uuid}
					removeFunction={removeWhatToWho}
					buttonText="Ta bort förslag"
				/>
			{/if}
		</div>
	{/each}
	<AddButton buttonText="Lägg till förslag" addFunction={addWhatToWho} />
</label>

<AuthorBlock bind:authors={currentDraft.authors} signmessage="För Valberedningen, dag som ovan" />

<SaveDraft draftType="election-proposal" bind:currentDraft />
