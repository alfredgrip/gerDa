<script lang="ts">
	import { goto } from '$app/navigation';
	// when clicking on the "Lägg till att-sats" button, add a new clause field
	// to the form

	import Author from './Author.svelte';
	import Clause from './Clause.svelte';
	import { writable, type Writable } from 'svelte/store';

	let title = '';
	let meeting = '';
	let body = '';
	let signMessage = '';

	type Clause = {
		uuid: string | undefined;
		clauseText: string;
		descriptionText: string | undefined;
	};

	type Author = {
		uuid: string | undefined;
		name: string;
		position: string | undefined;
	};

	const clauseTemplate = {
		uuid: undefined,
		clauseText: '',
		descriptionText: ''
	};

	const clauses: Writable<Clause[]> = writable([{ ...clauseTemplate, uuid: crypto.randomUUID() }]);


	function addClause() {
		$clauses = [...$clauses, { ...clauseTemplate, uuid: crypto.randomUUID() }];
	}

	function removeClause(uuid: string | undefined) {
		$clauses = $clauses.filter((clause) => clause.uuid !== uuid);
	}

	const authorTemplate = {
		uuid: null,
		name: '',
		position: ''
	};

	const authors: Writable<Author[]> = writable([{ ...authorTemplate, uuid: crypto.randomUUID() }]);

	function addAuthor() {
		$authors = [...$authors, { ...authorTemplate, uuid: crypto.randomUUID() }];
	}

	function removeAuthor(uuid: string | undefined) {
		$authors = $authors.filter((author) => author.uuid !== uuid);
	}

	export function getFormData() {
		return {
			title,
			meeting,
			body,
			clauses: $clauses,
			signMessage,
			authors: $authors
		};
	}

	function generateDocument() {
		const formData = getFormData();
		for (const clause of formData.clauses) {
			if (clause.descriptionText === '') {
				clause.descriptionText = undefined;
			}
		}
		for (const author of formData.authors) {
			if (author.position === '') {
				author.position = undefined;
			}
		}
		const urlparams = new URLSearchParams();
		urlparams.append('type', 'motion');
		urlparams.append('title', formData.title);
		urlparams.append('meeting', formData.meeting);
		urlparams.append('body', formData.body);

        let authorArray: { name: string; position?: string }[] = [];
        formData.authors.forEach(({ name, position }) => {
            authorArray.push({ name, position });
        })
        console.log(authorArray);
        urlparams.append('authors', JSON.stringify(authorArray));
		
		urlparams.append('signMessage', formData.signMessage);

        let clauseArray: { clauseText: string; descriptionText?: string }[] = [];
        formData.clauses.forEach(({ clauseText, descriptionText }) => {
            clauseArray.push({ clauseText, descriptionText });
        })
        console.log(clauseArray);
        urlparams.append('clauses', JSON.stringify(clauseArray));

		console.log(urlparams.toString());
		goto(`/generate?${urlparams.toString()}`);
	}
</script>

