<script lang="ts">
	import { getAuthorContext } from '$lib/state/authorState.svelte';

	interface Props {
		id: number;
	}
	let { id }: Props = $props();

	let fileInput: HTMLInputElement;

	let authorState = getAuthorContext();

	let file: File | null = $derived(authorState.authors.at(id)?.signImage || null);
</script>

<div>
	<label for="file">Bild på signatur</label>
	<span><small>Behövs inte, men ser stiligt ut</small></span>
	<input
		type="file"
		id={`author_${id}_signImage`}
		name={`author_${id}_signImage`}
		accept=".jpg, .jpeg, .png"
		bind:this={fileInput}
		bind:value={file}
	/>

	{#if file}
		<button
			type="button"
			onclick={() => {
				fileInput.value = '';
				file = null;
				authorState.authors[id].signImage = null;
			}}
		>
			Ta bort bild
		</button>
	{/if}
</div>
