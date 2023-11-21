<script lang="ts">
	import AddButton from '$lib/components/addButton.svelte';
	import AuthorBlock from '$lib/components/authorBlock.svelte';
	import DocumentTypeInput from '$lib/components/documentTypeInput.svelte';
	import RemoveButton from '$lib/components/removeButton.svelte';
	import ResizingTextInput from '$lib/components/resizingTextInput.svelte';
	import { writable, type Writable } from 'svelte/store';

	let whatToWho: Writable<
		Array<{
			what: string;
			who: string;
			uuid: string;
		}>
	> = writable([{ what: '', who: '', uuid: Math.random().toString() }]);

	function addWhatToWho() {
		whatToWho.update((whatToWho) => [
			...whatToWho,
			{ what: '', who: '', uuid: Math.random().toString() }
		]);
	}

	function removeWhatToWho(uuid: string) {
		whatToWho.update((whatToWho) => whatToWho.filter((whatToWho) => whatToWho.uuid !== uuid));
	}

	let isStatistics: Writable<boolean> = writable(true);
</script>

<DocumentTypeInput documentType="electionProposal" />
<div id="title-meeting">
	<ResizingTextInput
		idName="meeting"
		labelName="Möte"
		required="true"
		placeholder="Ex. HTM-val, S02, VTM1"
	/>
</div>
<!-- <ResizingTextInput
	idName="body"
	type="textArea"
	labelName="Brödtext"
	id="body"
	numRows="4"
	placeholder="(Frivillig) Här kan du eventuellt skriva om hur valberedningen har arbetat med förslaget."
/> -->
<!-- svelte-ignore a11y-label-has-associated-control -->
<label>
	Förslag
	<div>
		<input
			style="align-self: flex-start; "
			type="checkbox"
			name="isStatistics"
			bind:checked={$isStatistics}
		/>
		<label><small>Inkludera statistik?</small></label><br /><small
			>Om valet hade en stängd nomineringslista ska statistik inkluderas, annars ej</small
		>
	</div>
	{#each $whatToWho as whatToWho, i (whatToWho.uuid)}
		<div style="margin: 0.5rem 0;">
			<ResizingTextInput
				idName={`what-to-who-${i.toString()}-what`}
				labelName=""
				required="true"
				placeholder="Vilken post?"
			/>
			<ResizingTextInput
				idName={`what-to-who-${i.toString()}-who-singlerow`}
				labelName=""
				required="true"
				placeholder="Vem? (Om flera personer, skriv namnen på separata rader)"
			/>
			{#if $isStatistics}
				<ResizingTextInput
					idName={`statistics-${i.toString()}-interval`}
					labelName=""
					required="true"
					placeholder="Hur många sökte? Ange i intervall om storlek 5 (ex. 5-10)"
				/>
			{/if}
			{#if i !== 0}
				<RemoveButton
					uuid={whatToWho.uuid}
					removeFunction={removeWhatToWho}
					buttonText="Ta bort förslag"
				/>
			{/if}
		</div>
	{/each}
	<AddButton buttonText="Lägg till förslag" addFunction={addWhatToWho} />
</label>

<ResizingTextInput
	idName="signMessage"
	labelName="Signaturmeddelande"
	placeholder="För Valberedningen"
/>

<AuthorBlock />

<style>
	/* div {
		display: flex;
		flex-direction: column;
		margin: 0.5rem 0;
	} */
</style>
