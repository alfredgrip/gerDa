<script lang="ts">
	import { dirty } from '$lib/state/appState.svelte';
	import { onMount } from 'svelte';

	interface Props {
		name: string;
		value: string[] | null | undefined;
		label?: string;
		placeholder?: string;
		separator: string;
		explanation?: string;
		errors?: string[];
		class?: string;
	}

	let {
		name,
		value = $bindable([]),
		label,
		placeholder,
		separator,
		explanation,
		errors,
		class: clazz
	}: Props = $props();

	let textareaElement: HTMLTextAreaElement | undefined = $state();
	let internalString = $state('');

	const getRegex = () => {
		const escaped = separator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		return new RegExp(`[${escaped}\\n]`);
	};

	$effect(() => {
		const joined = (value ?? []).join(`${separator} `);

		const cleanInternal = internalString
			.split(getRegex())
			.map((s) => s.trim())
			.filter(Boolean)
			.join(`${separator} `);

		if (joined !== cleanInternal) {
			internalString = joined;
		}
	});

	function handleInput(e: Event & { currentTarget: HTMLTextAreaElement }) {
		const raw = e.currentTarget.value;
		internalString = raw;

		value = raw
			.split(getRegex())
			.map((s) => s.trim())
			.filter((s) => s !== '');

		resize();
		dirty.set(true);
	}

	function resize() {
		if (textareaElement) {
			textareaElement.style.height = 'auto';
			textareaElement.style.height = textareaElement.scrollHeight + 'px';
		}
	}

	onMount(resize);
</script>

<section class="flex flex-col {clazz}">
	{#if value && value.length > 0}
		{#each value as item, i}
			<input type="hidden" name={`${name}[${i}]`} value={item} />
		{/each}
	{:else}
		<input type="hidden" name={`${name}[0]`} value="" />
	{/if}

	<label class="flex flex-col gap-1 text-sm font-medium">
		{#if label}
			<span>{label}</span>
		{/if}

		<textarea
			bind:this={textareaElement}
			value={internalString}
			oninput={handleInput}
			{placeholder}
			class="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
			style="height: auto;"
		></textarea>

		{#if explanation}
			<small class="text-xs text-gray-500 italic">{explanation}</small>
		{/if}
	</label>

	{#if errors && errors.length > 0}
		<ul class="mt-1 text-xs text-red-600">
			{#each errors as err}
				<li>{err}</li>
			{/each}
		</ul>
	{/if}
</section>
