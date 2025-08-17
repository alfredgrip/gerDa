<script lang="ts">
	import { setAgendaContext } from '$lib/state/agendaState.svelte';
	import { setAuthorContext } from '$lib/state/authorState.svelte';
	import { setClauseContext } from '$lib/state/clauseState.svelte';
	import { setFormContext } from '$lib/state/formState.svelte';
	import { getLocalStorageDrafts } from '$lib/state/localDraftsState.svelte';
	import '../app.css';

	let localDrafts = getLocalStorageDrafts();
	let currentDraftId = $state(localDrafts.currentDraftId);
	setAuthorContext();
	setClauseContext();
	setFormContext();
	setAgendaContext();

	let { children } = $props();
</script>

<main style="background-color: #F280A1;">
	{@render children()}
</main>
