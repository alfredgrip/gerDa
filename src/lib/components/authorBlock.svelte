<script lang="ts">
	import ResizingTextInput from '$lib/components/ResizingTextInput.svelte';
	import SignImageUpload from '$lib/components/SignImageUpload.svelte';
	import { getAuthorContext } from '$lib/state/authorState.svelte';

	let authorContext = getAuthorContext();
</script>

<div class="space-y-6">
	<h2 class="text-lg font-semibold text-gray-800">Författare</h2>

	{#each authorContext.authors as a, i (i)}
		<div class="relative space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
			<!-- Remove button (X in corner) -->
			{#if i !== 0}
				<button
					type="button"
					onclick={() => authorContext.removeAuthor(i)}
					class="absolute top-2 right-2 text-gray-400 hover:text-red-600"
					aria-label="Ta bort författare"
				>
					✕
				</button>
			{/if}

			<!-- Row 1: Sign message + Sign image -->
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<ResizingTextInput
					name={`author_${i}_signMessage`}
					bind:value={a.signMessage}
					placeholder="Lund, dag som ovan"
					label="Signaturmeddelande"
					explanation="Förslagsvis ort och datum, eller något annat kul"
					class="w-full"
				/>

				<div class="flex flex-col gap-1">
					<label class="mb-0 text-sm font-medium text-gray-700" for={`sign-image-upload-${i}`}
						>Signaturbild</label
					>
					<SignImageUpload id={i} />
				</div>
			</div>

			<!-- Row 2: Name + Position -->
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<ResizingTextInput
					name={`author_${i}_name`}
					bind:value={a.name}
					placeholder="Råsa Pantern"
					label="Namn"
					class="w-full"
				/>
				<ResizingTextInput
					name={`author_${i}_position`}
					bind:value={a.position}
					placeholder="Ordförande"
					label="Post"
					explanation="Kan utelämnas eller helt enkelt vara 'Sektionsmedlem'"
					class="w-full"
				/>
			</div>
		</div>
	{/each}

	<!-- Add new author button -->
	<div class="flex justify-end">
		<button
			type="button"
			onclick={() => authorContext.addAuthor()}
			class="inline-flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white shadow hover:bg-green-700"
		>
			➕ Lägg till författare
		</button>
	</div>
</div>
