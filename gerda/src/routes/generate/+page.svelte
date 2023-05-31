<script lang="ts">
	import { onMount } from "svelte";

	// let searchParams = $page.url.searchParams;
	// console.log('searchParams', searchParams.toString());

	// async function generate() {
	// 	try {
	// 		console.log(`/api/generate?${searchParams}`);
	// 		const response = await fetch(`/api/compile-motion?${searchParams.toString()}`, {
	// 			method: 'GET'
	// 		});
	// 		const data = await response.text();
	// 		console.log('data', data);
	// 		console.log('does this get printed?');
	// 	} catch (error) {
	// 		console.log('error', error);
	// 	}
	// }
    /** @type {import('./$types').PageData} */
    export let data;
    onMount(() => {
        console.log('data', data);
    });
    console.log('data', data);

    async function generate() {
        try {
            const response = await fetch(`/api/compile-motion?${data}`, {
                method: 'GET'
            });
            const data = await response.text();
            console.log('data', data);
        } catch (error) {
            console.log('error', error);
        }
    }

</script>

{#await data}
    <p>Generating...</p>
{:then data}
<button on:click={generate}>Generate</button>
<h2>Generated motion</h2>
<pre>{data}</pre>
{:catch error}
<p style="color: red;">{error.message}</p>
{/await}