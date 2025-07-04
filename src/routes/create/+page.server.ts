import {
	motionSchema,
	propositionSchema,
	validate,
	type AuthorSchema,
	type ClauseSchema
} from '$lib/schemas';
import { generateLaTeX } from '$lib/templates';
import { finalize } from '$lib/utils.svelte';
import type { Actions } from './$types';

export const actions: Actions = {
	compile: async (event) => {
		const formData = Object.fromEntries(await event.request.formData());
		preprocessFormData(formData);
		const documentType = formData.documentType?.toString();
		let result;
		switch (documentType) {
			case 'motion': {
				result = validate(formData, motionSchema);
				if (!result.ok) {
					console.error('Invalid motion data:', result.errors);
					return { error: 'Invalid motion data: ' + result.errors.join(', ') };
				} else {
					console.log('Valid motion data:', result.value);
					return { result: await finalize(result.value) };
				}
			}
			case 'proposition': {
				result = validate(formData, propositionSchema);
				if (!result.ok) {
					console.error('Invalid proposition data:', result.errors);
					return { error: 'Invalid proposition data: ' + result.errors.join(', ') };
				} else {
					console.log('Valid proposition data:', result.value);
					return { result: await finalize(result.value) };
				}
			}
			default:
				return { error: `Unknown document type: ${documentType}` };
		}
	},
	getTeX: async (event) => {
		console.log('getTeX action called');
		const formData = Object.fromEntries(await event.request.formData());
		preprocessFormData(formData);
		const documentType = formData.documentType?.toString();
		let result;
		switch (documentType) {
			case 'motion': {
				result = validate(formData, motionSchema);
				if (!result.ok) {
					console.error('Invalid motion data:', result.errors);
					return { error: 'Invalid motion data: ' + result.errors.join(', ') };
				} else {
					console.log('Valid motion data:', result.value);
					return { result: generateLaTeX(result.value) };
				}
			}
			case 'proposition': {
				result = validate(formData, propositionSchema);
				if (!result.ok) {
					console.error('Invalid proposition data:', result.errors);
					return { error: 'Invalid proposition data: ' + result.errors.join(', ') };
				} else {
					console.log('Valid proposition data:', result.value);
					return { result: generateLaTeX(result.value) };
				}
			}
			default:
				return { error: `Unknown document type: ${documentType}` };
		}
	}
};

const preprocessFormData = (formData: Record<string, unknown>): void => {
	// Since authors, clauses and files are objects,
	// we need to extract them from the formData object.
	const authors: AuthorSchema[] = extractAuthors(formData);
	const clauses: ClauseSchema[] = extractClauses(formData);
	formData.authors = authors;
	formData.clauses = clauses;
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
