<script lang="ts">
	import { setAgendaContext } from '$lib/state/agendaState.svelte';
	import { setAuthorContext } from '$lib/state/authorState.svelte';
	import { setClauseContext } from '$lib/state/clauseState.svelte';
	import { setFormContext } from '$lib/state/formState.svelte';
	import '../app.css';

	setAuthorContext();
	setClauseContext();
	setFormContext();
	setAgendaContext();

	let { children } = $props();
</script>

<main class="bg-[rgb(255,241,241)]">
	{@render children()}
</main>
