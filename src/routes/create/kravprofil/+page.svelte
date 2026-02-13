<script lang="ts">
	import ResizingTextInput from '$lib/components/ResizingTextInput.svelte';
	import { formState } from '$lib/state/formState.svelte';

	const year = new Date().getFullYear();

	let rawRequirements = $state('');
	let rawMerits = $state('');
	let parsedRequirements = $derived.by(() =>
		JSON.stringify(
			rawRequirements
				.split('\n')
				.map((req) => req.trim())
				.filter(Boolean)
		)
	);
	let parsedMerits = $derived.by(() =>
		JSON.stringify(
			rawMerits
				.split('\n')
				.map((merit) => merit.trim())
				.filter(Boolean)
		)
	);
</script>

<ResizingTextInput
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

<ResizingTextInput
	name="requirementsRaw"
	label="Krav"
	explanation="Olika krav separeras med radbrytning"
	placeholder="Ledarskapsförmåga..."
	bind:value={rawRequirements}
/>
<input type="hidden" bind:value={parsedRequirements} name="requirements" />

<ResizingTextInput
	name="meritsRaw"
	label="Meriterande"
	explanation="Olika meriter separeras med radbrytning"
	placeholder="Tidigare erfarenhet av..."
	bind:value={rawMerits}
/>
<input type="hidden" bind:value={parsedMerits} name="merits" />
