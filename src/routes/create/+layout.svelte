<script lang="ts">
	import GenerateButton from '$lib/components/generateButton.svelte';
	import { error } from '@sveltejs/kit';

	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	const urlToNames = new Map<string, string>([
		['/create/election-proposal', 'en "Valberedningens förslag"-handling'],
		['/create/motion', 'en motion'],
		['/create/proposition', 'en proposition'],
		['/create/custom', 'ett eget dokument'],
		['/create/requirement-profile', 'en kravprofil'],
		['/create/board-response', 'styrelsens svar'],
		['/create/notice', 'en kallelse']
	]);

	onMount(() => {
		const form = document.querySelector('form');
		if (form == null) error(500, 'Form is null');
		form.addEventListener('keypress', function (e) {
			if (e.key === 'Enter' && !(e.target instanceof HTMLTextAreaElement)) {
				e.preventDefault();
			}
		});
	});

	async function onKeyDown(event: KeyboardEvent) {
		if ((event.ctrlKey || event.metaKey) && event.key === 's') {
			event.preventDefault();
			let form = document.querySelector('form');
			if (form == null) error(500, 'Form is null');
			handleSubmit({ currentTarget: form as HTMLFormElement });
		}
	}

	async function handleSubmit(event: { currentTarget: EventTarget & HTMLFormElement }) {
		const data = new FormData(event.currentTarget);
		let pdfEmbed = document.getElementById('pdf-embed');
		if (pdfEmbed == null) error(500, 'pdfEmbed is null');
		promise = fetch('/api/generate', {
			method: 'POST',
			body: data
		});
	}

	async function downloadPdf() {
		const pdfEmbed = document.getElementById('pdf-embed');
		if (pdfEmbed == null) error(500, 'pdfEmbed is null');
		const src = (pdfEmbed as HTMLIFrameElement).src;
		const element = document.createElement('a');
		element.setAttribute('href', src);
		let titleInput = document.querySelector('textarea[name="title"]');
		if (titleInput == null) error(500, 'titleInput is null');
		const title = (titleInput as HTMLTextAreaElement).value.length
			? (titleInput as HTMLTextAreaElement).value
			: 'generatedDocument';
		element.setAttribute('download', `${title}.pdf`);
		element.style.display = 'none';
		document.body.appendChild(element);
		element.click();
		document.body.removeChild(element);
	}

	async function downloadAsTeX() {
		const form = document.querySelector('form');
		if (form == null) error(500, 'Form is null');
		const data = new FormData(form);
		const response = await fetch('/api/generate', {
			method: 'PUT',
			body: data
		});
		const text = await response.text();
		// console.log(text);
		const element = document.createElement('a');
		element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
		const title = (data.get('title') as string | undefined)?.length
			? data.get('title')
			: 'generatedDocument';
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
			<div style="display: flex; flex-direction: row; justify-content: start; column-gap: 2rem;">
				<button on:click|preventDefault={() => (window.location.href = '/')} id="back-button"
					><strong>&#8592 Hem</strong></button
				>
				<h1 style="width: fit-content;">Du skapar {urlToNames.get($page.route.id ?? '')}</h1>
			</div>
			<p>
				Psst... du kan skriva i både <a
					href="https://www.markdownguide.org/cheat-sheet/"
					target="_blank">Markdown</a
				>
				och <a href="https://wch.github.io/latexsheet/latexsheet.pdf" target="_blank">LaTeX</a> samtidigt,
				programmet löser det automagiskt!
			</p>
			<slot />
			<div
				style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; justify-content: center;"
			>
				<GenerateButton />
				<button class="tex-button" on:click|preventDefault={downloadPdf}>Ladda ner PDF</button>
				<button class="tex-button" on:click|preventDefault={downloadAsTeX}
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
					<iframe
						id="pdf-embed"
						src={`/output/${encodeURI(text)}#pagemode=none`}
						title="PDF Embed"
					/>
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
		row-gap: 1rem;
	}

	iframe {
		background-color: rgb(255, 241, 241);
		padding: 1rem;
		border-radius: 1rem;
		border: 1px solid rgb(209, 209, 209);
		width: 95%;
		height: 110vh;
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
		display: grid;
		place-items: center;
		margin-top: 50vh;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	.tex-button {
		background-color: rgb(123, 206, 142);
		border-radius: 0.5rem;
		padding: 0rem 1rem;
		border: 2px solid rgb(209, 209, 209);
	}

	.tex-button:hover {
		background-color: rgb(123, 206, 142, 0.8);
	}

	#back-button {
		border-radius: 0.5rem;
		padding: 0rem 1rem;
		border: 2px solid rgb(209, 209, 209);
		/* make it less height */
		height: 2rem;
		margin-top: 1rem;
	}

	a {
		text-decoration: underline;
		color: rgb(0, 0, 0);
	}

	@media (max-width: 600px) {
		#outer-section {
			flex-direction: column;
			row-gap: 1rem;
		}
		#outer-section > * {
			flex: 1;
		}

		iframe {
			height: 100vh;
		}
	}
</style>
