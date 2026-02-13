<script lang="ts">
	import AuthorBlock from '$lib/components/AuthorBlock.svelte';
	import ClauseBlock from '$lib/components/ClauseBlock.svelte';
	import ProposalBlock from '$lib/components/ProposalBlock.svelte';
	import ResizingTextInput from '$lib/components/ResizingTextInput.svelte';
	import { formState } from '$lib/state/formState.svelte';
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

<ResizingTextInput
	name="groupMotivation"
	label="Gruppmotivering"
	explanation="Om valet har tagit gruppsammansättning i beaktning ska en gruppmotivering finnas"
	bind:value={formState.groupMotivation}
/>

<ResizingTextInput
	name="demand"
	label="Krav"
	placeholder="Undertecknad yrkar att mötet må besluta"
	explanation="Kanske vill du yrka på att välja in de föreslagna?"
	bind:value={formState.demand}
/>

<ClauseBlock clausePlaceHolder="välja in ovanstående till ..." descriptionPlaceHolder="" />

<AuthorBlock />
