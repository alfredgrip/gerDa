import { compileTex, markdownToLatex } from '$lib/compile';
import {
	customSchema,
	DOCUMENT_CLASSES,
	kallelseSchema,
	kravprofilSchema,
	motionSchema,
	propositionSchema,
	styrelsensSvarSchema,
	valförslagSchema,
	validate,
	type AnySchema,
	type AuthorSchema,
	type ClauseSchema,
	type DocumentClass
} from '$lib/schemas';
import { generateLaTeX } from '$lib/templates';
import { unlink, writeFile } from 'fs/promises';
import { SvelteDate, SvelteMap } from 'svelte/reactivity';

export const submitOnSave = (e: KeyboardEvent, form: HTMLFormElement) => {
	if ((e.ctrlKey || e.metaKey) && e.key === 's') {
		e.preventDefault();
		form.requestSubmit();
	}
};

export const generateFileName = (formData: AnySchema): string => {
	const title = ('title' in formData && formData.title) || 'untitled';
	const sanitizedTitle = title.replace(/[^a-z0-9_\-.]/gi, '_');
	const date = new SvelteDate().toISOString().slice(0, 10);
	const id = crypto.randomUUID().slice(0, 8); // Shorten the UUID for the filename
	return `${formData.documentClass}-${sanitizedTitle}-${date}-${id}`;
};

export const isDocumentClass = (o: unknown): o is DocumentClass => {
	// @ts-expect-error this is safe
	return DOCUMENT_CLASSES.includes(o);
};

export async function handleMarkdown(formData: AnySchema): Promise<void> {
	// All fields that are strings should be converted to markdown
	for (const [key, value] of Object.entries(formData)) {
		if (typeof value !== 'string' || value.length === 0) continue;
		// @ts-expect-error `key` is obviously a valid key of formData
		if (value != null) formData[key] = await markdownToLatex(value);
	}
}

export async function handleCompileRequest(formData: AnySchema): Promise<string> {
	await handleMarkdown(formData);
	console.log('Finalizing form data:', formData);
	const fileName = generateFileName(formData);
	const fileNames = await writeImageFiles(formData);
	const tex = generateLaTeX(formData);
	const filePath = await compileTex(tex, fileName);
	await removeImageFiles(fileNames);
	return filePath;
}

async function writeImageFiles(formdata: AnySchema) {
	if (!('authors' in formdata) || !Array.isArray(formdata.authors)) {
		return [];
	}
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

export const switchOnDocumentClass = (
	documentClass: DocumentClass,
	processedFormData: Record<string, unknown>
) => {
	switch (documentClass) {
		case 'motion':
			return validate(processedFormData, motionSchema);
		case 'proposition':
			return validate(processedFormData, propositionSchema);
		case 'styrelsens-svar':
			return validate(processedFormData, styrelsensSvarSchema);
		case 'kallelse':
			return validate(processedFormData, kallelseSchema);
		case 'kravprofil':
			return validate(processedFormData, kravprofilSchema);
		case 'valförslag':
			return validate(processedFormData, valförslagSchema);
		case 'custom':
			return validate(processedFormData, customSchema);
	}
};

export const preprocessFormData = (formData: Record<string, unknown>): void => {
	// Since authors, clauses and files are objects,
	// we need to extract them from the formData object.
	const authors: AuthorSchema[] = extractAuthors(formData);
	const clauses: ClauseSchema[] = extractClauses(formData);
	formData.authors = authors;
	formData.clauses = clauses;
	// Dates should be converted from strings to Date objects
	if (formData.meetingDate && typeof formData.meetingDate === 'string') {
		formData.meetingDate = new SvelteDate(formData.meetingDate);
	}
};

const extractAuthors = (formData: Record<string, unknown>): AuthorSchema[] => {
	const authors: Map<string, Partial<AuthorSchema>> = new SvelteMap();
	// Iterate over formData entries to find author data
	for (const [key, value] of Object.entries(formData)) {
		if (key.startsWith('author_')) {
			// The ID is the part between 'author_' and the next underscore
			const parts = key.split('_');
			const id = parts[1];
			if (id) {
				authors.set(id, {
					...authors.get(id),
					[parts[2]]: value
				});
			}
		}
	}
	return Array.from(authors.values()).map((author) => ({
		name: author.name?.toString() ?? '',
		position: author.position?.toString() ?? '',
		signMessage: author.signMessage?.toString() ?? '',
		signImage: author.signImage?.size ? author.signImage : undefined
	}));
};

const extractClauses = (formData: Record<string, unknown>): ClauseSchema[] => {
	const clauses: Map<string, Partial<ClauseSchema>> = new SvelteMap();
	// Iterate over formData entries to find clause data
	for (const [key, value] of Object.entries(formData)) {
		if (key.startsWith('clause_')) {
			// The ID is the part between 'clause_' and the next underscore
			const parts = key.split('_');
			const id = parts[1];
			if (id) {
				clauses.set(id, {
					...clauses.get(id),
					[parts[2]]: value
				});
			}
		}
	}
	return Array.from(clauses.values()).map((clause) => ({
		toClause: clause.toClause?.toString() ?? '',
		description: clause.description?.toString() ?? ''
	}));
};
