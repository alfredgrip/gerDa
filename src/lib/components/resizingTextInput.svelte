<script lang="ts">
	import type { AllFieldsSchema } from '$lib/schemas';
	import { onMount } from 'svelte';

	let textareaElement: HTMLTextAreaElement;

	interface Props {
		name: keyof AllFieldsSchema | (string & {}); // https://medium.com/@florian.schindler_47749/typescript-hacks-1-string-suggestions-58806363afeb
		label?: string;
		value: string | null | undefined;
		required?: true | false;
		placeholder?: string;
		numRows?: number;
		explanation?: string;
		errors?: string[];
	}

	let {
		name,
		label,
		value = $bindable(),
		required: isRequired,
		placeholder,
		numRows,
		explanation,
		errors,
		...rest
	}: Props = $props();

	onMount(() => {
		textareaElement.addEventListener('input', () => {
			textareaElement.style.height = 'auto';
			textareaElement.style.height = textareaElement.scrollHeight + 'px';
		});
		textareaElement.dispatchEvent(new Event('input'));
	});
</script>

<section class="wrap-break-word">
	<!-- style={`width: ${width}; overflow-wrap: break-word;`} -->
	<label for={name} class="flex flex-col">
		{label}
		<textarea
			{name}
			required={Boolean(isRequired).valueOf()}
			{placeholder}
			rows={numRows}
			bind:value
			bind:this={textareaElement}
			class="w-full resize-none overflow-hidden rounded-md border p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
			{...rest}
			aria-invalid={errors ? 'true' : undefined}
		></textarea>
		{#if explanation !== null}
			<small class="text-xs">
				<span>{explanation}</span>
			</small>
		{/if}
	</label>
	{#if errors}<span class="invalid">{errors}</span>{/if}
</section>
