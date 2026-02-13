import * as v from 'valibot';

export const DOCUMENT_CLASSES = [
	'motion',
	'proposition',
	'styrelsens-svar',
	'kallelse',
	'kravprofil',
	'valförslag',
	'handling',
	'custom'
] as const;
export type DocumentClass = (typeof DOCUMENT_CLASSES)[number];

export const isDocumentClass = (s: unknown): s is DocumentClass => {
	// @ts-expect-error this is safe
	return typeof s === 'string' && DOCUMENT_CLASSES.includes(s);
};

export const authorSchema = v.object({
	name: v.string(),
	position: v.string(),
	signMessage: v.string(),
	signImage: v.optional(v.union([v.instance(File), v.literal(false)]), false)
});

export type AuthorSchema = v.InferOutput<typeof authorSchema>;

export const clauseSchema = v.object({
	toClause: v.string(),
	description: v.string()
});

export type ClauseSchema = v.InferOutput<typeof clauseSchema>;

export const motionSchema = v.object({
	documentClass: v.literal('motion'),
	title: v.string(),
	meeting: v.string(),
	body: v.string(),
	demand: v.optional(v.string(), ''),
	clauses: v.array(clauseSchema),
	authors: v.array(authorSchema)
});

export type MotionSchema = v.InferOutput<typeof motionSchema>;

export const propositionSchema = v.object({
	documentClass: v.literal('proposition'),
	title: v.string(),
	meeting: v.string(),
	body: v.string(),
	demand: v.optional(v.string(), ''),
	clauses: v.array(clauseSchema),
	authors: v.array(authorSchema)
});
export type PropositionSchema = v.InferOutput<typeof propositionSchema>;

export const styrelsensSvarSchema = v.object({
	documentClass: v.literal('styrelsens-svar'),
	title: v.string(),
	meeting: v.string(),
	body: v.string(),
	demand: v.optional(v.string(), ''),
	clauses: v.array(clauseSchema),
	authors: v.array(authorSchema)
});
export type StyrelsensSvarSchema = v.InferOutput<typeof styrelsensSvarSchema>;

const agendaItemSchema = v.object({
	title: v.string(),
	type: v.string(),
	attachments: v.array(v.string())
});

export type AgendaItemSchema = v.InferOutput<typeof agendaItemSchema>;

export const kallelseSchema = v.object({
	documentClass: v.literal('kallelse'),
	title: v.string(),
	meeting: v.string(),
	meetingType: v.string(),
	meetingPlace: v.string(),
	meetingDate: v.union([v.pipe(v.string(), v.isoDateTime()), v.literal('')]),
	adjournmentDate: v.optional(v.union([v.pipe(v.string(), v.isoDateTime()), v.literal('')]), ''),
	adjournmentPlace: v.optional(v.string(), ''),
	agenda: v.optional(v.array(agendaItemSchema), []),
	body: v.optional(v.string(), ''),
	authors: v.array(authorSchema)
});
export type KallelseSchema = v.InferOutput<typeof kallelseSchema>;

export const kravprofilSchema = v.object({
	documentClass: v.literal('kravprofil'),
	title: v.string(),
	position: v.string(),
	description: v.string(),
	year: v.string(),
	requirements: v.array(v.string()),
	merits: v.array(v.string())
});
export type KravprofilSchema = v.InferOutput<typeof kravprofilSchema>;

export const proposalSchema = v.object({
	position: v.string(),
	who: v.array(v.string()),
	statistics: v.optional(v.string(), '')
});
export type ProposalSchema = v.InferOutput<typeof proposalSchema>;

export const valförslagSchema = v.object({
	documentClass: v.literal('valförslag'),
	title: v.string(),
	meeting: v.string(),
	body: v.string(),
	demand: v.optional(v.string(), ''),
	proposals: v.array(proposalSchema),
	groupMotivation: v.optional(v.string()),
	authors: v.array(authorSchema),
	clauses: v.array(clauseSchema)
});
export type ValförslagSchema = v.InferOutput<typeof valförslagSchema>;

export const handlingSchema = v.object({
	documentClass: v.literal('handling'),
	title: v.string(),
	meeting: v.string(),
	body: v.string(),
	authors: v.array(authorSchema)
});
export type HandlingSchema = v.InferOutput<typeof handlingSchema>;

export const customSchema = v.object({
	documentClass: v.literal('custom'),
	title: v.string(),
	shortTitle: v.string(),
	meeting: v.string(),
	body: v.string(),
	authors: v.array(authorSchema)
});
export type CustomSchema = v.InferOutput<typeof customSchema>;

export const anySchema = v.variant('documentClass', [
	motionSchema,
	propositionSchema,
	styrelsensSvarSchema,
	kallelseSchema,
	kravprofilSchema,
	valförslagSchema,
	handlingSchema,
	customSchema
]);
export type AnySchema = v.InferOutput<typeof anySchema>;

export const requestSchema = v.intersect([
	anySchema,
	v.object({
		output: v.picklist(['pdf', 'latex'])
	})
]);
export type RequestSchema = v.InferOutput<typeof requestSchema>;

export type AllFieldsSchema = {
	documentClass: DocumentClass;
	title: string;
	shortTitle: string;
	meeting: string;
	meetingType: string;
	meetingPlace: string;
	meetingDate: Date | '';
	adjournmentDate: Date | '';
	adjournmentPlace: string | null;
	agenda: AgendaItemSchema[];
	year: string;
	body: string;
	demand: string;
	clauses: ClauseSchema[];
	authors: AuthorSchema[];
	position: string;
	requirements: string[];
	merits: string[];
	proposals: ProposalSchema[];
	groupMotivation: string;
};
