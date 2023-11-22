<script lang="ts">
	import { draftRoutes, draftTitles } from '$lib/drafts/types';
	import { drafts } from '../lib/drafts/store';
</script>

<section>
	<div>
		<h1>Jag vill skapa...</h1>
		<div>
			{#each draftRoutes as route}
				<a href={`/create/${route}`}>{draftTitles[route]}</a>
			{/each}
			{#if $drafts.length > 0}
				<a href="/drafts">
					Mina utkast ({$drafts.length})
				</a>
			{/if}
		</div>
		<div id="help">
			<h2>Hjälp! Vad är vad?</h2>
			<ul>
				<li>
					En <i>motion</i> är ett förslag som kommer från en sektionsmedlem eller ett ibland ett utskott.
				</li>
				<li>En <i>proposition</i> är ett förslag som kommer från styrelsen.</li>
				<li>
					<i>Styrelsens svar</i> är ett dokument som styrelsen skickar in till ett möte för att svara
					på en motion.
				</li>
				<li>
					En <i>"Valberedningens förslag"-handling</i> är det dokument som Valberedningen skickar in
					till ett möte för att presentera vem eller vilka de anser vara den bästa kandidaten till ett
					visst val.
				</li>
				<li>
					En <i>kravprofil</i> är ett dokument som beskriver vilka krav och meriter som en viss post
					har. Kraven och meriterna används som underlag för valberedningen under valprocessen. En kravprofil
					måste finnas tillgänglig när ett val för en post utlyses.
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

	a {
		display: flex;
		justify-content: center;
		align-items: center;
		text-decoration: none;
		color: black;
		width: 100%;
		margin: 0.5rem;
		height: 4rem;
		/* min-height: fit-content; */
		font-size: larger;
		background-color: rgb(255, 241, 241);
		border: 1px solid rgb(255, 241, 241);
		border-radius: 0.5rem;
		cursor: pointer;
	}

	a:hover {
		background-color: rgb(255, 241, 241, 0.8);
	}

	#help {
		margin-top: 5rem;
	}

	li {
		margin: 0.5rem;
	}

	@media (max-width: 600px) {
		div {
			max-width: 100%;
		}
	}
</style>
