import type {
	DocumentClass,
	AuthorSchema,
	ClauseSchema,
	AgendaItemSchema,
	ProposalSchema
} from '$lib/schemas';
import { SvelteDate } from 'svelte/reactivity';

export interface FormState {
	documentClass: DocumentClass;
	title: string;
	shortTitle: string;
	year: string;
	meeting: string;
	meetingType: string;
	meetingPlace: string;
	meetingDate: SvelteDate;
	adjournmentDate: SvelteDate | false;
	adjournmentPlace: string | null;
	body: string;
	demand: string;
	requirements: string[];
	merits: string[];
	authors: AuthorSchema[];
	clauses: ClauseSchema[];
	agenda: AgendaItemSchema[];
	proposals: ProposalSchema[];
	groupMotivation: string;
}

export const formState = $state<FormState>({
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
};
