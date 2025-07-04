import type { AuthorSchema } from '$lib/schemas';
import { getContext, setContext } from 'svelte';

class AuthorState implements AuthorSchema {
	name: string = $state('');
	position: string = $state('');
	signMessage: string = $state('');
	signImage: File | null = $state(null);
}

export class AuthorsState {
	authors: AuthorState[] = $state([new AuthorState()]);

	addAuthor() {
		this.authors.push(new AuthorState());
	}

	removeAuthor(index: number) {
		this.authors = this.authors.filter((_, i) => i !== index);
	}
}

const AUTHOR_CONTEXT_KEY = Symbol('authorContext');
export const getAuthorContext = () => {
	return getContext<AuthorsState>(AUTHOR_CONTEXT_KEY);
};
export const setAuthorContext = () => {
	const authorsState = new AuthorsState();
	return setContext<AuthorsState>(AUTHOR_CONTEXT_KEY, authorsState);
};
