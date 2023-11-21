<script lang="ts">
	import ResizingTextInput from '$lib/components/resizingTextInput.svelte';
	import DocumentTypeInput from '$lib/components/documentTypeInput.svelte';
	import ClauseBlock from '$lib/components/clauseBlock.svelte';
	import AuthorBlock from '$lib/components/authorBlock.svelte';
</script>

<DocumentTypeInput documentType="motion" />

<ResizingTextInput
	required="true"
	idName="title"
	type="textArea"
	labelName="Titel"
	placeholder="Titeln på motionen"
/>

<ResizingTextInput
	idName="meeting"
	type="textArea"
	labelName="Möte"
	required="true"
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
	idName="demand"
	type="textArea"
	labelName="Krav"
	placeholder="Undertecknad yrkar att mötet må besluta"
	explaination="Kan utelämnas om det framgår i brödtexten"
/>

<ClauseBlock />

<ResizingTextInput
	idName="signMessage"
	labelName="Signaturmeddelande"
	placeholder="För D-sektionen, dag som ovan"
/>

<AuthorBlock />
