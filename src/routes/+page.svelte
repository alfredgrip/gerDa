<script lang="ts">
</script>

<div>
	<h1>Jag vill skapa en...</h1>
	<div>
		<button on:click={() => (window.location.href = '/motion')}> Motion </button>
		<button on:click={() => (window.location.href = '/proposition')}> Proposition </button>
		<button on:click={() => (window.location.href = '/election-committee-proposal')}>
			"Valberedningens förslag"-handling
		</button>
	</div>
	<div id="help">
		<h2>Hjälp! Vad är vad?</h2>
		<ul>
			<li>
				En <i>motion</i> är ett förslag som kommer från en sektionsmedlem. Antingen representerar sektionsmedlemmen
				ett utskott, eller bara sig själv.
			</li>
			<li>En <i>proposition</i> är ett förslag som kommer från styrelsen.</li>
			<li>
				En <i>"Valberedningens förslag"-handling</i> är det dokument som Valberedningen skickar in till
				ett möte för att presentera vem eller vilka de anser vara den bästa kandidaten till ett visst
				val.
			</li>
		</ul>
	</div>
</div>

<style>
	/* stack the elements vertically */
	div {
		display: flex;
		flex-direction: column;
		/* center the elements horizontally */
		align-items: center;
		max-width: 66%;
		margin: 0 auto;
	}

	/* button width should be equal */
	button {
		width: 100%;
		margin: 0.5rem;
		height: 3rem;
		font-size: larger;
	}

	#help {
		margin-top: 5rem;
	}

	ul {
		/* increase space between items */
	}

	li {
		margin: 0.5rem;
	}
</style>
