import { handleCompileRequest } from '$lib/compile.server';
import { generateLaTeX } from '$lib/latexTemplates';
import { requestSchema, signImageSchema } from '$lib/schemas';
import { error } from '@sveltejs/kit';
import { safeParseAsync } from 'valibot';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, setHeaders }) => {
	const formData = await request.formData();
	const data = formData.get('data');
	if (!data) {
		error(400, 'Malformed request body. Expected field "data"');
	}

	const json = JSON.parse(JSON.stringify(data));
	console.log(json);
	console.log('type:', typeof json);
	const parsedBody = await safeParseAsync(requestSchema, JSON.parse(json));
	if (!parsedBody.success) {
		error(400, `Validation failed: ${parsedBody.issues.map((i) => i.message).join(', ')}`);
	}

	// Due to how binary data is sent, we now got the body minus the image files
	const body = parsedBody.output;

	// Try get the image files
	if ('authors' in body) {
		for (let i = 0; i < body.authors.length; i++) {
			const image = formData.get(`authors[${i}].signImage`);
			if (!image) continue;
			const parsedImage = await safeParseAsync(signImageSchema, image);
			if (!parsedImage.success) {
				error(400, `Validation failed: ${parsedImage.issues.map((i) => i.message).join(', ')}`);
			}
			const author = body.authors[i];
			author.signImage = parsedImage.output;
		}
	}

	if (body.output === 'pdf') {
		const pdfBuffer = await handleCompileRequest(body);
		return new Response(new Uint8Array(pdfBuffer), {
			status: 200,
			headers: {
				'Content-Type': 'application/pdf',
				'Content-Disposition': `inline; filename="document.pdf"`,
				// Content-Length helps the browser show a progress bar
				'Content-Length': pdfBuffer.length.toString()
			}
		});
	} else if (body.output === 'latex') {
		const laTeX = generateLaTeX(body);
		return new Response(JSON.stringify({ laTeX }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} else {
		return new Response(
			JSON.stringify({ error: 'Bad "output" format. Expected "pdf" or "latex".' }),
			{
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}
};
