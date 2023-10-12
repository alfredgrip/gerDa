<script lang="ts">
	export let uuid: string;
	export let removeFunction: (uuid: string) => void;
	export let buttonText: string;
</script>

<button type="button" class="remove-button" on:click={() => removeFunction(uuid)}
	>{buttonText}
</button>

<style>
	.remove-button {
		align-self: flex-end;
		background-color: rgb(209, 84, 84);
		border-radius: 0.5rem;
		border: 1px solid rgb(209, 209, 209);
		padding: 0.25rem 0.5rem;
	}
</style>
