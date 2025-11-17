<script lang="ts">
	import type { AllFieldsSchema } from '$lib/schemas';
	import { onMount } from 'svelte';

	interface Props {
		name: keyof AllFieldsSchema | (string & {}); // https://medium.com/@florian.schindler_47749/typescript-hacks-1-string-suggestions-58806363afeb
		label?: string;
		value: string | null | undefined;
		placeholder?: string;
		numRows?: number;
		explanation?: string;
		errors?: string[];
		class?: string;
	}

	let {
		name,
		label,
		value = $bindable(),
		placeholder,
		numRows,
		explanation,
		errors,
		class: clazz,
		...rest
	}: Props = $props();

	let textareaElement: HTMLTextAreaElement;

	function resizeTextarea() {
		if (textareaElement) {
			textareaElement.style.height = 'auto';
			textareaElement.style.height = textareaElement.scrollHeight + 'px';
		}
	}

	onMount(() => {
		if (textareaElement) {
			resizeTextarea();
			textareaElement.addEventListener('input', resizeTextarea);
		}
	});
</script>

<section class={`flex flex-col ${clazz}`}>
	<label for={name} class="flex flex-col gap-1 text-sm font-medium text-gray-700">
		{#if label}
			<span>{label}</span>
		{/if}

		<textarea
			{name}
			{placeholder}
			rows={numRows}
			bind:value
			bind:this={textareaElement}
			class="w-full resize-none rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
			style="height: auto;"
			oninput={resizeTextarea}
			{...rest}
			aria-invalid={errors ? 'true' : undefined}
		></textarea>

		{#if explanation}
			<small class="text-xs text-gray-500">{explanation}</small>
		{/if}
	</label>

	{#if errors && errors.length > 0}
		<ul class="mt-1 text-xs text-red-600">
			{#each errors as err (err)}
				<li>{err}</li>
			{/each}
		</ul>
	{/if}
</section>
