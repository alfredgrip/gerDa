<script lang="ts">
	import { writable, type Writable } from 'svelte/store';

	let authors: Writable<
		Array<{
			name: string;
			position?: string;
			uuid: string;
		}>
	> = writable([{ name: '', position: '', uuid: Math.random().toString() }]);

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
		<h1>Valberedningsförslag</h1>
		<input type="hidden" name="documentType" value="electionCommitteeProposal" />
		<div id="title-meeting">
			<label>
				Titel
				<input name="title" required />
			</label>
			<label>
				Möte
				<input name="meeting" required />
			</label>
		</div>
		<label>
			Brödtext
			<textarea name="body" cols="60" />
		</label>
		<label>
			Signaturmeddelande
			<input name="signMessage" placeholder="För D-sektionen, dag som ovan" />
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

	#title-meeting {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
	}
</style>
