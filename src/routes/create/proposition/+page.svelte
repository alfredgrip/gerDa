<script lang="ts">
	import AuthorBlock from '$lib/components/AuthorBlock.svelte';
	import ClauseBlock from '$lib/components/ClauseBlock.svelte';
	import DocumentTypeInput from '$lib/components/DocumentTypeInput.svelte';
	import ResizingTextInput from '$lib/components/ResizingTextInput.svelte';
	import { getFormContext } from '$lib/state/formState.svelte';

	let formState = getFormContext();
</script>

<DocumentTypeInput documentType="proposition" />
<ResizingTextInput
	name="title"
	required={true}
	label="Titel"
	placeholder="Titeln på propositionen"
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
	placeholder="Styrelsen tycker att det sjungs alldeles för lite på sektionen. Därför vill styrelsen att sektionen ska..."
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
