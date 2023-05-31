<script lang="ts">
    // when clicking on the "Lägg till att-sats" button, add a new clause field
    // to the form

    import Author from "./Author.svelte";
    import Clause from "./Clause.svelte";
    import { writable } from "svelte/store";

    const clauseTemplate = {
        id: null,
        clauseText: "",
        descriptionText: "",
    };

    let clauses = writable([{ ...clauseTemplate, id: 1 }]);

    function numberOfClauses(): number {
        return $clauses.length;
    }

    function addClause() {
        $clauses = [
            ...$clauses,
            { ...clauseTemplate, id: numberOfClauses() + 1 },
        ];
    }

    function removeClause(id: number) {
        $clauses = $clauses.filter((clause) => clause.id !== id);
    }

    const authorTemplate = {
        id: null,
        name: "",
        position: "",
    };

    let authors = writable([{ ...authorTemplate, id: 1 }]);

    function numberOfAuthors(): number {
        return $authors.length;
    }

    function addAuthor() {
        $authors = [
            ...$authors,
            { ...authorTemplate, id: numberOfAuthors() + 1 },
        ];
    }

    function removeAuthor(id: number) {
        $authors = $authors.filter((author) => author.id !== id);
    }


</script>

<main>
    <body>
        <h1>Motion</h1>
        <form id="documentform">
            <label for="title">Titel:</label>
            <input type="text" name="title" id="title" placeholder="Titel" />
            <label for="meeting">Möte:</label>
            <input
                type="text"
                name="meeting"
                id="meeting"
                placeholder="t.ex. VTM, S05"
            />
            <div id="bodyContainer">
                <label for="body" id="bodyLabel"
                    >Brödtext:
                    <div class="info-circle">?</div>
                    <div class="explanation">
                        Brödtexten är den inledande texten i
                        motionen/propositionen.
                        <br /><br />
                        Syftet med brödtexten är att förklara bakgrunden till att-satserna,
                        samt att motivera dem.
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
                />
            </div>

            <div id="outer-clause-container">
                <h2>Att-satser</h2>
                <div class="clausesContainer">
                    {#each $clauses as clause, index (clause.id)}
                        <Clause
                            first={index === 0}
                            bind:nbr={clause.id}
                            bind:clauseText={clause.clauseText}
                            bind:descriptionText={clause.descriptionText}
                            on:click="{() => removeClause(clause.id)}"
                        />
                    {/each}
                </div>
            </div>
            <button type="button" id="addClauseButton" on:click={addClause}
                >Lägg till att-sats</button
            >

            <label for="signMessage">Signaturmeddelande:</label>
            <input
                type="text"
                name="signMessage"
                id="signMessage"
                placeholder="För D-sektionen,"
            />

            <div id="outer-author-container">
                <h2>Författare</h2>
                <div class="authorsContainer">
                    {#each $authors as author, index (author.id)}
                        <Author
                            first={index === 0}
                            bind:nbr={author.id}
                            bind:name={author.name}
                            bind:position={author.position}
                            on:click={() => removeAuthor(author.id)}
                        />
                    {/each}
                </div>
                <button type="button" id="addAuthorButton" on:click={addAuthor}>
                    Lägg till författare</button
                >

                <div>
                    <button type="submit" id="generateButton"
                        >Generera dokument!</button
                    >
                </div>
            </div>
        </form>
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

    input[type="text"],
    textarea,
    select {
        width: 100%;
        padding: 8px;
        margin-top: 5px;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-sizing: border-box;
    }

    textarea {
        resize: vertical;
    }

    #documentform {
        display: flex;
        flex-direction: column;
    }

    #documentform button[type="submit"] {
        font-size: 1.2em;
        padding: 10px 20px;
        text-align: center;
        margin-top: 20px;
    }

    #outer-clause-container,
    #outer-author-container,
    #bodyContainer {
        margin-top: 20px;
        padding: 10px;
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

    #generateButton {
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

    #addClauseButton:focus,
    #addAuthorButton:focus,
    #generateButton:focus {
        outline: none;
    }

    #removeClauseButton,
    #removeAuthorButton {
        padding: 5px 10px;
        margin-top: 5px;
        background-color: #ccc;
        color: rgb(0, 0, 0);
        border: 1px solid #ccc;
        border-radius: 4px;
        cursor: pointer;
        text-align: left;
    }

    .removeClauseButton:hover,
    .removeAuthorButton:hover {
        background-color: #d32727;
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
