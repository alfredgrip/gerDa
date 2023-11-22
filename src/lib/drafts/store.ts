import { writable } from 'svelte/store';
import type { Draft } from './types';

const isBrowser = typeof window !== 'undefined';

const stored = isBrowser && localStorage.drafts;

export const drafts = writable<Draft[]>(stored ? JSON.parse(stored) : []);

drafts.subscribe((value) => {
	if (!isBrowser) return;
	localStorage.drafts = JSON.stringify(value);
});

export const selectedDraft = writable<Draft | null>(null);
