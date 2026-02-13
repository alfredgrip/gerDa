import type { AllFieldsSchema } from '$lib/schemas';
import { SvelteDate } from 'svelte/reactivity';

export const formState = $state<AllFieldsSchema>({
	documentClass: 'motion',
	title: '',
	shortTitle: '',
	year: '',
	meeting: '',
	meetingType: 'styrelsemöte',
	meetingPlace: '',
	meetingDate: new SvelteDate(),
	adjournmentDate: false,
	adjournmentPlace: null,
	body: '',
	demand: '',
	requirements: [],
	merits: [],
	authors: [{ name: '', position: '', signMessage: '', signImage: false }],
	clauses: [{ toClause: '', description: '' }],
	agenda: [],
	proposals: [{ position: '', who: [], statistics: '' }],
	groupMotivation: ''
});

export const resetFormState = () => {
	formState.documentClass = 'motion';
	formState.title = '';
	formState.shortTitle = '';
	formState.year = '';
	formState.meeting = '';
	formState.meetingType = 'styrelsemöte';
	formState.meetingPlace = '';
	formState.meetingDate = new SvelteDate();
	formState.adjournmentDate = false;
	formState.adjournmentPlace = null;
	formState.body = '';
	formState.demand = '';
	formState.requirements = [];
	formState.merits = [];
	formState.authors = [{ name: '', position: '', signMessage: '', signImage: false }];
	formState.clauses = [{ toClause: '', description: '' }];
	formState.agenda = [];
	formState.proposals = [];
	formState.groupMotivation = '';
};