<main>
	<body>
		<h1>Motion</h1>
		<form id="documentform">
			<label for="title">Titel:</label>
			<input
				type="text"
				name="title"
				id="title"
				class="small-input"
				placeholder="Titel"
				bind:value={title}
			/>
			<label for="meeting">Möte:</label>
			<input
				type="text"
				name="meeting"
				id="meeting"
				class="small-input"
				placeholder="t.ex. VTM, S05"
				bind:value={meeting}
			/>
			<div id="bodyContainer">
				<label for="body" id="bodyLabel"
					>Brödtext:
					<div class="info-circle">?</div>
					<div class="explanation">
						Brödtexten är den inledande texten i motionen/propositionen.
						<br /><br />
						Syftet med brödtexten är att förklara bakgrunden till att-satserna, samt att motivera dem.
						<br /><br />
						Pro tip! Här kan du skriva ren LaTeX-kod om du vill!
					</div>
				</label>
				<textarea
					name="body"
					id="body"
					cols="30"
					rows="10"
					placeholder="Jag tycker att det sjungs för lite på..."
					bind:value={body}
				/>
			</div>

			<div id="outer-clause-container">
				<h2>Att-satser</h2>
				<div class="clause-container">
					{#each $clauses as clause, index (clause.uuid)}
						<div class="inner-clause-container">
							<p style="text-align:left; margin-left:0.8rem; margin-bottom:-0.5rem;">
								{index + 1}
							</p>
							<Clause
								first={index === 0}
								bind:clauseText={clause.clauseText}
								bind:descriptionText={clause.descriptionText}
								on:click={() => removeClause(clause.uuid)}
							/>
						</div>
					{/each}
				</div>
				<button type="button" id="addClauseButton" on:click={addClause}>Lägg till att-sats</button>
			</div>

			<label for="signMessage">Signaturmeddelande:</label>
			<input
				type="text"
				name="signMessage"
				id="signMessage"
				class="small-input"
				placeholder="För D-sektionen,"
				bind:value={signMessage}
			/>

			<div id="outer-author-container">
				<h2>Författare</h2>
				<div class="authorsContainer">
					{#each $authors as author, index (author.uuid)}
						<Author
							first={index === 0}
							bind:name={author.name}
							bind:position={author.position}
							on:click={() => removeAuthor(author.uuid)}
						/>
					{/each}
				</div>
				<button type="button" id="addAuthorButton" on:click={addAuthor}>
					Lägg till författare</button
				>
			</div>
		</form>
		<button class="generateButton" on:click={() => generateDocument()}>Generera motion!</button>
	</body>
</main>

<style>
	body {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	form {
		max-width: 600px;
		width: 100%;
		padding: 20px;
		margin: 30px;
		background-color: #f9f9f9;
		border: 1px solid #ccc;
		border-radius: 10px;
		position: relative;
	}

	label {
		display: block;
		margin-top: 10px;
		margin-bottom: 5px;
		position: relative;
		font-weight: bold;
	}

	input[type='text'],
	textarea,
	textarea {
		resize: vertical;
	}

	#documentform {
		display: flex;
		flex-direction: column;
	}

	#outer-clause-container,
	#outer-author-container,
	#bodyContainer {
		margin-top: 20px;
		padding: 10px;
		border: 1px solid #ccc;
		border-radius: 4px;
	}

	.clause-container {
		background: #eeeeee;
		padding: 0.4rem;
		border-radius: 0.4rem;
		margin-bottom: 0.8rem;
	}

	.inner-clause-container {
		border: 1px solid #ccc;
		border-radius: 4px;
	}

	#addClauseButton,
	#addAuthorButton {
		margin-top: 10px;
		padding: 5px 10px;
		background-color: #ccc;
		color: rgb(0, 0, 0);
		border: 1px solid #ccc;
		border-radius: 4px;
		cursor: pointer;
		text-align: left;
	}

	.generateButton {
		margin-top: 20px;
		padding: 10px 20px;
		background-color: #4caf50;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		text-align: center;
	}

	#addClauseButton:hover,
	#addAuthorButton:hover {
		background-color: #45a049;
	}

	.small-input {
		margin-top: 10px;
		padding: 5px;
		width: 100%;
		border: 1px solid #ccc;
		border-radius: 4px;
	}

	.info-circle {
		position: absolute;
		top: 50%;
		right: 5%;
		transform: translate(50%, -50%);
		width: 20px;
		height: 20px;
		text-align: center;
		padding: 5px;
		border-radius: 50%;
		border: 1px solid gray;
		cursor: pointer;
	}

	.explanation {
		position: absolute;
		top: 100%;
		right: 0;
		transform: translate(0, 10px);
		width: 16rem;
		background-color: gray;
		color: white;
		padding: 10px;
		display: none;
		font-weight: normal;
		border-radius: 5px;
	}
</style>
