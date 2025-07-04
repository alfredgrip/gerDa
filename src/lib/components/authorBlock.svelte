<script lang="ts">
	import ResizingTextInput from '$lib/components/ResizingTextInput.svelte';
	import SignImageUpload from '$lib/components/SignImageUpload.svelte';
	import { getAuthorContext } from '$lib/state/authorState.svelte';

	let authorContext = getAuthorContext();
</script>

<div>
	<label>
		{#each authorContext.authors as a, i}
			<div>
				<div>
					<div>
						<div>
							<ResizingTextInput
								name={`author_${i.toString()}_signMessage`}
								bind:value={a.signMessage}
								placeholder={'Lund, dag som ovan'}
								label="Signaturmeddelande"
								required
							/>
							<SignImageUpload id={i} />
						</div>
						<ResizingTextInput
							name={`author_${i.toString()}_name`}
							bind:value={a.name}
							placeholder="Råsa Pantern"
							label="Namn"
							required
						/>
						<ResizingTextInput
							name={`author_${i.toString()}_position`}
							bind:value={a.position}
							placeholder="Ordförande"
							label="Post"
							explanation="Kan utelämnas eller helt enkelt vara 'Sektionsmedlem'"
						/>
					</div>
				</div>
				{#if i !== 0}
					<button
						type="button"
						onclick={() => authorContext.removeAuthor(i)}
						class="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
					>
						Ta bort författare {(i + 1).toString()}
					</button>
				{/if}
			</div>
		{/each}
		<button
			type="button"
			onclick={() => authorContext.addAuthor()}
			class="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
		>
			Lägg till författare
		</button>
	</label>
</div>
