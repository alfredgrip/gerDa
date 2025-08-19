<!-- <script lang="ts">
	import { SvelteDate } from 'svelte/reactivity';

	interface Props {
		name: string;
		label?: string;
		date: SvelteDate;
	}

	let { date = $bindable(), name, label }: Props = $props();

	let calendarDate: string = $derived(
		date.toISOString().slice(0, 16) // Format to 'YYYY-MM-DDTHH:MM'
	);
	$effect(() => {
		console.log('DateTimePicker date changed:', date);
		console.log('Calendar date:', calendarDate);
	});

	let svelteDate = $state(new SvelteDate());
</script>

<input
	type="datetime-local"
	bind:value={svelteDate}
	class="w-full rounded-md border p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
	{name}
/> -->
