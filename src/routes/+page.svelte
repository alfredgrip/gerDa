<script lang="ts">
</script>

<section>
	<div>
		<h1>Jag vill skapa en...</h1>
		<div>
			<button on:click={() => (window.location.href = '/create/motion')}> Motion </button>
			<button on:click={() => (window.location.href = '/create/proposition')}> Proposition </button>
			<button on:click={() => (window.location.href = '/create/election-committee-proposal')}>
				"Valberedningens förslag"-handling
			</button>
		</div>
		<div id="help">
			<h2>Hjälp! Vad är vad?</h2>
			<div id="help-list">
				<ul>
					<li>
						En <i>motion</i> är ett förslag som kommer från en sektionsmedlem. Antingen representerar
						sektionsmedlemmen ett utskott, eller bara sig själv.
					</li>
					<li>En <i>proposition</i> är ett förslag som kommer från styrelsen.</li>
					<li>
						En <i>"Valberedningens förslag"-handling</i> är det dokument som Valberedningen skickar in
						till ett möte för att presentera vem eller vilka de anser vara den bästa kandidaten till
						ett visst val.
					</li>
				</ul>
			</div>
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
		height: 3rem;
		font-size: larger;
		background-color: rgb(255, 241, 241);
		border: 1px solid rgb(255, 241, 241);
		border-radius: 0.5rem;
	}

	#help {
		margin-top: 5rem;
	}

	#help-list {
		/* place all elements side by side */
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}

	li {
		margin: 0.5rem;
	}
</style>
