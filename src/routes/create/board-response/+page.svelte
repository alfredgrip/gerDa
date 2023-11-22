<script lang="ts">
	import ResizingTextInput from '$lib/components/resizingTextInput.svelte';
	import DocumentTypeInput from '$lib/components/documentTypeInput.svelte';
	import ClauseBlock from '$lib/components/clauseBlock.svelte';
	import AuthorBlock from '$lib/components/authorBlock.svelte';
</script>

<DocumentTypeInput documentType="board-response" />

<ResizingTextInput
	required="true"
	idName="title"
	labelName="Titeln på motionen som ska besvaras"
	placeholder="Sjung mer!"
/>

<ResizingTextInput
	idName="meeting"
	labelName="Möte"
	required="true"
	placeholder="Ex. HTM-val, S02, VTM1"
/>

<ResizingTextInput
	idName="body"
	labelName="Brödtext"
	numRows="8"
	placeholder="Styrelsen tycker också att det sjungs alldeles för lite på sektionen. Därför vill styrelsen att sektionen ska..."
/>

<ResizingTextInput
	idName="demand"
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
