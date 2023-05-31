<script lang="ts">
    export let first: boolean;
    export let nbr: number;
    export let clauseText: string | undefined;
    export let descriptionText: string | undefined;
</script>

<div class="clause">
    <label for="clause-text">Att-sats {nbr}:</label>
    <div class="clause-text">
        <input
            type="text"
            id="clause-text"
            bind:value={clauseText}
            placeholder="sjung mer på..."
        />
        <input
            type="text"
            id="description-text"
            bind:value={descriptionText}
            placeholder="Beskrivning (frivillig)"
        />
    </div>
    {#if !first}
        <button type="button" id="removeClauseButton" on:click>
            Ta bort att-sats
        </button>
    {/if}
</div>

<style>
    .clause {
        background: #eeeeee;
        padding: 0.4rem;
        border-radius: 0.4rem;
        margin-bottom: 0.8rem;
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
