<script lang="ts">
	import ResizingTextInput from '$lib/components/resizingTextInput.svelte';
	import DocumentTypeInput from '$lib/components/documentTypeInput.svelte';
	import ClauseBlock from '$lib/components/clauseBlock.svelte';
	import AuthorBlock from '$lib/components/authorBlock.svelte';
	import SaveDraft from '$lib/components/saveDraft.svelte';
	import { importDraft } from '$lib/drafts/functions';
	import type { Draft } from '$lib/drafts/types';
	import { selectedDraft } from '$lib/drafts/store';

	let currentDraft: Draft = importDraft('motion', $selectedDraft);
</script>

<DocumentTypeInput documentType="motion" />

<ResizingTextInput
	required="true"
	idName="title"
	labelName="Titel"
	placeholder="Titeln på motionen"
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
	placeholder="Jag tycker att det sjungs alldeles för lite på sektionen. Därför vill jag att sektionen ska..."
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

<SaveDraft draftType="motion" bind:currentDraft />
