import type { AllFieldsSchema } from '$lib/schemas';

const EMPTY_FORM_STATE: AllFieldsSchema = {
	documentClass: 'motion',
	title: '',
	shortTitle: '',
	year: '',
	meeting: '',
	meetingType: 'styrelsemöte',
	meetingPlace: '',
	meetingDate: new Date(),
	adjournmentDate: '',
	adjournmentPlace: null,
	body: '',
	demand: '',
	position: '',
	requirements: [],
	merits: [],
	authors: [{ name: '', position: '', signMessage: '', signImage: false }],
	clauses: [{ toClause: '', description: '' }],
	agenda: [],
	proposals: [{ position: '', who: [], statistics: '' }],
	groupMotivation: ''
};

export const formState = $state<AllFieldsSchema>(JSON.parse(JSON.stringify(EMPTY_FORM_STATE)));

export const resetFormState = () => {
	Object.assign(formState, JSON.parse(JSON.stringify(EMPTY_FORM_STATE)));
};
