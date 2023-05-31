<script lang="ts">


</script>

<main>
    <body>
        <h1>Proposition</h1>
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

            <div id="clausesContainer">
                <label
                    >Att-satser:
                    <div class="explanation">
                        <div class="info-circle">?</div>
                        Förändringar du tycker sektionen ska genomföra skrivs i form
                        av att-satser. Ett exempel kan vara "Att sektionen ska sjunga
                        mer på ...".
                        <br /><br />
                        Observera att du inte behöver skriva "att" i början av din
                        att-sats, detta läggs till automatiskt.
                        <br /><br />
                        Om du vill kan du även lägga till en beskrivning av din att-sats.
                        Ofta är det dock onödigt, eftersom att-satsen i sig bör vara
                        tillräckligt tydlig, samt att den bör förklaras i brödtexten.
                    </div>
                </label>
                <div class="clauseFields">
                    <label for="clause1">1</label>
                    <input
                        type="text"
                        name="clause"
                        id="clause1"
                        placeholder="Att-sats"
                    />
                    <input
                        type="text"
                        name="description"
                        id="description1"
                        placeholder="Beskrivning (frivillig)"
                    />
                </div>
            </div>
            <button type="button" id="addClauseButton"
                >Lägg till att-sats</button
            >

            <label for="signMessage">Signaturmeddelande:</label>
            <input
                type="text"
                name="signMessage"
                id="signMessage"
                placeholder="För D-sektionen,"
            />

            <div id="authorsContainer">
                <label
                    >Författare:
                    <div class="info-circle">?</div>
                    <div class="explanation">
                        Vilka är det som skrivit motionen/propositionen? Lägg
                        till det här!
                        <br /><br />
                        Ibland vill man påtrycka att en motion/proposition är skriven
                        av någon som innehar en viss post. Detta är inget måste,
                        utan du kan lämna det blankt eller skriva t.ex. "Sektionsmedlem"
                        också.
                    </div>
                </label>
                <div class="authorFields">
                    <label for="author1">1</label>
                    <input
                        type="text"
                        name="name"
                        id="name1"
                        placeholder="Namn"
                    />
                    <input
                        type="text"
                        name="position"
                        id="position1"
                        placeholder="Post (frivillig)"
                    />
                </div>
            </div>
            <button type="button" id="addAuthorButton"
                >Lägg till författare</button
            >
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
    textarea {
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


    #clausesContainer,
    #authorsContainer,
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



    #addClauseButton:hover,
    #addAuthorButton:hover {
        background-color: #45a049;
    }

    #addClauseButton:focus,
    #addAuthorButton:focus {
        outline: none;
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
