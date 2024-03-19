<script lang="ts">
	import AuthorBlock from '$lib/components/authorBlock.svelte';
	import ClauseBlock from '$lib/components/clauseBlock.svelte';
	import DocumentTypeInput from '$lib/components/documentTypeInput.svelte';
	import ResizingTextInput from '$lib/components/resizingTextInput.svelte';
	import SaveDraft from '$lib/components/saveDraft.svelte';

	import { importDraft } from '$lib/drafts/functions';
	import { selectedDraft } from '$lib/drafts/store';
	import type { Draft } from '$lib/drafts/types';

	console.log($selectedDraft);

	let currentDraft: Draft = importDraft('proposition', $selectedDraft);
</script>

<DocumentTypeInput documentType="proposition" />

<ResizingTextInput
	required="true"
	idName="title"
	labelName="Titel"
	placeholder="Titeln på propositionen"
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
	placeholder="Styrelsen tycker att det sjungs alldeles för lite på sektionen. Därför vill vi att sektionen ska..."
	bind:value={currentDraft.body}
/>

<ResizingTextInput
	idName="demand"
	labelName="Krav"
	placeholder="Undertecknad yrkar att mötet må besluta"
	explaination="Kan utelämnas om det framgår i brödtexten"
	bind:value={currentDraft.demand}
/>

<ClauseBlock bind:clauses={currentDraft.clauses} />

<AuthorBlock bind:authors={currentDraft.authors} signmessage="Lund, dag som ovan" />

<SaveDraft draftType="proposition" bind:currentDraft />
