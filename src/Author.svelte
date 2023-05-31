<script lang="ts">
    export let first: boolean;
    export let nbr: number;
    export let name: string;
    // a position is optional
    export let position: string | undefined;
</script>

<div class="author">
    <div class="author-text">
        <input type="text" id="name" bind:value={name} placeholder="Namn" />
        <input
            type="text"
            id="position"
            bind:value={position}
            placeholder="Post (frivillig)"
        />
    </div>
    {#if !first}
        <button type="button" id="removeAuthorButton" on:click>
            Ta bort författare
        </button>
    {/if}
</div>

<style>
	.author {
		background: #eeeeee;
		padding: .4rem;
		border-radius: .4rem;
		margin-bottom: .8rem;
	}

    .author-text {
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
