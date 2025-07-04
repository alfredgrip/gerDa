<script lang="ts">
	import { enhance } from '$app/forms';
	import PDFViewer from '$lib/components/PDFViewer.svelte';
	import SubmitButton from '$lib/components/SubmitButton.svelte';
	import { setAuthorContext } from '$lib/state/authorState.svelte';
	import { setClauseContext } from '$lib/state/clauseState.svelte';
	import { setFormContext } from '$lib/state/formState.svelte';

	let { children } = $props();
	let formState = setFormContext();
	let authorState = setAuthorContext();
	let clauseState = setClauseContext();

	let formElement: HTMLFormElement;
</script>

<svelte:window
	onkeydown={(e) => {
		if ((e.ctrlKey || e.metaKey) && e.key === 's') {
			e.preventDefault();
			formElement.requestSubmit();
		}
	}}
/>

<div class="flex flex-row">
	<div class="flex w-full flex-col gap-4 p-8">
		<form
			method="POST"
			action="/create?/compile"
			use:enhance={({ action }) => {
				// Before submitting the form...
				console.log('formState', formState);
				console.log('authorState', authorState);
				console.log('clauseState', clauseState);
				switch (action.search) {
					case '?/compile': {
						formState.isCompiling = true;
						// After submitting the form, this function will execute
						return async ({ update, result, action }) => {
							update({ reset: false });
							formState.isCompiling = false;
							if (result.type === 'success') {
								formState.iFrameUrl = (result.data?.result as any) || '/GUIDE.pdf';
							} else {
								console.error('Form submission failed:', result);
							}
						};
					}
					case '?/getTeX': {
						// After receiving the response:
						return async ({ update, result }) => {
							// The browser should download the TeX file
							if (result.type !== 'success') {
								console.error('Failed to get TeX:', result);
								return;
							}
							const blob = new Blob([result?.data?.result as any], { type: 'text/plain' });
							const url = URL.createObjectURL(blob);
							const a = document.createElement('a');
							a.href = url;
							a.download = `source-${new Date().toLocaleDateString('sv-SE')}.tex`;
							document.body.appendChild(a);
							a.click();
							document.body.removeChild(a);
							URL.revokeObjectURL(url);
							formState.isCompiling = false;
							update({ reset: false });
						};
					}
				}
			}}
			enctype="multipart/form-data"
			bind:this={formElement}
		>
			{@render children()}
			<SubmitButton />
		</form>
	</div>
	<PDFViewer />
</div>
