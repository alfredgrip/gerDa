import {
	customSchema,
	kallelseSchema,
	kravprofilSchema,
	motionSchema,
	propositionSchema,
	styrelsensSvarSchema,
	valförslagSchema,
	validate,
	type AuthorSchema,
	type ClauseSchema,
	type DocumentClass
} from '$lib/schemas';
import { generateLaTeX } from '$lib/templates';
import { handleCompileRequest, isDocumentClass } from '$lib/utils.svelte';
import type { Actions } from './$types';

export const actions: Actions = {
	compile: async (event): Promise<{ result?: string; error?: string }> => {
		const formData = Object.fromEntries(await event.request.formData());
		preprocessFormData(formData);
		console.log('Compile action called with formData:', formData);
		const documentClass = formData.documentClass;
		if (!isDocumentClass(documentClass)) {
			console.error('Unknown document class:', documentClass);
			return { error: `Unknown document class: ${documentClass}` };
		}
		const result = switchOnDocumentClass(documentClass, formData);
		if (!result.ok) {
			console.error(`Invalid ${documentClass} data:`, result.errors);
			return { error: `Invalid ${documentClass} data: ` + result.errors.join(', ') };
		} else {
			console.log(`Valid ${documentClass} data:`, result.value);
			return { result: await handleCompileRequest(result.value) };
		}
	},
	getTeX: async (event): Promise<{ result?: string; error?: string }> => {
		console.log('getTeX action called');
		const formData = Object.fromEntries(await event.request.formData());
		preprocessFormData(formData);
		const documentClass = formData.documentClass;
		if (!isDocumentClass(documentClass)) {
			console.error('Unknown document class:', documentClass);
			return { error: `Unknown document class: ${documentClass}` };
		}
		const result = switchOnDocumentClass(documentClass, formData);
		if (!result.ok) {
			console.error(`Invalid ${documentClass} data:`, result.errors);
			return { error: `Invalid ${documentClass} data: ` + result.errors.join(', ') };
		} else {
			console.log(`Valid ${documentClass} data:`, result.value);
			return { result: generateLaTeX(result.value) };
		}
	}
};

const switchOnDocumentClass = (
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

const preprocessFormData = (formData: Record<string, unknown>): void => {
	// Since authors, clauses and files are objects,
	// we need to extract them from the formData object.
	const authors: AuthorSchema[] = extractAuthors(formData);
	const clauses: ClauseSchema[] = extractClauses(formData);
	formData.authors = authors;
	formData.clauses = clauses;
	// Dates should be converted from strings to Date objects
	if (formData.meetingDate && typeof formData.meetingDate === 'string') {
		formData.meetingDate = new Date(formData.meetingDate);
	}
};

const extractAuthors = (formData: Record<string, unknown>): AuthorSchema[] => {
	const authors: Map<string, Partial<AuthorSchema>> = new Map();
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
	const clauses: Map<string, Partial<ClauseSchema>> = new Map();
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
