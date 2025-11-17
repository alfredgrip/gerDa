import type { DocumentClass } from '$lib/schemas';
import { getContext, setContext } from 'svelte';
import { SvelteDate } from 'svelte/reactivity';

class FormState {
	isCompiling: boolean = $state(false);
	iFrameUrl: string = $state('/GUIDE.pdf');

	documentClass: DocumentClass = $state('motion');
	title: string = $state('');
	shortTitle: string = $state('');
	year: string = $state('');
	meeting: string = $state('');
	meetingType: string = $state('styrelsemöte');
	meetingPlace: string = $state('');
	meetingDate: SvelteDate = $state(new SvelteDate());
	adjournmentDate: SvelteDate | null = $state(null);
	adjournmentPlace: string | null = $state(null);
	body: string = $state('');
	demand: string = $state('');
	requirements: string = $state('');
	merits: string = $state('');
	proposalWhos: string = $state('');

	getFields() {
		return {
			documentClass: this.documentClass,
			title: this.title,
			meeting: this.meeting,
			body: this.body,
			demand: this.demand
		};
	}
}

const FORM_CONTEXT_KEY = Symbol('formContext');
export const getFormContext = () => {
	return getContext<FormState>(FORM_CONTEXT_KEY);
};
export const setFormContext = () => {
	const formState = new FormState();
	return setContext<FormState>(FORM_CONTEXT_KEY, formState);
};
