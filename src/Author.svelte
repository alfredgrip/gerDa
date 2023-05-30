<script lang="ts">
    export let nbr: number
    export let name: string;
    // a position is optional
    export let position: string | undefined

</script>

<div class="author">
    <label for="author-text">{nbr}</label>
    <div class="author-text">
        <input type="text" id="name" bind:value={name} placeholder="Namn"/>
        <input type="text" id="position" bind:value={position} placeholder="Post (frivillig)"/>
    </div>
</div>

<style>
    .author {
        display: flex;
        flex-direction: column;
        gap: 10px;
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