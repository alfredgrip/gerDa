<script lang="ts">
	import { getFormContext } from '$lib/state/formState.svelte';
	let formState = getFormContext();
</script>

<div class="flex min-h-max w-full flex-col bg-red-200 px-6 py-6">
	{#if formState.isCompiling}
		<div class="loader self-center"></div>
	{:else}
		<iframe src={`${formState.iFrameUrl}#pagemode=none`} class="h-full w-full" title="Generated PDF"
		></iframe>
	{/if}
</div>

<style>
	.loader {
		border: 16px solid rgb(255, 241, 241);
		border-top: 16px solid rgb(153, 102, 204);
		border-radius: 50%;
		width: 120px;
		height: 120px;
		animation: spin 2s linear infinite;
		display: grid;
		place-items: center;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
