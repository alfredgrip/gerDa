import { compileTex, markdownToLatex } from '$lib/compile';
import type { AnySchema } from '$lib/schemas';
import { generateLaTeX } from '$lib/templates';
import { unlink, writeFile } from 'fs/promises';

export const submitOnSave = (e: KeyboardEvent, form: HTMLFormElement) => {
	if ((e.ctrlKey || e.metaKey) && e.key === 's') {
		e.preventDefault();
		form.requestSubmit();
	}
};

export const generateFileName = (documentType: string, title: string): string => {
	const sanitizedTitle = title.replace(/[^a-z0-9_\-.]/gi, '_');
	const date = new Date().toISOString().slice(0, 10);
	const id = crypto.randomUUID().slice(0, 8); // Shorten the UUID for the filename
	return `${documentType}-${sanitizedTitle}-${date}-${id}`;
};

export const isDocumentType = (o: unknown): o is DocumentType => {
	return (
		typeof o === 'string' &&
		// @ts-expect-error this is fine
		DOCUMENT_TYPES.includes(o)
	);
};

export async function handleMarkdown(formData: AnySchema): Promise<void> {
	// All fields that are strings should be converted to markdown
	for (const [key, value] of Object.entries(formData)) {
		if (typeof value !== 'string' || value.length === 0) continue;
		// @ts-expect-error `key` is obviously a valid key of formData
		if (value != null) formData[key] = await markdownToLatex(value);
	}
}

export async function finalize(formData: AnySchema): Promise<string> {
	await handleMarkdown(formData);
	console.log('Finalizing form data:', formData);
	const fileName = generateFileName(formData.documentType, formData.title);
	const fileNames = await writeImageFiles(formData);
	const tex = generateLaTeX(formData);
	const filePath = await compileTex(tex, fileName);
	await removeImageFiles(fileNames);
	return filePath;
}

async function writeImageFiles(formdata: AnySchema) {
	const fileNames: string[] = [];
	for (const author of formdata.authors) {
		if (author.signImage) {
			// const id = crypto.randomUUID();
			// const ext = author.signImage.type.split('/')[1];
			// console.log(`Writing image for author ${author.name} with ID ${id} and type ${ext}`);
			// const fileName = `output/img/${id}.${ext}`;
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
