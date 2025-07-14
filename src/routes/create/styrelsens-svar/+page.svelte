<script lang="ts">
	import AuthorBlock from '$lib/components/AuthorBlock.svelte';
	import ClauseBlock from '$lib/components/ClauseBlock.svelte';
	import DocumentClassInput from '$lib/components/DocumentClassInput.svelte';
	import ResizingTextInput from '$lib/components/ResizingTextInput.svelte';
	import { getFormContext } from '$lib/state/formState.svelte';

	let formState = getFormContext();
	formState.documentClass = 'styrelsens-svar';
</script>

<DocumentClassInput bind:documentClass={formState.documentClass} />

<ResizingTextInput
	required={true}
	name="title"
	label="Titeln på motionen som ska besvaras"
	placeholder="Sjung mer!"
	bind:value={formState.title}
/>

<ResizingTextInput
	name="meeting"
	label="Möte"
	required={true}
	placeholder="Ex. HTM-val, S02, VTM1"
	bind:value={formState.meeting}
/>

<ResizingTextInput
	name="body"
	label="Brödtext"
	numRows={8}
	placeholder="Styrelsen tycker också att det sjungs alldeles för lite på sektionen. Därför vill styrelsen att sektionen ska..."
	bind:value={formState.body}
/>

<ResizingTextInput
	name="demand"
	label="Krav"
	placeholder="Undertecknad yrkar att mötet må besluta"
	explanation="Kan utelämnas om det framgår i brödtexten"
	bind:value={formState.demand}
/>

<ClauseBlock />

<AuthorBlock />
