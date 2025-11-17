import type { ProposalSchema } from '$lib/schemas';
import { getContext, setContext } from 'svelte';

class ProposalState implements ProposalSchema {
	position: string = $state('');
	who: string[] = $state([]);
}

export class ProposalsState {
	proposals: ProposalState[] = $state([new ProposalState()]);

	addProposal() {
		this.proposals.push(new ProposalState());
	}

	removeProposal(index: number) {
		this.proposals = this.proposals.filter((_, i) => i !== index);
	}

	getFields(): ProposalState[] {
		return this.proposals.map((proposal) => ({
			position: proposal.position,
			who: proposal.who
		}));
	}
}

const PROPOSAL_CONTEXT_KEY = Symbol('proposalContext');
export const getProposalContext = () => {
	return getContext<ProposalsState>(PROPOSAL_CONTEXT_KEY);
};
export const setProposalContext = () => {
	const proposalsState = new ProposalsState();
	return setContext<ProposalsState>(PROPOSAL_CONTEXT_KEY, proposalsState);
};
