<script lang="ts">
	import ResizingTextInput from '$lib/components/resizingTextInput.svelte';
	import DocumentTypeInput from '$lib/components/documentTypeInput.svelte';
	import AuthorBlock from '$lib/components/authorBlock.svelte';
	import SaveDraft from '$lib/components/saveDraft.svelte';
	import { importDraft } from '$lib/drafts/functions';
	import type { Draft } from '$lib/drafts/types';
	import { selectedDraft } from '$lib/drafts/store';

	let currentDraft: Draft = importDraft('custom', $selectedDraft);
</script>

<DocumentTypeInput documentType="custom" />

<ResizingTextInput
	required="true"
	idName="title"
	labelName="Titel"
	placeholder="Titeln på dokumentet"
	bind:value={currentDraft.title}
/>

<ResizingTextInput
	idName="shortTitle"
	labelName="Kort titel"
	required="false"
	placeholder="Handling, Motion..."
	bind:value={currentDraft.shortTitle}
/>

<ResizingTextInput
	idName="meeting"
	labelName="Möte"
	required="false"
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
	idName="signMessage"
	labelName="Signaturmeddelande"
	placeholder="För D-sektionen, dag som ovan"
	bind:value={currentDraft.signMessage}
/>

<AuthorBlock bind:authors={currentDraft.authors} />

<SaveDraft draftType="custom" bind:currentDraft />
