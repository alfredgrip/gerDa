<script lang="ts">
	interface Props {
		onclick: () => void;
		'aria-label': string;
		buttonText?: string;
	}
	let { onclick, buttonText = '✕', 'aria-label': ariaLabel }: Props = $props();
</script>

<button
	type="button"
	{onclick}
	class="absolute top-2 right-3 text-red-600 hover:text-red-800"
	aria-label={ariaLabel}
>
	{buttonText}
</button>
