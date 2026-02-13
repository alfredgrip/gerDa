import type { RequestSchema } from '$lib/schemas';

let isCompilingState = $state(false);

export const isCompiling = {
	get() {
		return isCompilingState;
	},
	set(value: boolean) {
		isCompilingState = value;
	}
};

let iFrameUrlState = $state('/GUIDE.pdf');

export const iFrameUrl = {
	get() {
		return iFrameUrlState;
	},
	set(value: string) {
		iFrameUrlState = value;
	}
};

let dirtyState = $state(false);

export const dirty = {
	get() {
		return dirtyState;
	},
	set(value: boolean) {
		dirtyState = value;
	}
};

let outputState: RequestSchema['output'] = $state('pdf');

export const output = {
	get() {
		return outputState;
	},
	set(value: RequestSchema['output']) {
		outputState = value;
	}
};
