<script lang="ts">
	import { meetingRegex } from '$lib/formRegex';
	import { writable, type Writable } from 'svelte/store';

	let clauses: Writable<
		Array<{
			name: string;
			description?: string;
			uuid: string;
		}>
	> = writable([{ name: '', description: '', uuid: Math.random().toString() }]);

	let authors: Writable<
		Array<{
			name: string;
			position?: string;
			uuid: string;
		}>
	> = writable([{ name: '', position: '', uuid: Math.random().toString() }]);

	function addClause() {
		clauses.update((clauses) => [
			...clauses,
			{ name: '', description: '', uuid: Math.random().toString() }
		]);
	}
	function removeClause(uuid: string) {
		clauses.update((clauses) => clauses.filter((clause) => clause.uuid !== uuid));
	}

	function addAuthor() {
		authors.update((authors) => [
			...authors,
			{ name: '', position: '', uuid: Math.random().toString() }
		]);
	}

	function removeAuthor(uuid: string) {
		authors.update((authors) => authors.filter((author) => author.uuid !== uuid));
	}
	function onUnload(event: BeforeUnloadEvent) {
		const body = document.getElementById('body') as HTMLInputElement;
		if (body?.value?.length > 20) {
			event.returnValue = 'Är du säker på att du vill lämna sidan?';
		}
	}
</script>

<svelte:window
	on:beforeunload={(event) => {
		onUnload(event);
	}}
/>

<section>
	<form method="POST" action="/generate" target="_blank">
		<input type="hidden" name="documentType" value="proposition" />
		<label>
			Titel
			<input name="title" required />
		</label>
		<label>
			Möte
			<input name="meeting" required />
		</label>
		<label>
			Brödtext
			<textarea name="body" cols="70" id="body" />
		</label>
		<label>
			Att-satser
			{#each $clauses as clause, i (clause.uuid)}
				<label>
					<input name={`to-clause-${i.toString()}`} placeholder="sjunga mer..." required />
				</label>
				<label>
					<input
						name={`to-clause-${i.toString()}-description`}
						placeholder="Beskrivning (frivillig)"
					/>
				</label>
				{#if i !== 0}
					<button type="button" on:click={() => removeClause(clause.uuid)}>Ta bort</button>
				{/if}
			{/each}
			<button type="button" on:click={() => addClause()}>Lägg till</button>
		</label>
		<label>
			Författare
			{#each $authors as author, i (author.uuid)}
				<label>
					<input name={`author-${i.toString()}-name`} placeholder="Namn" required />
				</label>
				<label>
					<input name={`author-${i.toString()}-position`} placeholder="Post (frivillig)" />
				</label>
				{#if i !== 0}
					<button type="button" on:click={() => removeAuthor(author.uuid)}>Ta bort</button>
				{/if}
			{/each}
			<button type="button" on:click={() => addAuthor()}>Lägg till</button>
		</label>
		<button id="generate-button">Generera!</button>
	</form>
</section>

<style>
	form {
		/* stack the elemnts in section vertically */
		display: flex;
		flex-direction: column;
		/* center the elements horizontally */
		align-items: center;
		/* center the elements vertically */
		justify-content: center;
	}
	form > * {
		margin: 0.5rem;
	}
	label {
		display: flex;
		flex-direction: column;
	}

	textarea {
		width: 100%;
		resize: vertical;
	}
</style>
