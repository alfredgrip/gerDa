<script lang="ts">
	import ArrayTextInput from '$lib/components/ArrayTextInput.svelte';
	import ResizingTextInput from '$lib/components/ResizingTextInput.svelte';
	import { formState } from '$lib/state/formState.svelte';

	const year = new Date().getFullYear();
</script>

<input type="hidden" name="title" value={`Kravprofil ${formState.position} ${formState.year}`} />

<ResizingTextInput
	name="position"
	label="Post"
	placeholder="Ex. Ordförande"
	bind:value={formState.position}
/>

<ResizingTextInput
	name="year"
	label="År"
	placeholder="Ex. {year} eller {year + 1}"
	bind:value={formState.year}
	explanation="Året som kravprofilen gäller för"
/>

<ResizingTextInput
	name="description"
	label="Beskrivning"
	explanation="Behöver ej fyllas i, men kan för de sökandes skull vara bra att veta vad posten innebär"
	placeholder="Posten som Ordförande innebär att..."
	numRows={4}
	bind:value={formState.body}
/>

<ArrayTextInput
	name="requirements"
	label="Krav"
	explanation="Olika krav separeras med radbrytning"
	placeholder="Ledarskapsförmåga..."
	bind:value={formState.requirements}
/>

<ArrayTextInput
	name="merits"
	label="Meriterande"
	explanation="Olika meriter separeras med radbrytning"
	placeholder="Tidigare erfarenhet av..."
	bind:value={formState.merits}
/>
