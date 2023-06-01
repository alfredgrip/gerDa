<script lang="ts">
	import { onMount } from "svelte";
    import { page } from '$app/stores';

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

    let responseData;
    let searchParams = $page.url.searchParams;

    /** @type {import('./$types').PageData} */
    //export let data;
    onMount(() => {
        //console.log('data onMount', data);
        generate();
        
    });
    //console.log('data', data);

    async function generate() {
        try {
            const response = await fetch(`/api/compile-motion?${searchParams.toString()}`, {
                method: 'GET'
            });
            const data = await response.text();
            console.log('data from generate', data);
            responseData = data;
        } catch (error) {
            console.log('error', error);
        }
    }

</script>

{#await responseData}
    <p>Generating...</p>
{:then responseData}
<button>Generate</button>
<h2>Generated motion</h2>
<pre>{responseData}</pre>
{:catch error}
<p style="color: red;">{error.message}</p>
{/await}