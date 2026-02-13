<script lang="ts">
	import { iFrameUrl, isCompiling } from '$lib/state/appState.svelte';
</script>

<div class="flex h-150 w-full flex-col px-6 lg:h-full">
	{#if isCompiling.get()}
		<div class="flex flex-1 items-center justify-center">
			<div class="loader"></div>
		</div>
	{:else}
		<iframe
			src={`${iFrameUrl.get()}#pagemode=none`}
			class="w-full flex-1 rounded-lg shadow-inner"
			title="Generated PDF"
		></iframe>
	{/if}
</div>

<style>
	.loader {
		border: 16px solid rgba(242, 128, 161, 0.5);
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
