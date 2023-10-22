<script lang="ts">
	import GenerateButton from '$lib/components/generateButton.svelte';
	import { error } from '@sveltejs/kit';
	async function onKeyDown(event: KeyboardEvent) {
		if ((event.ctrlKey || event.metaKey) && event.key === 's') {
			event.preventDefault();
			let form = document.querySelector('form');
			if (form == null) throw error(500, 'Form is null');
			handleSubmit({ currentTarget: form as HTMLFormElement });
		}
	}

	async function handleSubmit(event: { currentTarget: EventTarget & HTMLFormElement }) {
		const data = new FormData(event.currentTarget);
		let pdfEmbed = document.getElementById('pdf-embed');
		if (pdfEmbed == null) throw error(500, 'pdfEmbed is null');
		promise = fetch('/api/generate', {
			method: 'POST',
			body: data
		});
	}

	async function downloadAsTeX() {
		const form = document.querySelector('form');
		if (form == null) throw error(500, 'Form is null');
		const data = new FormData(form);
		const response = await fetch('/api/generate', {
			method: 'PUT',
			body: data
		});
		const text = await response.text();
		// console.log(text);
		const element = document.createElement('a');
		element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
		const title = data.get('title')?.length ? data.get('title') : 'generatedDocument';
		element.setAttribute('download', `${title}.tex`);
		element.style.display = 'none';
		document.body.appendChild(element);
		element.click();
		document.body.removeChild(element);
	}

	let promise: ReturnType<typeof fetch> = Promise.resolve(new Response('/GUIDE.pdf#pagemode=none'));
</script>

<svelte:window on:keydown={onKeyDown} />
<section id="outer-section">
	<div id="form-wrapper">
		<form method="POST" on:submit|preventDefault={handleSubmit}>
			<slot />
			<div style="display: flex; flex-direction: row; gap: 1rem; justify-content: center;">
				<GenerateButton />
				<button id="tex-button" on:click|preventDefault={downloadAsTeX}
					>Ladda ner som TeX-fil</button
				>
			</div>
		</form>
	</div>
	<div id="pdf-wrapper">
		{#await promise}
			<div class="loader" />
		{:then resp}
			{#await resp.text()}
				<div class="loader" />
			{:then text}
				{#if text.startsWith('/GUIDE.pdf')}
					<iframe id="pdf-embed" src={text} title="PDF Embed" />
				{:else}
					<iframe id="pdf-embed" src={`/output/${text}#pagemode=none`} title="PDF Embed" />
				{/if}
			{:catch error}
				<p>{error.message}</p>
			{/await}
		{:catch error}
			<p>{error.message}</p>
		{/await}
	</div>
</section>

<style>
	#outer-section {
		display: flex;
		flex-direction: row;
		justify-content: start;
	}
	#outer-section > * {
		flex: 1;
	}
	form {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		justify-content: center;
		background-color: rgb(255, 241, 241);
		border: 1px solid rgb(209, 209, 209);
		padding: 1rem;
		border-radius: 1rem;
		row-gap: 0.5rem;
	}

	iframe {
		background-color: rgb(255, 241, 241);
		padding: 1rem;
		border-radius: 1rem;
		border: 1px solid rgb(209, 209, 209);
		width: 90%;
		height: 100%;
	}

	#pdf-wrapper {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		align-items: center;
	}

	.loader {
		border: 16px solid rgb(255, 241, 241);
		border-top: 16px solid rgb(153, 102, 204);
		border-radius: 50%;
		width: 120px;
		height: 120px;
		animation: spin 2s linear infinite;
		margin-top: 5rem;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	#tex-button {
		background-color: rgb(123, 206, 142);
		border-radius: 0.5rem;
		padding: 0rem 1rem;
		border: 2px solid rgb(209, 209, 209);
	}

	#tex-button:hover {
		background-color: rgb(123, 206, 142, 0.8);
	}
</style>
