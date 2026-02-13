<script lang="ts">
	import { formState } from '$lib/state/formState.svelte';

	interface Props {
		authorIdx: number;
	}

	let { authorIdx }: Props = $props();
	let fileInput: HTMLInputElement;

	let authors = $derived(formState.authors);

	let file = $derived(
		authors[authorIdx]?.signImage instanceof File ? authors[authorIdx].signImage : null
	);

	function handleFileChange(e: Event) {
		const target = e.target as HTMLInputElement;
		const newFile = target.files?.[0];

		if (newFile) {
			authors[authorIdx].signImage = newFile;
		}
	}

	function clearFile() {
		if (fileInput) fileInput.value = '';
		authors[authorIdx].signImage = false;
	}

	let blobUrl = $state('');

	$effect(() => {
		if (file) {
			const url = URL.createObjectURL(file);
			blobUrl = url;
			return () => {
				clearFile();
				URL.revokeObjectURL(url);
			};
		} else {
			blobUrl = '';
		}
	});
</script>

<div class="flex flex-col gap-1">
	{#if !file}
		<div>
			<label
				for={`authors[${authorIdx}].signImage`}
				class="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-3 py-1.5 text-sm font-medium text-white shadow hover:bg-blue-700"
			>
				📁 Ladda upp bild
			</label>
		</div>
	{/if}

	<input
		type="file"
		id={`authors[${authorIdx}].signImage`}
		name={`authors[${authorIdx}].signImage`}
		accept=".jpg,.jpeg,.png"
		bind:this={fileInput}
		onchange={handleFileChange}
		class="hidden"
	/>

	{#if file}
		<div class="mt-2 flex items-center gap-3">
			{#if file.type.startsWith('image/')}
				<img src={blobUrl} alt="Preview" class="h-16 w-16 rounded-lg object-cover" />
			{/if}
			<div class="flex flex-col">
				<p class="800 max-w-48 truncate text-sm font-medium">{file.name}</p>
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
