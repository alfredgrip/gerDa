<script lang="ts">
	import AddButton from '$lib/components/AddButton.svelte';
	import DeleteButton from '$lib/components/DeleteButton.svelte';
	import ResizingTextInput from '$lib/components/ResizingTextInput.svelte';
	import SignImageUpload from '$lib/components/SignImageUpload.svelte';
	import { formState } from '$lib/state/formState.svelte';

	function removeAuthor(idx: number) {
		formState.authors = formState.authors.filter((_, i) => idx != i);
	}
	function addAuthor() {
		formState.authors.push({ name: '', position: '', signMessage: '', signImage: false });
	}
</script>

<div class="space-y-4">
	<h2 class="text-lg font-semibold">Författare</h2>

	{#each formState.authors as a, i (i)}
		<div class="relative space-y-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
			{#if i !== 0}
				<DeleteButton onclick={() => removeAuthor(i)} aria-label="Ta bort författare" />
			{/if}

			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<ResizingTextInput
					name={`authors[${i}].signMessage`}
					bind:value={a.signMessage}
					placeholder="Lund, dag som ovan"
					label="Signaturmeddelande"
					explanation="Förslagsvis ort och datum, eller något annat kul"
					class="w-full"
				/>

				<div class="flex flex-col gap-1">
					<label class="mb-0 text-sm font-medium" for={`sign-image-upload-${i}`}>Signatur</label>
					<SignImageUpload authorIdx={i} />
				</div>
			</div>

			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<ResizingTextInput
					name={`authors[${i}].name`}
					bind:value={a.name}
					placeholder="Råsa Pantern"
					label="Namn"
					class="w-full"
				/>
				<ResizingTextInput
					name={`authors[${i}].position`}
					bind:value={a.position}
					placeholder="Ordförande"
					label="Post"
					explanation="Kan utelämnas eller helt enkelt vara 'Sektionsmedlem'"
					class="w-full"
				/>
			</div>
		</div>
	{/each}

	<div class="flex justify-end">
		<AddButton
			onclick={addAuthor}
			buttonText="➕ Lägg till författare"
			aria-label="Lägg till författare"
		/>
	</div>
</div>
