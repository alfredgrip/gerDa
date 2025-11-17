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
	type AgendaItemSchema,
	type AnySchema,
	type AuthorSchema,
	type ClauseSchema,
	type DocumentClass
} from '$lib/schemas';

export const generateFileName = (formData: AnySchema): string => {
	const title = ('title' in formData && formData.title) || 'untitled';
	const sanitizedTitle = title.replace(/[^a-z0-9_\-.]/gi, '_');
	const date = new Date().toISOString().slice(0, 10);
	const id = crypto.randomUUID().slice(0, 8); // Shorten the UUID for the filename
	return `${formData.documentClass}-${sanitizedTitle}-${date}-${id}`;
};

export const isDocumentClass = (o: unknown): o is DocumentClass => {
	// @ts-expect-error this is safe
	return DOCUMENT_CLASSES.includes(o);
};

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

export const getNaturalDocumentClass = (s: string) => {
	switch (s) {
		case 'motion':
			return 'en motion';
		case 'proposition':
			return 'en proposition';
		case 'styrelsens-svar':
			return 'ett "styrelsens svar"';
		case 'kallelse':
			return 'en kallelse';
		case 'kravprofil':
			return 'en kravprofil';
		case 'valförslag':
			return 'ett valförslag';
		case 'custom':
			return 'ett anpassat dokument';
	}
};

export const preprocessFormData = (formData: Record<string, unknown>): void => {
	// Since authors, clauses and files are objects,
	// we need to extract them from the formData object.
	const authors: AuthorSchema[] = extractAuthors(formData);
	const clauses: ClauseSchema[] = extractClauses(formData);
	const agenda: AgendaItemSchema[] = extractAgenda(formData);
	formData.authors = authors;
	formData.clauses = clauses;
	formData.agenda = agenda;
	// Dates should be converted from strings to Date objects
	if (formData.meetingDate && typeof formData.meetingDate === 'string') {
		formData.meetingDate = new Date(formData.meetingDate);
	}
	// Inputs like merits and requirements in 'valförslag' are sent as JSON strings
	for (const [key, value] of Object.entries(formData)) {
		if (key.endsWith('-JSON') && typeof value === 'string' && value) {
			formData[key.replace('-JSON', '')] = JSON.parse(value);
		}
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

const extractAgenda = (formData: Record<string, unknown>): AgendaItemSchema[] => {
	const agendaItems: Map<string, Partial<AgendaItemSchema>> = new Map();
	// Iterate over formData entries to find agenda item data
	for (const [key, value] of Object.entries(formData)) {
		if (key.startsWith('agendaItem_')) {
			const parts = key.split('_');
			const id = parts[1];
			if (id) {
				agendaItems.set(id, {
					...agendaItems.get(id),
					[parts[2]]: value
				});
			}
		}
	}
	return Array.from(agendaItems.values()).map((item) => ({
		title: item.title?.toString() ?? '',
		type: item.type?.toString() ?? '',
		attachment: Array.isArray(item.attachment) ? item.attachment : []
	}));
};
