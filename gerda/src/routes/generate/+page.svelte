<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	let isLoading = true;
	let searchParams = $page.url.searchParams;
	let error: string | undefined;
	let fileurl: string;
	const ALLOWED_TYPES = ['motion', 'proposition', 'handling'];

	/** @type {import('./$types').PageData} */
	onMount(async () => {
		const type = searchParams.get('type');
		if (!type || !ALLOWED_TYPES.includes(type)) {
			//return
		}
		const res = await fetch(`/api/compile?${searchParams.toString()}`, {
			method: 'GET'
		});
		const body = await res.json();
		if (!res.ok) {
			error = body.message;
		}
		isLoading = false;
		const fileName = body.fileName;
		if (!fileName) {
			return;
		}
		console.log('filename', fileName);
		fileurl = fileName;
		goto(fileurl);
	});
</script>

{#if isLoading}
	<h1>Genererar ditt dokument...</h1>
{:else}
	<h1>{error ? `Error: ${error}` : fileurl}</h1>
{/if}

<style>
	h1 {
		text-align: center;
	}
</style>
