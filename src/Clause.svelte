<script lang="ts">
    export let id: number;
    export let clauseText: string | null;
    export let descriptionText: string | null;

    function updateClauseText(event) {
        clauseText = event.target.value;
        console.log(clauseText);
    }

    function updateDescriptionText(event) {
        descriptionText = event.target.value;
    }
</script>

<div class="clause">
    <label for="clause-text">{id}</label>
    <div class="clause-text">
        <input
            type="text"
            id="clause-text"
            value={clauseText}
            on:change={updateClauseText}
            placeholder="att-sats"
        />
        <input
            type="text"
            id="description-text"
            value={descriptionText}
            on:change={updateDescriptionText}
            placeholder="Beskrivning (frivillig)"
        />
    </div>
</div>

<style>
    .clause {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .clause-text {
        display: flex;
        flex-direction: column;
    }

    input {
        width: 100%;
        padding: 8px;
        margin-top: 5px;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-sizing: border-box;
    }

    label {
        text-align: left;
        font-weight: bold;
    }
</style>
