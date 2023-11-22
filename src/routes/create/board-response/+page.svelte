<script lang="ts">
	import ResizingTextInput from '$lib/components/resizingTextInput.svelte';
	import DocumentTypeInput from '$lib/components/documentTypeInput.svelte';
	import ClauseBlock from '$lib/components/clauseBlock.svelte';
	import AuthorBlock from '$lib/components/authorBlock.svelte';
	import SaveDraft from '$lib/components/saveDraft.svelte';
	import { importDraft } from '$lib/drafts/functions';
	import { selectedDraft } from '$lib/drafts/store';
	import type { Draft } from '$lib/drafts/types';

	let currentDraft: Draft = importDraft('board-response', $selectedDraft);
</script>

<DocumentTypeInput documentType="board-response" />

<ResizingTextInput
	required="true"
	idName="title"
	labelName="Titeln på motionen som ska besvaras"
	placeholder="Sjung mer!"
	bind:value={currentDraft.title}
/>

<ResizingTextInput
	idName="meeting"
	labelName="Möte"
	required="true"
	placeholder="Ex. HTM-val, S02, VTM1"
	bind:value={currentDraft.meeting}
/>

<ResizingTextInput
	idName="body"
	labelName="Brödtext"
	numRows="8"
	placeholder="Styrelsen tycker också att det sjungs alldeles för lite på sektionen. Därför vill styrelsen att sektionen ska..."
	bind:value={currentDraft.body}
/>

<ResizingTextInput
	idName="demand"
	labelName="Krav"
	placeholder="Undertecknad yrkar att mötet må besluta"
	explaination="Kan utelämnas om det framgår i brödtexten"
	bind:value={currentDraft.demand}
/>

<ClauseBlock
	bind:clauses={currentDraft.clauses}
	bind:numberedClauses={currentDraft.numberedClauses}
/>

<ResizingTextInput
	idName="signMessage"
	labelName="Signaturmeddelande"
	placeholder="För D-sektionen, dag som ovan"
	bind:value={currentDraft.signMessage}
/>

<AuthorBlock bind:authors={currentDraft.authors} />

<SaveDraft draftType="board-response" bind:currentDraft />
