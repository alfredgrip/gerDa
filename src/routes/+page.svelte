<script lang="ts">
</script>

<section>
	<div>
		<h1>Jag vill skapa...</h1>
		<div>
			<button on:click={() => (window.location.href = '/create/motion')}> Motion </button>
			<button on:click={() => (window.location.href = '/create/proposition')}> Proposition </button>
			<button on:click={() => (window.location.href = '/create/election-proposal')}>
				"Valberedningens förslag"-handling
			</button>
			<button on:click={() => (window.location.href = '/create/custom')}> Eget dokument </button>
		</div>
		<div id="help">
			<h2>Hjälp! Vad är vad?</h2>
			<ul>
				<li>
					En <i>motion</i> är ett förslag som kommer från en sektionsmedlem eller ett ibland ett utskott.
				</li>
				<li>En <i>proposition</i> är ett förslag som kommer från styrelsen.</li>
				<li>
					En <i>"Valberedningens förslag"-handling</i> är det dokument som Valberedningen skickar in
					till ett möte för att presentera vem eller vilka de anser vara den bästa kandidaten till ett
					visst val.
				</li>
				<li>
					Ett <i>eget dokument</i> kan du använda om du vill skapa något som inte passar in i någon av
					de andra kategorierna, exempelvis en godtycklig handling som du vill skicka in till ett möte.
				</li>
			</ul>
		</div>
	</div>
</section>

<style>
	section {
		height: 100vh;
	}

	div {
		display: flex;
		flex-direction: column;
		align-items: center;
		max-width: 66%;
		margin: 0 auto;
	}

	button {
		width: 100%;
		margin: 0.5rem;
		height: 4rem;
		/* min-height: fit-content; */
		font-size: larger;
		background-color: rgb(255, 241, 241);
		border: 1px solid rgb(255, 241, 241);
		border-radius: 0.5rem;
	}

	button:hover {
		background-color: rgb(255, 241, 241, 0.8);
	}

	#help {
		margin-top: 5rem;
	}

	li {
		margin: 0.5rem;
	}
</style>
