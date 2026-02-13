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
	signImage: v.fallback(v.union([v.instance(File), v.literal(false)]), false)
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
	demand: v.string(),
	clauses: v.pipe(v.array(clauseSchema), v.minLength(1)),
	authors: v.pipe(v.array(authorSchema), v.minLength(1))
});

export type MotionSchema = v.InferOutput<typeof motionSchema>;

export const propositionSchema = v.object({
	documentClass: v.literal('proposition'),
	title: v.fallback(v.string(), ''),
	meeting: v.fallback(v.string(), ''),
	body: v.fallback(v.string(), ''),
	demand: v.fallback(v.string(), ''),
	clauses: v.fallback(v.pipe(v.array(clauseSchema), v.minLength(1)), [
		{ toClause: '', description: '' }
	]),
	authors: v.fallback(v.pipe(v.array(authorSchema), v.minLength(1)), [
		{ name: '', position: '', signMessage: '', signImage: false }
	])
});
export type PropositionSchema = v.InferOutput<typeof propositionSchema>;

export const styrelsensSvarSchema = v.object({
	documentClass: v.literal('styrelsens-svar'),
	title: v.fallback(v.string(), ''),
	meeting: v.fallback(v.string(), ''),
	body: v.fallback(v.string(), ''),
	demand: v.fallback(v.string(), ''),
	clauses: v.fallback(v.pipe(v.array(clauseSchema), v.minLength(1)), [
		{ toClause: '', description: '' }
	]),
	authors: v.fallback(v.pipe(v.array(authorSchema), v.minLength(1)), [
		{ name: '', position: '', signMessage: '', signImage: false }
	])
});
export type StyrelsensSvarSchema = v.InferOutput<typeof styrelsensSvarSchema>;

const agendaItemSchema = v.object({
	title: v.string(),
	type: v.string(),
	attachments: v.array(v.string())
});

export type AgendaItemSchema = v.InferOutput<typeof agendaItemSchema>;

export const kallelseSchema = v.object({
	title: v.fallback(v.string(), ''),
	documentClass: v.literal('kallelse'),
	meeting: v.fallback(v.string(), ''),
	meetingType: v.fallback(v.string(), ''),
	meetingPlace: v.fallback(v.string(), ''),
	meetingDate: v.fallback(v.union([v.pipe(v.string(), v.isoDateTime()), v.literal(false)]), false),
	adjournmentDate: v.fallback(
		v.union([v.pipe(v.string(), v.isoDateTime()), v.literal(false)]),
		false
	),
	adjournmentPlace: v.fallback(v.string(), ''),
	agenda: v.array(agendaItemSchema),
	body: v.fallback(v.string(), ''),
	authors: v.fallback(v.pipe(v.array(authorSchema), v.minLength(1)), [
		{ name: '', position: '', signMessage: '', signImage: false }
	])
});
export type KallelseSchema = v.InferOutput<typeof kallelseSchema>;

export const kravprofilSchema = v.object({
	documentClass: v.literal('kravprofil'),
	title: v.fallback(v.string(), ''),
	meeting: v.fallback(v.string(), ''),
	position: v.fallback(v.string(), ''),
	description: v.fallback(v.string(), ''),
	year: v.fallback(v.string(), ''),
	body: v.fallback(v.string(), ''),
	requirements: v.pipe(v.array(v.string()), v.minLength(1)),
	merits: v.array(v.string())
});
export type KravprofilSchema = v.InferOutput<typeof kravprofilSchema>;

export const proposalSchema = v.object({
	position: v.string(),
	who: v.array(v.string()),
	statistics: v.fallback(v.string(), '')
});
export type ProposalSchema = v.InferOutput<typeof proposalSchema>;

export const valförslagSchema = v.object({
	documentClass: v.literal('valförslag'),
	title: v.string(),
	meeting: v.string(),
	body: v.string(),
	demand: v.fallback(v.string(), ''),
	proposals: v.pipe(v.array(proposalSchema)),
	groupMotivation: v.optional(v.string()),
	authors: v.fallback(v.pipe(v.array(authorSchema), v.minLength(1)), [
		{ name: '', position: '', signMessage: '', signImage: false }
	]),
	clauses: v.pipe(v.array(clauseSchema))
});
export type ValförslagSchema = v.InferOutput<typeof valförslagSchema>;

export const handlingSchema = v.object({
	documentClass: v.literal('handling'),
	title: v.fallback(v.string(), ''),
	meeting: v.fallback(v.string(), ''),
	body: v.fallback(v.string(), ''),
	authors: v.fallback(v.pipe(v.array(authorSchema), v.minLength(1)), [
		{ name: '', position: '', signMessage: '', signImage: false }
	])
});
export type HandlingSchema = v.InferOutput<typeof handlingSchema>;

export const customSchema = v.object({
	documentClass: v.literal('custom'),
	title: v.fallback(v.string(), ''),
	shortTitle: v.fallback(v.string(), ''),
	meeting: v.fallback(v.string(), ''),
	body: v.fallback(v.string(), ''),
	authors: v.fallback(v.pipe(v.array(authorSchema), v.minLength(1)), [
		{ name: '', position: '', signMessage: '', signImage: false }
	])
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
	meetingDate: Date;
	adjournmentDate: Date | false;
	adjournmentPlace: string | null;
	agenda: AgendaItemSchema[];
	year: string;
	body: string;
	demand: string;
	clauses: ClauseSchema[];
	authors: AuthorSchema[];
	requirements: string[];
	merits: string[];
	proposals: ProposalSchema[];
	groupMotivation: string;
};
