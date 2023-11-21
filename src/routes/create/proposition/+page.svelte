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
	labelName="Titel"
	placeholder="Titeln på propositionen"
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
	placeholder="Styrelsen tycker att det sjungs alldeles för lite på sektionen. Därför vill vi att sektionen ska..."
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
