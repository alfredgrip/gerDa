import { handleCompileRequest } from '$lib/compile.server';
import { generateLaTeX } from '$lib/latexTemplates';
import { requestSchema } from '$lib/schemas';
import { readFileSync } from 'fs';
import path from 'path';
import { safeParseAsync } from 'valibot';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
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

		const { output } = parsed.output;

		if (parsed.output.output === 'pdf') {
			const relativePath = await handleCompileRequest(parsed.output);

			const absolutePath = path.resolve(
				process.cwd(),
				relativePath.startsWith('/') ? relativePath.slice(1) : relativePath
			);

			const fileBuffer = readFileSync(absolutePath);

			return new Response(fileBuffer, {
				status: 200,
				headers: {
					'Content-Type': 'application/pdf',
					'Content-Disposition': `inline; filename="document.pdf"`
				}
			});
		} else if (output === 'latex') {
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
