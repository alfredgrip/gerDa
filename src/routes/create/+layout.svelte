<script>
	import GenerateButton from '$lib/components/generateButton.svelte';
</script>

<div>
	<button id="back-button" on:click={() => (window.location.href = '/')}>Hem</button>
	<section>
		<form method="POST" action="/generate" target="_blank">
			<slot />
			<GenerateButton />
		</form>
	</section>
</div>

<style>
	button {
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
	}

	form {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		justify-content: center;
		background-color: rgb(255, 241, 241);
		width: fit-content;
		margin: 0 auto;
		padding: 1rem 2rem;
		border-radius: 1rem;
		min-width: 75ch;
		row-gap: 0.5rem;
	}
</style>
