<script lang="ts">
	export let i: number;

	let file: File | null = null;
	let input: HTMLInputElement;
</script>

<label for="file">Bild på signatur</label>
<span><small>Behövs inte, men ser stiligt ut</small></span>
<div>
	<input
		type="file"
		id={`author-${i.toString()}-signimage`}
		name={`author-${i.toString()}-signimage`}
		accept=".jpg, .jpeg, .png"
		bind:this={input}
		bind:value={file}
	/>

	{#if file}
		<button
			type="button"
			on:click={() => {
				input.value = '';
				file = null;
			}}
		>
			Ta bort bild
		</button>
	{/if}
</div>

<style>
	button {
		align-self: flex-end;
		background-color: rgb(209, 84, 84);
		border-radius: 0.5rem;
		border: 1px solid rgb(209, 209, 209);
		padding: 0.25rem 0.5rem;
	}

	button:hover {
		background-color: rgb(209, 84, 84, 0.8);
	}

	label {
		margin-top: 0.5rem;
	}

	div {
		margin: 0.5rem 0;
	}
</style>
