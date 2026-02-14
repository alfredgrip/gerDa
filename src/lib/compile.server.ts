import { NODE_ENV } from '$env/static/private';
import { generateLaTeX } from '$lib/latexTemplates';
import type { AnySchema } from '$lib/schemas';
import { generateFileName } from '$lib/utils';
import { execaCommand } from 'execa';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'path';

const TEX_DIR = 'output/tex';
const PDF_DIR = 'output/pdf';
const IMAGE_DIR = 'output/img';

export async function handleCompileRequest(formData: AnySchema): Promise<Buffer> {
	if (NODE_ENV !== 'production') {
		await ensureDirs();
	}
	await handleMarkdown(formData);
	const fileName = generateFileName(formData);
	const fileNames = await writeImageFiles(formData);
	const tex = generateLaTeX(formData);

	const pdfBuffer = await compileTex(tex, fileName);

	await removeImageFiles(fileNames);
	console.log(`Sucessfully compiled ${fileName}.tex to PDF.`);
	return pdfBuffer;
}

export async function compileTex(tex: string, fileName: string): Promise<Buffer> {
	const texFilePath = path.join(TEX_DIR, `${fileName}.tex`);
	await writeFile(texFilePath, tex);

	const compileCommand = [
		'tectonic',
		'-X compile',
		`${texFilePath}`,
		`-Z search-path=dsekdocs`,
		`-Z search-path=${IMAGE_DIR}`,
		`-Z continue-on-errors`
	].join(' ');

	const { stderr: compileStdErr } = await execaCommand(compileCommand);

	unlink(texFilePath).catch((err) => {
		console.error(`Failed to delete temporary file ${texFilePath}:`, err);
	});

	if (compileStdErr) console.error(compileStdErr);

	const tempPdfPath = path.join(TEX_DIR, `${fileName}.pdf`);
	const finalPdfPath = path.join(PDF_DIR, `${fileName}.pdf`);

	await execaCommand(`mv ${tempPdfPath} ${finalPdfPath}`);

	const pdfBuffer = await readFile(finalPdfPath);

	unlink(finalPdfPath).catch((err) => console.error(`Cleanup error:`, err));

	return pdfBuffer;
}

export async function ensureDirs() {
	await Promise.all([
		mkdir(TEX_DIR, { recursive: true }),
		mkdir(PDF_DIR, { recursive: true }),
		mkdir(IMAGE_DIR, { recursive: true })
	]);
}

export async function markdownToLatex(markdown: string): Promise<string> {
	if (!markdown || markdown.trim().length === 0) {
		return '';
	}
	const { stdout } = await execaCommand('pandoc -f markdown -t latex', {
		input: markdown
	});
	return stdout;
}

async function handleMarkdown(formData: AnySchema): Promise<void> {
	// All fields that are strings should be converted to markdown
	for (const [key, value] of Object.entries(formData)) {
		if (typeof value !== 'string' || value.length === 0) continue;
		// @ts-expect-error `key` is obviously a valid key of formData
		if (value != null) formData[key] = await markdownToLatex(value);
	}
}

async function writeImageFiles(formData: AnySchema) {
	if (!('authors' in formData) || !Array.isArray(formData.authors)) {
		return [];
	}
	const fileNames: string[] = [];
	for (const author of formData.authors) {
		if (author.signImage) {
			const fileName = `output/img/${author.signImage.name}`;
			await writeFile(fileName, Buffer.from(await author.signImage.arrayBuffer()));
			fileNames.push(fileName);
		}
	}
	return fileNames;
}

async function removeImageFiles(fileNames: string[]) {
	for (const fileName of fileNames) {
		try {
			await unlink(fileName);
		} catch (error) {
			console.error(`Failed to remove file ${fileName}:`, error);
		}
	}
}
