<script lang="ts">
	import ResizingTextInput from '$lib/components/ResizingTextInput.svelte';
	import { getFormContext } from '$lib/state/formState.svelte';

	let formState = getFormContext();
	const year = new Date().getFullYear();

	// TODO!
</script>

<!-- <ResizingTextInput
	required={true}
	name="position"
	label="Post"
	placeholder="Ex. Ordförande"
	bind:value={formState.title}
/>

<ResizingTextInput
	name="year"
	label="År"
	placeholder="Ex. {year} eller {year + 1}"
	bind:value={formState.year}
/>

<ResizingTextInput
	name="description"
	label="Beskrivning"
	explanation="Behöver ej fyllas i, men kan för de sökandes skull vara bra att veta vad posten innebär"
	placeholder="Posten som Ordförande innebär att..."
	numRows={4}
	bind:value={formState.body}
/>

<ResizingTextInput
	name="requirements-singlerow"
	label="Krav"
	required={true}
	explanation="Olika krav separeras med radbrytning"
	placeholder="Ledarskapsförmåga..."
	bind:value={formState.requirements}
/>

<ResizingTextInput
	name="merits-singlerow"
	label="Meriterande"
	explanation="Olika meriter separeras med radbrytning"
	placeholder="Tidigare erfarenhet av..."
	bind:value={formState.merits}
/> -->
