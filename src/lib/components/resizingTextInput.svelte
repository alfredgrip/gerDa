<script lang="ts">
	import { error } from '@sveltejs/kit';
	import { onMount } from 'svelte';

	export let labelName: string;
	export let idName: string;
	export let required: 'true' | 'false' = 'false';
	export let placeholder: string = '';
	export let numRows: string = '1';
	export let explaination: string | null = null;
	export let value = '';

	onMount(() => {
		const input = document.getElementById(idName) as HTMLInputElement;
		if (input == null) error(500);
		input.addEventListener('input', () => {
			input.style.height = 'auto';
			input.style.height = `calc(${input.scrollHeight}px - 1rem)`;
		});
		input.dispatchEvent(new Event('input'));
	});
</script>

<section>
	<label>
		{#if explaination !== null}
			{labelName}
			<span><small>{explaination}</small></span>
		{:else}
			{labelName}
		{/if}

		{#if required === 'true'}
			<textarea
				{...$$restProps}
				name={idName}
				required
				{placeholder}
				id={idName}
				rows={parseInt(numRows)}
				bind:value
			/>
		{:else}
			<textarea
				{...$$restProps}
				name={idName}
				{placeholder}
				id={idName}
				rows={parseInt(numRows)}
				bind:value
			/>
		{/if}
	</label>
</section>

<style>
	label {
		display: flex;
		flex-direction: column;
	}

	textarea {
		height: auto;
		resize: none;
		border: 1px solid rgb(209, 209, 209);
		border-radius: 0.5rem;
		padding: 0.5rem;
		overflow: hidden;
	}
</style>
