// https://www.reddit.com/r/sveltejs/comments/1d43d8p/svelte_5_runes_with_localstorage_thanks_to_joy_of/
import { browser } from '$app/environment';
import type { AllFieldsSchema, DocumentClass } from '$lib/schemas';

export interface Draft extends Partial<AllFieldsSchema> {
	id: string;
	lastEdit: number; // Timestamp of the last edit
	documentClass: DocumentClass;
}

export class LocalDraftsStore {
	currentDraftIdKey: string = 'gerdaCurrentDraftId';
	currentDraftId: string | null = $state(null);
	draftsKey: string = 'gerdaDrafts';
	drafts: Draft[] = $state([]);

	constructor() {
		if (browser) {
			const localDrafts = localStorage.getItem(this.draftsKey);
			if (localDrafts) this.drafts = this.deserialize(localDrafts);
			const currentDraftId = localStorage.getItem(this.currentDraftIdKey);
			if (currentDraftId) this.currentDraftId = JSON.parse(currentDraftId);
		}

		$effect.root(() => {
			$effect(() => {
				localStorage.setItem(this.draftsKey, this.serialize(this.drafts));
				localStorage.setItem(this.currentDraftIdKey, JSON.stringify(this.currentDraftId));
			});
			return () => {};
		});
	}

	serialize(value: Draft[]): string {
		return JSON.stringify(value);
	}

	deserialize(item: string): Draft[] {
		return JSON.parse(item);
	}

	addDraft(draft: Omit<Draft, 'id' | 'lastEdit'>) {
		this.drafts.push({ ...draft, id: crypto.randomUUID(), lastEdit: Date.now() });
	}

	removeDraft(id: string) {
		this.drafts = this.drafts.filter((draft) => draft.id !== id);
	}

	getDraft(id: string | null): Draft | undefined {
		if (!id) return undefined;
		return this.drafts.find((draft) => draft.id === id);
	}

	updateDraft(id: string, updatedFields: Omit<Partial<Draft>, 'id' | 'lastEdit'>) {
		const draftIndex = this.drafts.findIndex((draft) => draft.id === id);
		if (draftIndex !== -1) {
			this.drafts[draftIndex] = {
				...this.drafts[draftIndex],
				...updatedFields,
				lastEdit: Date.now() // Update last edit timestamp
			};
		} else {
			console.warn(`Draft with id ${id} not found`);
		}
	}
}

export const draftStore = new LocalDraftsStore();
