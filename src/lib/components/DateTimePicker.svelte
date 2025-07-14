<script lang="ts">
	interface Props {
		name: string;
		label?: string;
		date: Date;
	}

	let { date = $bindable(), name, label }: Props = $props();

	let calendarDate: string = $derived(
		date.toISOString().slice(0, 16) // Format to 'YYYY-MM-DDTHH:MM'
	);
	$effect(() => {
		console.log('DateTimePicker date changed:', date);
		console.log('Calendar date:', calendarDate);
	});
</script>

<input type="hidden" {name} value={date.toISOString()} aria-label={label || 'Datum'} />
<input
	type="datetime-local"
	bind:value={calendarDate}
	aria-label={label || 'Datum'}
	onchange={() => {
		date = new Date(calendarDate);
	}}
	class="w-full rounded-md border p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
/>
