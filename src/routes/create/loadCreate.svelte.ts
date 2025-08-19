// import { getLocalStorageDrafts } from '$lib/state/localDraftsState.svelte';

// export const loadDraft = () => {
// 	const localDrafts = getLocalStorageDrafts();
// 	if (!localDrafts.currentDraftId) return null;

// 	const currentDraft = localDrafts.getDraft(localDrafts.currentDraftId);
// 	if (!currentDraft) return null;

// 	console.log('Loading draft:', currentDraft);
// 	return {
// 		title: currentDraft.title,
// 		meeting: currentDraft.meeting,
// 		body: currentDraft.body,
// 		demand: currentDraft.demand,
// 		authors: currentDraft.authors || [{ name: '', position: '', signMessage: '' }],
// 		clauses: currentDraft.clauses || [{ toClause: '' }]
// 	};
// };
