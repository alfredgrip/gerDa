import { generateLaTeX } from '$lib/latexTemplates';
import type { AnySchema } from '$lib/schemas';
import { generateFileName } from '$lib/utils';
import { execaCommand } from 'execa';
import { mkdir, readdir, stat, unlink, writeFile } from 'node:fs/promises';
import path from 'path';

const TEX_DIR = 'output/tex';
const PDF_DIR = 'output/pdf';
const IMAGE_DIR = 'output/img';

export async function compileTex(tex: string, fileName: string): Promise<string> {
	console.log(`Compiling LaTeX to PDF: ${fileName}`);

	await ensureDirs();
	await deleteOldestFile(PDF_DIR);

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

	const { stdout: compileStdOut, stderr: compileStdErr } = await execaCommand(compileCommand);
	console.log(compileStdOut);

	unlink(texFilePath).catch((err) => {
		console.error(`Failed to delete temporary file ${texFilePath}:`, err);
	});

	if (compileStdErr) console.error(compileStdErr);

	// Move PDF to output directory
	const { stdout: mvStdOut, stderr: mvStdErr } = await execaCommand(
		`mv ${TEX_DIR}/${fileName}.pdf ${PDF_DIR}`
	);
	console.log(mvStdOut);
	if (mvStdErr) console.error(mvStdErr);

	const result = path.join('/', PDF_DIR, `${fileName}.pdf`);
	console.log(`PDF compiled successfully: ${result}`);
	return result;
}

async function ensureDirs() {
	await Promise.all([
		mkdir(TEX_DIR, { recursive: true }),
		mkdir(PDF_DIR, { recursive: true }),
		mkdir(IMAGE_DIR, { recursive: true })
	]);
}

async function deleteOldestFile(dir: string, keep: number = 10) {
	const files = await readdir(dir);
	if (files.length >= keep) {
		const withStats = await Promise.all(
			files.map(async (file) => ({
				name: file,
				time: (await stat(path.join(dir, file))).mtimeMs
			}))
		);
		const oldest = withStats.reduce((a, b) => (a.time < b.time ? a : b));
		await unlink(path.join(dir, oldest.name));
	}
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

export async function handleCompileRequest(formData: AnySchema): Promise<string> {
	console.log('Handling compile request with formData:', formData);
	await handleMarkdown(formData);
	console.log('Finalizing form data:', formData);
	const fileName = generateFileName(formData);
	const fileNames = await writeImageFiles(formData);
	const tex = generateLaTeX(formData);
	const filePath = await compileTex(tex, fileName);
	await removeImageFiles(fileNames);
	return filePath;
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
