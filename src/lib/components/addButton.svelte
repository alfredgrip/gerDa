<script lang="ts">
	export let addFunction: () => void;
	export let buttonText: string;
</script>

<button type="button" class="add-button" on:click={() => addFunction()}>{buttonText} </button>

<style>
	.add-button {
		align-self: flex-end;
		background-color: rgb(123, 206, 142);
		border-radius: 0.5rem;
		border: 1px solid rgb(209, 209, 209);
		padding: 0.25rem 0.5rem;
	}

	.add-button:hover {
		background-color: rgb(123, 206, 142, 0.8);
	}
</style>
