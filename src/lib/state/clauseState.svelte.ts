import type { ClauseSchema } from '$lib/schemas';
import { getContext, setContext } from 'svelte';

class ClauseState implements ClauseSchema {
	toClause: string = $state('');
	description: string = $state('');
}

class ClausesState {
	clauses: ClauseState[] = $state([new ClauseState()]);

	addClause() {
		this.clauses.push(new ClauseState());
	}

	removeClause(index: number) {
		this.clauses = this.clauses.filter((_, i) => i !== index);
	}
}

const CLAUSE_CONTEXT_KEY = Symbol('clauseContext');
export const getClauseContext = () => {
	return getContext<ClausesState>(CLAUSE_CONTEXT_KEY);
};
export const setClauseContext = () => {
	const clausesState = new ClausesState();
	return setContext<ClausesState>(CLAUSE_CONTEXT_KEY, clausesState);
};
