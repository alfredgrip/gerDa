<script lang="ts">
	import DocumentTypeInput from '$lib/components/documentTypeInput.svelte';
	import ResizingTextInput from '$lib/components/resizingTextInput.svelte';
	import SaveDraft from '$lib/components/saveDraft.svelte';
	import { importDraft } from '$lib/drafts/functions';
	import { selectedDraft } from '$lib/drafts/store';
	import type { Draft } from '$lib/drafts/types';

	let currentDraft: Draft = importDraft('requirement-profile', $selectedDraft);
	const year = new Date().getFullYear();
</script>

<textarea hidden name="title" value="Kravprofil" />

<DocumentTypeInput documentType="requirementProfile" />

<ResizingTextInput
	required="true"
	idName="position"
	labelName="Post"
	placeholder="Ex. Ordförande"
	bind:value={currentDraft.title}
/>

<ResizingTextInput
	idName="year"
	labelName="År"
	placeholder="Ex. {year} eller {year + 1}"
	bind:value={currentDraft.year}
/>

<ResizingTextInput
	idName="description"
	labelName="Beskrivning"
	explaination="Behöver ej fyllas i, men kan för de sökandes skull vara bra att veta vad posten innebär"
	placeholder="Posten som Ordförande innebär att..."
	bind:value={currentDraft.body}
/>

<ResizingTextInput
	idName="requirements-singlerow"
	labelName="Krav"
	required="true"
	explaination="Olika krav separeras med radbrytning"
	placeholder="Ledarskapsförmåga..."
	bind:value={currentDraft.requirements}
/>

<ResizingTextInput
	idName="merits-singlerow"
	labelName="Meriterande"
	explaination="Olika meriter separeras med radbrytning"
	placeholder="Tidigare erfarenhet av..."
	bind:value={currentDraft.merits}
/>

<SaveDraft draftType="requirement-profile" bind:currentDraft />
