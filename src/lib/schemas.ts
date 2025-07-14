export const DOCUMENT_CLASSES = [
	'motion',
	'proposition',
	'styrelsens-svar',
	'kallelse',
	'kravprofil',
	'valförslag',
	'custom'
] as const;
export type DocumentClass = (typeof DOCUMENT_CLASSES)[number];

const authorSchema = {
	name: isString,
	position: isString,
	signMessage: isString,
	signImage: nullable(isFile),
	path: nullable(isString)
};
export type AuthorSchema = InferSchema<typeof authorSchema>;

const clauseSchema = {
	toClause: isString,
	description: nullable(isString)
};
export type ClauseSchema = InferSchema<typeof clauseSchema>;

export const motionSchema = {
	documentClass: literal('motion'),
	title: isString,
	meeting: isString,
	body: isString,
	demand: nullable(isString),
	clauses: nonEmptyArrayOf(isClause),
	authors: nonEmptyArrayOf(isAuthor)
};
export type MotionSchema = InferSchema<typeof motionSchema>;

export const propositionSchema = {
	documentClass: literal('proposition'),
	title: isString,
	meeting: isString,
	body: isString,
	demand: nullable(isString),
	clauses: nonEmptyArrayOf(isClause),
	authors: nonEmptyArrayOf(isAuthor)
};
export type PropositionSchema = InferSchema<typeof propositionSchema>;

export const styrelsensSvarSchema = {
	documentClass: literal('styrelsens-svar'),
	title: isString,
	meeting: isString,
	body: isString,
	demand: nullable(isString),
	clauses: nonEmptyArrayOf(isClause),
	authors: nonEmptyArrayOf(isAuthor)
};
export type StyrelsensSvarSchema = InferSchema<typeof styrelsensSvarSchema>;

export const kallelseSchema = {
	documentClass: literal('kallelse'),
	meeting: isString,
	meetingType: isString,
	meetingPlace: isString,
	meetingDate: isDate,
	adjournmentDate: nullable(isDate),
	adjournmentPlace: nullable(isString),
	agenda: arrayOf(isAgendaItem),
	body: isString,
	authors: nonEmptyArrayOf(isAuthor)
};
export type KallelseSchema = InferSchema<typeof kallelseSchema>;

export const kravprofilSchema = {
	documentClass: literal('kravprofil'),
	meeting: isString,
	position: isString,
	year: isString,
	description: nullable(isString),
	requirements: nonEmptyArrayOf(isString),
	merits: arrayOf(isString)
};
export type KravprofilSchema = InferSchema<typeof kravprofilSchema>;

export const valförslagSchema = {
	documentClass: literal('valförslag'),
	title: isString,
	meeting: isString,
	body: isString,
	proposals: nonEmptyArrayOf(isProposal),
	statistics: nonEmptyArrayOf(isStatistics),
	authors: nonEmptyArrayOf(isAuthor)
};
export type ValförslagSchema = InferSchema<typeof valförslagSchema>;

export const customSchema = {
	documentClass: literal('custom'),
	title: isString,
	shortTitle: isString,
	meeting: isString,
	body: isString,
	authors: nonEmptyArrayOf(isAuthor)
};
export type CustomSchema = InferSchema<typeof customSchema>;

export type AnySchema =
	| MotionSchema
	| PropositionSchema
	| StyrelsensSvarSchema
	| KallelseSchema
	| KravprofilSchema
	| ValförslagSchema
	| CustomSchema;

export type AllFieldsSchema = {
	documentClass: DocumentClass;
	title: string;
	shortTitle: string;
	meeting: string;
	meetingType: string;
	meetingPlace: string;
	meetingDate: Date;
	adjournmentDate: Date | null;
	adjournmentPlace: string | null;
	agenda: AgendaItemSchema[];
	year: string;
	body: string;
	demand: string;
	clauses: ClauseSchema[];
	authors: AuthorSchema[];
	position: string;
};

// -----------------------------------------------------------------------------

type Validator<T> = (v: unknown) => v is T;
type Schema =
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	| Validator<any> // leaf
	| { [k: string]: Schema }; // branch

type InferSchema<S> =
	/** ─────────── Leaf ─────────── */
	Prettify<
		S extends Validator<infer T>
			? T
			: /** ───────── Branch ───────── */
				S extends { [K in keyof S]: Schema }
				? _SplitOptional<{ [K in keyof S]: InferSchema<S[K]> }>
				: never
	>;

