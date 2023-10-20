<script lang="ts">
	import AddButton from '$lib/components/addButton.svelte';
	import DocumentTypeInput from '$lib/components/documentTypeInput.svelte';
	import MdLatexRadio from '$lib/components/mdLatexRadio.svelte';
	import RemoveButton from '$lib/components/removeButton.svelte';
	import ResizeableTextInput from '$lib/components/resizeableTextInput.svelte';
	import { writable, type Writable } from 'svelte/store';

	let authors: Writable<
		Array<{
			name: string;
			position?: string;
			uuid: string;
		}>
	> = writable([{ name: '', position: '', uuid: Math.random().toString() }]);

	let whatToWho: Writable<
		Array<{
			what: string;
			who: string;
			uuid: string;
		}>
	> = writable([{ what: '', who: '', uuid: Math.random().toString() }]);

	function addAuthor() {
		authors.update((authors) => [
			...authors,
			{ name: '', position: '', uuid: Math.random().toString() }
		]);
	}

	function removeAuthor(uuid: string) {
		authors.update((authors) => authors.filter((author) => author.uuid !== uuid));
	}

	function addWhatToWho() {
		whatToWho.update((whatToWho) => [
			...whatToWho,
			{ what: '', who: '', uuid: Math.random().toString() }
		]);
	}

	function removeWhatToWho(uuid: string) {
		whatToWho.update((whatToWho) => whatToWho.filter((whatToWho) => whatToWho.uuid !== uuid));
	}

	function onUnload(event: BeforeUnloadEvent) {
		const body = document.getElementById('body') as HTMLInputElement;
		if (body?.value?.length > 20) {
			event.returnValue = 'Är du säker på att du vill lämna sidan?';
		}
	}
</script>

<svelte:window
	on:beforeunload={(event) => {
		onUnload(event);
	}}
/>

<h1>Du skapar en "Valberedningsförslag"-handling</h1>
<p>(Beta-funktion)</p>
<DocumentTypeInput documentType="electionProposal" />
<MdLatexRadio />
<div id="title-meeting">
	<ResizeableTextInput
		idName="meeting"
		type="textArea"
		labelName="Möte"
		required="true"
		placeholder="Ex. HTM-val, S02, VTM1"
	/>
</div>
<ResizeableTextInput
	idName="body"
	type="textArea"
	labelName="Brödtext"
	id="body"
	numRows="4"
	placeholder="(Frivillig) Här kan du eventuellt skriva om hur valberedningen har arbetat med förslaget."
/>
<!-- svelte-ignore a11y-label-has-associated-control -->
<label>
	Förslag
	{#each $whatToWho as whatToWho, i (whatToWho.uuid)}
		<div>
			<ResizeableTextInput
				idName={`what-to-who-${i.toString()}-what`}
				type="textArea"
				labelName=""
				required="true"
				placeholder="Vilken post?"
			/>
			<ResizeableTextInput
				idName={`what-to-who-${i.toString()}-who`}
				type="textArea"
				labelName=""
				required="true"
				placeholder="Vem? (Om flera personer, skriv namnen på separata rader)"
			/>
			<ResizeableTextInput
				idName={`statistics-${i.toString()}-interval`}
				type="textArea"
				labelName=""
				required="true"
				placeholder="Hur många sökte? Ange i intervall om storlek 5 (ex. 5-10)"
			/>
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
<ResizeableTextInput
	idName="signMessage"
	labelName="Signaturmeddelande"
	placeholder="För Valberedningen"
/>
<!-- svelte-ignore a11y-label-has-associated-control -->
<label>
	Författare
	{#each $authors as author, i (author.uuid)}
		<div id="author-div">
			<ResizeableTextInput
				idName={`author-${i.toString()}-name`}
				placeholder="Namn"
				labelName=""
				required="true"
			/>
			<ResizeableTextInput
				idName={`author-${i.toString()}-position`}
				placeholder="Post (frivillig)"
				labelName=""
			/>
			{#if i !== 0}
				<RemoveButton
					uuid={author.uuid}
					removeFunction={removeAuthor}
					buttonText="Ta bort författare"
				/>
			{/if}
		</div>
	{/each}
	<AddButton buttonText="Lägg till författare" addFunction={addAuthor} />
</label>

<style>
	div {
		display: flex;
		flex-direction: column;
		margin: 0.5rem 0;
	}
</style>
