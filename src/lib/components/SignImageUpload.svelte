<script lang="ts">
	import { getAuthorContext } from '$lib/state/authorState.svelte';

	interface Props {
		id: number;
	}
	let { id }: Props = $props();

	let fileInput: HTMLInputElement;
	let authorState = getAuthorContext();

	let file: File | null = $derived(authorState.authors.at(id)?.signImage || null);

	function handleFileChange(e: Event) {
		const target = e.target as HTMLInputElement;
		file = target.files?.[0] || null;
		if (file) {
			authorState.authors[id].signImage = file;
		}
	}

	function clearFile() {
		if (fileInput) fileInput.value = '';
		file = null;
		authorState.authors[id].signImage = null;
	}
</script>

<div class="flex flex-col gap-1">
	{#if !file}
		<div>
			<label
				for={`author_${id}_signImage`}
				class="inline-flex cursor-pointer items-center gap-2 rounded-md bg-blue-500 px-3 py-1.5 text-sm font-medium text-white shadow hover:bg-blue-700"
			>
				📁 Ladda upp bild
			</label>
		</div>
	{/if}

	<input
		type="file"
		id={`author_${id}_signImage`}
		name={`author_${id}_signImage`}
		accept=".jpg,.jpeg,.png"
		bind:this={fileInput}
		onchange={handleFileChange}
		class="hidden"
	/>

	<!-- Preview -->
	{#if file}
		<div class="mt-2 flex items-center gap-3">
			{#if file.type.startsWith('image/')}
				<img
					src={URL.createObjectURL(file)}
					alt="Preview"
					class="h-16 w-16 rounded-md object-cover"
				/>
			{/if}
			<div class="flex flex-col">
				<p class="max-w-[12rem] truncate text-sm font-medium text-gray-800">{file.name}</p>
				<button
					type="button"
					onclick={clearFile}
					class="mt-1 text-xs text-red-600 hover:text-red-800 hover:underline"
				>
					Ta bort bild
				</button>
			</div>
		</div>
	{/if}
</div>
