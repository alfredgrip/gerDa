let isCompilingState = $state(false);

export const isCompiling = {
	get() {
		return isCompilingState;
	},
	set(value: boolean) {
		isCompilingState = value;
	}
};

let pdfViewerUrlState = $state('/GUIDE.pdf');

export const pdfViewerUrl = {
	get() {
		return pdfViewerUrlState;
	},
	set(value: string) {
		pdfViewerUrlState = value;
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
