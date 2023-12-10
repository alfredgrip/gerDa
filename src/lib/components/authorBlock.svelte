<script lang="ts">
	import ResizingTextInput from '$lib/components/resizingTextInput.svelte';
	import RemoveButton from '$lib/components/removeButton.svelte';
	import AddButton from '$lib/components/addButton.svelte';
	import type { Author } from '$lib/types';
	import { uuid } from '$lib/utils';

	export let authors: Author[] = [];

	if (authors.length === 0) {
		authors = [{ name: '', position: '', uuid: uuid() }];
	}

	function addAuthor() {
		authors = [...authors, { name: '', position: '', uuid: uuid() }];
	}

	function removeAuthor(uuid: string) {
		authors = authors.filter((author) => author.uuid !== uuid);
	}
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<div class="author-wrapper">
	<label>
		Författare
		{#each authors as author, i (author.uuid)}
			<div class="author-div">
				<div class="inner-author-div">
					<ResizingTextInput
						idName={`author-${i.toString()}-name`}
						bind:value={author.name}
						placeholder="Namn"
						labelName=""
						required="true"
					/>
					<ResizingTextInput
						idName={`author-${i.toString()}-position`}
						bind:value={author.position}
						placeholder="Post (frivillig)"
						labelName=""
					/>
				</div>
				{#if i !== 0}
					<RemoveButton
						buttonText={`Ta bort författare ${(i + 1).toString()}`}
						uuid={author.uuid}
						removeFunction={removeAuthor}
					/>
				{/if}
			</div>
		{/each}
		<AddButton buttonText="Lägg till författare" addFunction={addAuthor} />
	</label>
</div>

<style>
	.author-wrapper {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.author-div {
		display: flex;
		flex-direction: column;
		margin: 0.5rem 0;
	}

	.inner-author-div {
		display: flex;
		flex-direction: column;
		/* gap: 1rem; */
	}
</style>
