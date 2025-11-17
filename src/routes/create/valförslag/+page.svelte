<script lang="ts">
	import AuthorBlock from '$lib/components/AuthorBlock.svelte';
	import ProposalBlock from '$lib/components/ProposalBlock.svelte';
	import ResizingTextInput from '$lib/components/ResizingTextInput.svelte';
	import { getFormContext } from '$lib/state/formState.svelte';

	let formState = getFormContext();
	formState.documentClass = 'valförslag';
</script>

<ResizingTextInput
	name="title"
	label="Titel"
	placeholder="Ex. 'Valberedningens förslag inför HTM-val' eller 'Pepparvalberedningens förslag till Peppare'"
	bind:value={formState.title}
/>

<ResizingTextInput
	name="meeting"
	label="Möte"
	placeholder="Ex. S12, HTM-val"
	bind:value={formState.meeting}
/>

<ResizingTextInput
	name="body"
	label="Bakgrund (frivillig)"
	placeholder="Sexetvalberedningen har hållit i intervjuer och föreslår följande..."
	bind:value={formState.body}
/>

<ProposalBlock />

<AuthorBlock />
