<script lang="ts">
	import AuthorBlock from '$lib/components/AuthorBlock.svelte';
	import DocumentClassInput from '$lib/components/DocumentClassInput.svelte';
	import ResizingTextInput from '$lib/components/ResizingTextInput.svelte';
	import { getFormContext } from '$lib/state/formState.svelte';

	let formState = getFormContext();
	formState.documentClass = 'custom';
</script>

<DocumentClassInput documentClass={formState.documentClass} />

<ResizingTextInput
	name="title"
	label="Titel"
	placeholder="Titeln på dokumentet"
	bind:value={formState.title}
/>

<ResizingTextInput
	name="shortTitle"
	label="Kort titel"
	placeholder="Ex. Bilaga, Dokument"
	bind:value={formState.shortTitle}
/>

<ResizingTextInput
	name="meeting"
	label="Möte"
	placeholder="Ex. HTM-val, S02, VTM1"
	bind:value={formState.meeting}
/>

<ResizingTextInput
	name="body"
	label="Brödtext"
	numRows={8}
	placeholder="Beskrivning av dokumentet"
	bind:value={formState.body}
/>

<AuthorBlock />
