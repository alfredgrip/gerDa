<script lang="ts">
	import DocumentTypeInput from '$lib/components/documentTypeInput.svelte';
	import ResizingTextInput from '$lib/components/resizingTextInput.svelte';
	const year = new Date().getFullYear();
</script>

<textarea hidden name="title" value="Kravprofil" />

<DocumentTypeInput documentType="requirementProfile" />

<ResizingTextInput
	required="true"
	idName="position"
	labelName="Post"
	placeholder="Ex. Ordförande"
/>

<ResizingTextInput idName="year" labelName="År" placeholder="Ex. {year} eller {year + 1}" />

<ResizingTextInput
	idName="description"
	labelName="Beskrivning"
	explaination="Behöver ej fyllas i, men kan för de sökandes skull vara bra att veta vad posten innebär"
	placeholder="Posten som Ordförande innebär att..."
/>

<ResizingTextInput
	idName="requirements-singlerow"
	labelName="Krav"
	required="true"
	explaination="Olika krav separeras med radbrytning"
	placeholder="Ledarskapsförmåga..."
/>

<ResizingTextInput
	idName="merits-singlerow"
	labelName="Meriterande"
	explaination="Olika meriter separeras med radbrytning"
	placeholder="Tidigare erfarenhet av..."
/>
