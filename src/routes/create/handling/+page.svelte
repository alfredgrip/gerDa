<script lang="ts">
	import AuthorBlock from '$lib/components/AuthorBlock.svelte';
	import ResizingTextInput from '$lib/components/ResizingTextInput.svelte';
	import { formState } from '$lib/state/formState.svelte';
</script>

<ResizingTextInput
	name="title"
	label="Titel"
	placeholder="Titeln på dokumentet"
	bind:value={formState.title}
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
