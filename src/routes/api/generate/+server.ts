import { handleCompileRequest } from '$lib/compile.server';
import { generateLaTeX } from '$lib/latexTemplates';
import { requestSchema } from '$lib/schemas';
import { safeParseAsync } from 'valibot';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const contentType = request.headers.get('content-type');
	if (!contentType || !contentType.includes('application/json')) {
		return new Response(
			JSON.stringify({ error: 'Content-Type must be application/json' }),
			{ status: 415 } // 415 Unsupported Media Type
		);
	}

	try {
		const json = await request.json();
		const parsed = await safeParseAsync(requestSchema, json);

		if (!parsed.success) {
			return new Response(
				JSON.stringify({
					error: `Validation failed: ${parsed.issues.map((i) => i.message).join(', ')}`
				}),
				{ status: 400 }
			);
		}

		const { output: outputFormat } = parsed.output;

		if (outputFormat === 'pdf') {
			const pdfBuffer = await handleCompileRequest(parsed.output);
			return new Response(new Uint8Array(pdfBuffer), {
				status: 200,
				headers: {
					'Content-Type': 'application/pdf',
					'Content-Disposition': `inline; filename="document.pdf"`,
					// Content-Length helps the browser show a progress bar
					'Content-Length': pdfBuffer.length.toString()
				}
			});
		} else if (outputFormat === 'latex') {
			const laTeX = generateLaTeX(parsed.output);
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
	} catch (err) {
		console.error('Error processing request:', err);
		return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
	}
};
