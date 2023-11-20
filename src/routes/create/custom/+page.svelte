<script lang="ts">
	import ResizingTextInput from '$lib/components/resizingTextInput.svelte';
	import DocumentTypeInput from '$lib/components/documentTypeInput.svelte';
	import AuthorBlock from '$lib/components/authorBlock.svelte';
</script>

<DocumentTypeInput documentType="custom" />

<ResizingTextInput
	required="true"
	idName="title"
	type="textArea"
	labelName="Titel"
	placeholder="Titeln på dokumentet"
/>

<ResizingTextInput
	idName="shortTitle"
	type="textArea"
	labelName="Kort titel"
	required="false"
	placeholder="Handling, Motion..."
/>

<ResizingTextInput
	idName="meeting"
	type="textArea"
	labelName="Möte"
	required="false"
	placeholder="Ex. HTM-val, S02, VTM1"
/>

<ResizingTextInput
	idName="body"
	type="textArea"
	labelName="Brödtext"
	numRows="8"
	placeholder="Jag tycker att det sjungs alldeles för lite på sektionen. Därför vill jag att sektionen ska..."
/>

<ResizingTextInput
	idName="signMessage"
	labelName="Signaturmeddelande"
	placeholder="För D-sektionen, dag som ovan"
/>

<AuthorBlock />
