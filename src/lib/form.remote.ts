import { form } from '$app/server';
import { handleCompileRequest } from '$lib/compile.server';
import { generateLaTeX } from '$lib/latexTemplates';
import { requestSchema } from '$lib/schemas';
import { error } from '@sveltejs/kit';

export const gerdaForm = form(requestSchema, async (data) => {
	console.log('form data; ', data);
	if (data.output === 'pdf') {
		const filePath = await handleCompileRequest(data);
		return { filePath };
	} else if (data.output === 'latex') {
		const laTeX = generateLaTeX(data);
		console.log('LaTeX generated: ', laTeX);
		return { laTeX };
	} else {
		const s = 'Bad output format. Expected "pdf" or "latex".';
		console.error(s);
		error(400, s);
	}
});
