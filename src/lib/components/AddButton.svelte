<script lang="ts">
	interface Props {
		onclick: () => void;
		buttonText: string;
		'aria-label': string;
	}
	let { onclick, buttonText, 'aria-label': ariaLabel }: Props = $props();
</script>

<button
	type="button"
	{onclick}
	class="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-emerald-700"
	aria-label={ariaLabel}
>
	{buttonText}
</button>
