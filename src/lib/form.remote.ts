import { form } from '$app/server';
import { handleCompileRequest } from '$lib/compile.server';
import { generateLaTeX } from '$lib/latexTemplates';
import { requestSchema } from '$lib/schemas';
import { error } from '@sveltejs/kit';

export const gerdaForm = form(requestSchema, async (data) => {
	const outputFormat = data.output;
	console.log(`Received request with output format: ${outputFormat}`);
	if (outputFormat === 'pdf') {
		const buffer = await handleCompileRequest(data);
		return { buffer };
	} else if (outputFormat === 'latex') {
		const laTeX = generateLaTeX(data);
		return { laTeX };
	} else {
		const s = 'Bad output format. Expected "pdf" or "latex".';
		console.error(s);
		error(400, s);
	}
});
