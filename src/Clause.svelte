<script lang="ts">
    export let first: boolean;
    export let clauseText: string | undefined;
    export let descriptionText: string | undefined;
</script>

<div class="clause">
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
        <button type="button" id="removeClauseButton" on:click style:hover="background-color: #f44336;">
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
        border: 1px solid #ccc;
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

    #removeClauseButton:hover {
        background-color: #f44336;
    }

</style>
