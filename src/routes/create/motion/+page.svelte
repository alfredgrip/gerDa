<script lang="ts">
	import GenerateButton from '$lib/components/generateButton.svelte';
	import AddButton from '$lib/components/addButton.svelte';
	import MdLatexRadio from '$lib/components/mdLatexRadio.svelte';
	import RemoveButton from '$lib/components/removeButton.svelte';
	import ResizeableTextInput from '$lib/components/resizeableTextInput.svelte';
	import { onMount } from 'svelte';
	import { writable, type Writable } from 'svelte/store';
	import DocumentTypeInput from '$lib/components/documentTypeInput.svelte';

	let clauses: Writable<
		Array<{
			name: string;
			description?: string;
			uuid: string;
		}>
	> = writable([{ name: '', description: '', uuid: Math.random().toString() }]);

	let authors: Writable<
		Array<{
			name: string;
			position?: string;
			uuid: string;
		}>
	> = writable([{ name: '', position: '', uuid: Math.random().toString() }]);

	function addClause() {
		clauses.update((clauses) => [
			...clauses,
			{ name: '', description: '', uuid: Math.random().toString() }
		]);
	}
	function removeClause(uuid: string) {
		clauses.update((clauses) => clauses.filter((clause) => clause.uuid !== uuid));
	}

	function addAuthor() {
		authors.update((authors) => [
			...authors,
			{ name: '', position: '', uuid: Math.random().toString() }
		]);
	}

	function removeAuthor(uuid: string) {
		authors.update((authors) => authors.filter((author) => author.uuid !== uuid));
	}
	function onUnload(event: BeforeUnloadEvent) {
		const body = document.getElementById('body') as HTMLInputElement;
		if (body?.value?.length > 20) {
			event.returnValue = 'Är du säker på att du vill lämna sidan?';
		}
	}
	onMount(() => {
		const form = document.querySelector('form');
		if (form == null) throw new Error('Form is null');
		form.addEventListener('keypress', function (e) {
			if (e.key === 'Enter' && !(e.target instanceof HTMLTextAreaElement)) {
				e.preventDefault();
			}
		});
	});
</script>

<svelte:window
	on:beforeunload={(event) => {
		onUnload(event);
	}}
/>
<h1>Du skapar en motion</h1>
<DocumentTypeInput documentType="motion" />
<MdLatexRadio />
<ResizeableTextInput
	required="true"
	idName="title"
	type="textArea"
	labelName="Titel"
	placeholder="Titeln på motionen"
/>

<ResizeableTextInput
	idName="meeting"
	type="textArea"
	labelName="Möte"
	required="true"
	placeholder="Ex. HTM-val, S02, VTM1"
/>
<label>
	Sen handling?
	<input name="late" type="checkbox" />
</label>
<ResizeableTextInput
	idName="body"
	type="textArea"
	labelName="Brödtext"
	id="body"
	numRows="8"
	placeholder="Jag tycker att det sjungs alldeles för lite på sektionen. Därför vill jag att sektionen ska..."
/>
<!-- svelte-ignore a11y-label-has-associated-control -->
<label>
	Att-satser
	{#each $clauses as clause, i (clause.uuid)}
		<div id="clause-div">
			<ResizeableTextInput
				idName={`to-clause-${i.toString()}`}
				type="textArea"
				labelName=""
				required="true"
				placeholder="sjunga mer..."
			/>
			<ResizeableTextInput
				idName={`to-clause-${i.toString()}-description`}
				type="textArea"
				placeholder="Beskrivning (frivillig)"
				labelName=""
			/>
			{#if i !== 0}
				<RemoveButton
					buttonText="Ta bort att-sats"
					uuid={clause.uuid}
					removeFunction={removeClause}
				/>
			{/if}
		</div>
	{/each}
	<AddButton buttonText="Lägg till att-sats" addFunction={addClause} />
</label>

<ResizeableTextInput
	idName="signMessage"
	labelName="Signaturmeddelande"
	placeholder="För D-sektionen, dag som ovan"
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
					buttonText="Ta bort författare"
					uuid={author.uuid}
					removeFunction={removeAuthor}
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
