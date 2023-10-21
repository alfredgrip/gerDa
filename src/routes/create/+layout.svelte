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

		const response = await fetch('/api/generate', {
			method: 'POST',
			body: data
		});

		const result = await response.text();
		console.log(result);
		let pdfEmbed = document.getElementById('pdf-embed');
		if (pdfEmbed == null) throw error(500, 'pdfEmbed is null');
		pdfEmbed = pdfEmbed as HTMLObjectElement;
		pdfEmbed.setAttribute('src', '/output/' + result + '#pagemode=none');
	}
</script>

<svelte:window on:keydown={onKeyDown} />

<section id="outer-section">
	<div id="form-wrapper">
		<section>
			<form method="POST" on:submit|preventDefault={handleSubmit}>
				<slot />
				<GenerateButton />
			</form>
		</section>
	</div>
	<embed id="pdf-embed" src="/GUIDE.pdf#pagemode=none" />
</section>

<style>
	/* button {
		border-radius: 0.5rem;
		border: 1px solid rgb(255, 241, 241);
		padding: 0.25rem 0.5rem;
		max-height: 2rem;
		background-color: rgb(255, 241, 241);
	}

	#back-button {
		position: absolute;
		top: 0.5rem;
		left: 1rem;
	} */

	form {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		justify-content: center;
		background-color: rgb(255, 241, 241);
		width: 50vw;
		margin: 0 auto;
		padding: 1rem 2rem;
		border-radius: 1rem;
		row-gap: 0.5rem;
		height: min-content;
	}

	#outer-section {
		display: flex;
		flex-direction: row;
		justify-content: center;
	}

	embed {
		background-color: rgb(255, 241, 241);
		padding: 1rem;
		width: 100%;
		height: 100vh;
		margin: 1rem;
		border-radius: 1rem;
	}

	#form-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		margin: 1rem;
	}
</style>
