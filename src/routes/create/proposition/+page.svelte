<script lang="ts">
	import AuthorBlock from '$lib/components/authorBlock.svelte';
	import ClauseBlock from '$lib/components/clauseBlock.svelte';
	import DocumentTypeInput from '$lib/components/documentTypeInput.svelte';
	import ResizingTextInput from '$lib/components/resizingTextInput.svelte';
</script>

<DocumentTypeInput documentType="proposition" />

<ResizingTextInput
	required="true"
	idName="title"
	type="textArea"
	labelName="Titel"
	placeholder="Titeln på propositionen"
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
	placeholder="Styrelsen tycker att det sjungs alldeles för lite på sektionen. Därför vill vi att sektionen ska..."
/>

<ResizingTextInput
	idName="demand"
	type="textArea"
	labelName="Krav"
	placeholder="Undertecknad yrkar att mötet må besluta"
/>

<ClauseBlock />

<ResizingTextInput
	idName="signMessage"
	labelName="Signaturmeddelande"
	placeholder="För D-sektionen, dag som ovan"
/>

<AuthorBlock />
