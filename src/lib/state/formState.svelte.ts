import { getContext, setContext } from 'svelte';

class FormState {
	isCompiling: boolean = $state(false);
	iFrameUrl: string = $state('/GUIDE.pdf');

	title: string = $state('');
	meeting: string = $state('');
	body: string = $state('');
	demand: string = $state('');
}

const FORM_CONTEXT_KEY = Symbol('formContext');
export const getFormContext = () => {
	return getContext<FormState>(FORM_CONTEXT_KEY);
};

export const setFormContext = () => {
	const formState = new FormState();
	return setContext<FormState>(FORM_CONTEXT_KEY, formState);
};
