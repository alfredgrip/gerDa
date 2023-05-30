<script lang="ts">
	
	import FormSelector from "./FormSelector.svelte";
	import { onMount } from "svelte";

	import activeForm from "./FormSelector.svelte";
	
</script>

<main>
	<div id="outer-container">
		<div id="site-title-container">
			<h1>
				Ger<span
					id="site-title-main"
					style=" margin-left: 2px; margin-right: -10px;">d</span
				>a
			</h1>
			<p id="site-title-complement">aka löpbanDet 2.0</p>
		</div>
		<p>
			Detta är ett verktyg för att skapa motioner och propositioner till
			D-sektionens möten. Funktionaliteten är i nuläget något begränsad,
			så bidra gärna med din kunskap på <a
				href="https://github.com/alfredgrip/gerDa">GitHub</a
			>.
		</p>
	</div>
	<hr />
	<FormSelector />
	<button class="generate-button" on:click={() => {}}
		>Generera dokument!</button
	>
	<footer id="footer">
		<p>Skapad av: Alfred Grip och Ludvig Svedberg</p>
		<p>
			Tycker du det här verktyget är för simpelt? Saknas det något du
			behöver? Testa skapa dokument med <a
				href="https://github.com/Dsek-LTH/dsek-latex"
				>D-sektionens LaTeX-mallar</a
			> på egen hand!
		</p>
		<p />
	</footer>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		text-align: center;
		height: fit-content;
		background-image: linear-gradient(
			rgba(242, 128, 161),
			rgba(153, 102, 204)
		);
		background-repeat: no-repeat;
	}

	#outer-container {
		width: 50%;
		background-color: rgb(248, 248, 248);
		border-radius: 10px;
		padding: 20px;
		margin: 20px;
		display: flex;
		flex-direction: column;
		gap: 20px;
		border: 2px solid black;
	}

	#site-title-container {
		margin-top: -1.5em;
		text-align: center;
		font-size: 4em;
	}

	#site-title-main {
		font-family: "LTH Sektionssymboler";
		margin: 0;
	}

	#site-title-complement {
		font-size: 0.5em;
		margin-top: -3em;
		margin-bottom: 0em;
		color: #5c5c5c;
	}

	.generate-button {
		width: 25%;
		margin: 20px;
		padding: 10px;
		border-radius: 10px;
		border: 2px solid black;
		background-color: rgb(248, 248, 248);
	}
</style>