/* Helper that makes `K?: …` when the value still contains `undefined` */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type _SplitOptional<O extends Record<string, any>> =
	// required part  (undefined NOT present)
	{
		[K in keyof O as undefined extends O[K] ? never : K]: O[K];
	} & { [K in keyof O as undefined extends O[K] ? K : never]?: Exclude<O[K], undefined> }; // optional part (undefined present ➜ mark `?`, then drop the `undefined`)

type ValidationResult<T> = { ok: true; value: T } | { ok: false; errors: string[] };

// makes Date and File look ugly, but overall looks better
type Prettify<T> = {
	[K in keyof T]: T[K];
} & {};

// -----------------------------------------------------------------------------

function nullable<T>(v: Validator<T>): Validator<T | null | undefined> {
	return function nullableValidator(x: unknown): x is T | null | undefined {
		return x === null || x === undefined || v(x);
	};
}

function literal<T extends string | number | boolean>(val: T): Validator<T> {
	return function literalValidator(x: unknown): x is T {
		return x === val;
	};
}

function isString(v: unknown): v is string {
	return typeof v === 'string';
}

function isDate(v: unknown): v is Date {
	return v instanceof Date && !isNaN(v.getTime());
}

function isFile(v: unknown): v is File {
	return v instanceof File;
}

function isAgendaItem(v: unknown): v is { title: string; type?: string; attachment?: string[] } {
	return (
		typeof v === 'object' &&
		v !== null &&
		typeof (v as { title?: unknown }).title === 'string' &&
		((v as { type?: unknown }).type === undefined ||
			typeof (v as { type: unknown }).type === 'string') &&
		((v as { attachment?: unknown }).attachment === undefined ||
			(Array.isArray((v as { attachment: unknown }).attachment) &&
				// @ts-expect-error validation
				(v as { attachment: unknown }).attachment.every((item) => typeof item === 'string')))
	);
}
export type AgendaItemSchema = InferSchema<typeof isAgendaItem>;

function isProposal(v: unknown): v is { what: string; who: string[] } {
	return (
		typeof v === 'object' &&
		v !== null &&
		typeof (v as { what?: unknown }).what === 'string' &&
		Array.isArray((v as { who?: unknown }).who) &&
		// @ts-expect-error validation
		(v as { who: unknown }).who.every((item) => typeof item === 'string')
	);
}
export type ProposalSchema = InferSchema<typeof isProposal>;

function isStatistics(v: unknown): v is { what: string; interval: string } {
	return (
		typeof v === 'object' &&
		v !== null &&
		typeof (v as { what?: unknown }).what === 'string' &&
		typeof (v as { interval?: unknown }).interval === 'string'
	);
}
export type StatisticsSchema = InferSchema<typeof isStatistics>;

function arrayOf<T>(elem: Validator<T>, min = 0): Validator<T[]> {
	return function arrayValidator(x: unknown): x is T[] {
		return Array.isArray(x) && x.length >= min && x.every(elem);
	};
}

function nonEmptyArrayOf<T>(elem: Validator<T>): Validator<T[]> {
	return arrayOf(elem, 1);
}

function makeValidator<S extends Schema>(schema: S) {
	return function schemaValidator(data: unknown): data is InferSchema<S> {
		return CHECK_SCHEMA(data, schema).valid;
	};
}

function isClause(v: unknown): v is ClauseSchema {
	return makeValidator(clauseSchema)(v);
}

function isAuthor(v: unknown): v is AuthorSchema {
	return makeValidator(authorSchema)(v);
}

// -----------------------------------------------------------------------------

// Wraps the schema validation in a function that returns a ValidationResult
export function validate<S extends Schema>(
	data: unknown,
	schema: S
): ValidationResult<InferSchema<S>> {
	const result = CHECK_SCHEMA(data, schema);
	return result.valid
		? { ok: true, value: data as InferSchema<S> }
		: { ok: false, errors: result.errors };
}

function CHECK_SCHEMA(data: unknown, schema: Schema, path = '') {
	const errors: string[] = [];

	// leaf
	if (typeof schema === 'function') {
		const ok = schema(data);
		if (!ok) errors.push(path || '(root)');
		return { valid: ok, errors };
	}

	// branch: must be object
	if (typeof data !== 'object' || data === null) {
		errors.push(path || '(root)');
		return { valid: false, errors };
	}

	// recurse
	for (const key of Object.keys(schema)) {
		const childPath = path ? `${path}.${key}` : key;
		const child = (data as Record<string, unknown>)[key];
		const childResult = CHECK_SCHEMA(child, schema[key], childPath);
		errors.push(...childResult.errors);
	}

	return { valid: errors.length === 0, errors };
}
