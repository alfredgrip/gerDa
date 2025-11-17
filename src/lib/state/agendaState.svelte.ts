import type { AgendaItemSchema } from '$lib/schemas';
import { getContext, setContext } from 'svelte';

class AgendaItemState implements AgendaItemSchema {
	title: string = $state('');
	type?: string | undefined = $state();
	attachments?: string | undefined = $state();
}

class AgendaState {
	items: AgendaItemState[] = $state([new AgendaItemState()]);

	addItem() {
		this.items.push(new AgendaItemState());
	}

	removeItem(index: number) {
		console.log('Removing agenda item at index:', index);
		this.items = this.items.filter((_, i) => i !== index);
	}

	getFields() {
		return this.items.map((item) => ({
			title: item.title,
			type: item.type,
			attachments: item.attachments
		}));
	}
}

const AGENDA_CONTEXT_KEY = Symbol('agendaContext');
export const getAgendaContext = () => {
	return getContext<AgendaState>(AGENDA_CONTEXT_KEY);
};
export const setAgendaContext = () => {
	const agendaState = new AgendaState();
	return setContext<AgendaState>(AGENDA_CONTEXT_KEY, agendaState);
};
