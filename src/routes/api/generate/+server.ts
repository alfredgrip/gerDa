import { error } from '@sveltejs/kit';
import {
	GENERATE_ELECTION_PROPOSAL,
	GENERATE_MOTION,
	GENERATE_PROPOSITION,
	GENERATE_CUSTOM_DOCUMENT,
	GENERATE_REQUIREMENT_PROFILE,
	GENERATE_BOARD_RESPONSE
} from '$lib/templates';
import type { Author, Clause, Statistics, WhatToWho } from '$lib/types';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

const extractFormData = (formData: FormData) => {
	const params: Record<string, string> = {};
	// if (formData.get('markdown') === 'markdown') { // pandoc handles mixing markdown and latex
	const keys = Array.from(formData.keys());
	keys.forEach((key) => {
		const value = formData.get(key);
		if (key === 'documentType') {
			params[key] = value?.toString() ?? '';
		} else if (typeof value === 'string' && !key.endsWith('singlerow')) {
			params[key] = markdownToLatex(value);
		} else {
			params[key] = JSON.stringify(value?.toString().split('\n') ?? []);
		}
	});
	Object.keys(params).forEach((key) => {
		formData.set(key, params[key]);
	});
	// }
	return formData;
};

// This is used for only generating the tex file and not the pdf
export async function PUT(event) {
	const request = event.request;
	const formData = extractFormData(await request.formData());
	switch (formData.get('documentType')) {
		case 'motion': {
			return new Response(generateMotionTex(formData));
		}
		case 'proposition': {
			return new Response(generatePropositionTex(formData));
		}
		case 'election-proposal': {
			return new Response(generateElectionProposalTex(formData));
		}
		case 'custom': {
			return new Response(generateCustomDocumentTex(formData));
		}
		case 'requirement-profile': {
			return new Response(generateRequirementProfileTex(formData));
		}
		case 'board-response': {
			return new Response(generateBoardResponse(formData));
		}
		default:
			throw error(400, 'Invalid document type');
	}
}

// This is used for generating the pdf file and send it back to the client
export async function POST(event) {
	const request = event.request;
	const formData = extractFormData(await request.formData());
	console.log('Recieved request for ' + formData.get('documentType'));
	const uniqueFileName = `${formData.get('documentType')?.toString()}-${encodeURI(
		formData.get('title')?.toString() ?? ''
	).replace(/ /g, '_')}-${Date.now()}`;
	switch (formData.get('documentType')) {
		case 'motion': {
			const tex = generateMotionTex(formData);
			const filePath = await compileTex(tex, uniqueFileName);
			return new Response(filePath.replace('output/', ''));
		}
		case 'proposition': {
			const tex = generatePropositionTex(formData);
			const filePath = await compileTex(tex, uniqueFileName);
			return new Response(filePath.replace('output/', ''));
		}
		case 'election-proposal': {
			const tex = generateElectionProposalTex(formData);
			const filePath = await compileTex(tex, uniqueFileName);
			return new Response(filePath.replace('output/', ''));
		}
		case 'custom': {
			const tex = generateCustomDocumentTex(formData);
			const filePath = await compileTex(tex, uniqueFileName);
			return new Response(filePath.replace('output/', ''));
		}
		case 'requirement-profile': {
			const tex = generateRequirementProfileTex(formData);
			const filePath = await compileTex(tex, uniqueFileName);
			return new Response(filePath.replace('output/', ''));
		}
		case 'board-response': {
			const tex = generateBoardResponse(formData);
			const filePath = await compileTex(tex, uniqueFileName);
			return new Response(filePath.replace('output/', ''));
		}
		default:
			throw error(400, 'Invalid document type');
	}
}

function generateMotionTex(formData: FormData): string {
	const clauses = extractClauses(formData);
	const authors = extractAuthors(formData);
	return GENERATE_MOTION({
		// return GENERATE_MOTION({
		meeting: formData.get('meeting') as string,
		title: formData.get('title') as string,
		body: formData.get('body') as string, //.replace(/\n/g, '\\\\'),
		demand: formData.get('demand') as string,
		clauses: clauses,
		numberedClauses: formData.get('numberedClauses')?.toString().trim() === 'on',
		authors: authors,
		signMessage: formData.get('signMessage') as string
	});
}

function generatePropositionTex(formData: FormData): string {
	const clauses = extractClauses(formData);
	const authors = extractAuthors(formData);
	return GENERATE_PROPOSITION({
		meeting: formData.get('meeting') as string,
		title: formData.get('title') as string,
		body: formData.get('body') as string, //.replace(/\n/g, '\\\\'),
		demand: formData.get('demand') as string,
		clauses: clauses,
		numberedClauses: formData.get('numberedClauses')?.toString().trim() === 'on',
		authors: authors,
		signMessage: formData.get('signMessage') as string
	});
}

function generateElectionProposalTex(formData: FormData): string {
	const authors = extractAuthors(formData);
	const whatToWho = extractWhatToWho(formData);
	const statistics = extractStatistics(formData);
	return GENERATE_ELECTION_PROPOSAL({
		meeting: formData.get('meeting') as string,
		body: formData.get('body') as string, //.replace(/\n/g, '\\\\'),
		authors: authors,
		whatToWho: whatToWho,
		statistics: statistics,
		signMessage:
			formData.get('signMessage')?.toString().trim().length == 0
				? 'För Valberedningen'
				: (formData.get('signMessage') as string)
	});
}

function generateCustomDocumentTex(formData: FormData): string {
	const authors = extractAuthors(formData);
	return GENERATE_CUSTOM_DOCUMENT({
		title: formData.get('title') as string,
		shortTitle: formData.get('shortTitle') as string,
		meeting: formData.get('meeting') as string,
		body: formData.get('body') as string,
		authors: authors,
		signMessage: formData.get('signMessage') as string
	});
}

function generateRequirementProfileTex(formData: FormData): string {
	return GENERATE_REQUIREMENT_PROFILE({
		year: (formData.get('year') as string) ?? '',
		position: (formData.get('position') as string) ?? '',
		description: (formData.get('description') as string) ?? null,
		requirement:
			JSON.parse((formData.get('requirements-singlerow') as string | undefined) ?? '') ?? [],
		merits: JSON.parse((formData.get('merits-singlerow') as string | undefined) ?? '') ?? []
	});
}

function generateBoardResponse(formData: FormData): string {
	const clauses = extractClauses(formData);
	return GENERATE_BOARD_RESPONSE({
		meeting: formData.get('meeting') as string,
		title: formData.get('title') as string,
		body: formData.get('body') as string,
		demand: formData.get('demand') as string,
		numberedClauses: formData.get('numberedClauses')?.toString().trim() === 'on',
		clauses: clauses,
		authors: extractAuthors(formData),
		signMessage: formData.get('signMessage') as string
	});
}

async function compileTex(tex: string, fileName: string): Promise<string> {
	console.log('Compiling tex for file ' + fileName);
	fs.mkdirSync('uploads', { recursive: true });
	fs.mkdirSync('output', { recursive: true });
	fs.mkdirSync('logs', { recursive: true });
	// if there are more than 10 pdfs in the output folder, delete the oldest one
	deleteOldestFile('output');
	// if there are more than 10 logs in the logs folder, delete the oldest one
	deleteOldestFile('logs');

	console.log('Writing tex to file');
	fs.writeFileSync(`uploads/${fileName}.tex`, tex);

	console.log('Compiling tex with ');
	console.log(spawnSync('which tectonic', { shell: true }).stdout.toString());
	const command = spawnSync(
		`tectonic -X compile "uploads/${fileName}.tex" -Z search-path=tex -Z continue-on-errors`,
		{
			shell: true
		}
	);
	console.log(command.stdout.toString());
	console.log(command.stderr.toString());

	// console.log(
	// 	spawnSync(
	// 		`tectonic -X compile uploads/${fileName}.tex -Z search-path=tex -Z continue-on-errors`,
	// 		{
	// 			shell: true
	// 		}
	// 	).stdout.toString()
	// );

	// Move files to output folder
	// spawnSync('mv *.pdf output/ && mv *.log logs/', { shell: true });
	spawnSync(`mv uploads/*.pdf output`, { shell: true });
	spawnSync('rm -rf _markdown_* && rm -rf uploads/*', { shell: true });
	return `output/${fileName}.pdf`;
}

function extractAuthors(formData: FormData): Author[] {
	const authors: Author[] = [];
	let i = 0;
	while (i < 100) {
		const name = formData.get(`author-${i.toString()}-name`) as string;
		const position = (formData.get(`author-${i.toString()}-position`) ?? '') as string;
		if (name) {
			authors.push({ name, position, uuid: '' });
		} else {
			break;
		}
		i++;
	}
	return authors;
}

function extractClauses(formData: FormData): Clause[] {
	const clauses: Clause[] = [];
	let i = 0;
	while (i < 100) {
		const toClause = formData.get(`to-clause-${i.toString()}`) as string;
		const description = formData.get(`to-clause-${i.toString()}-description`) as string | null;
		if (toClause) {
			clauses.push({ toClause, description: description?.trim() === '' ? null : description });
		} else {
			break;
		}
		i++;
	}
	return clauses;
}

function extractWhatToWho(formData: FormData): WhatToWho[] {
	const whatToWho: WhatToWho[] = [];
	let i = 0;
	while (i < 100) {
		const what = formData.get(`what-to-who-${i.toString()}-what`) as string;
		const who = formData.get(`what-to-who-${i.toString()}-who-singlerow`) as string;
		if (what && who) {
			whatToWho.push({
				what,
				who: JSON.parse(who),
				numberOfApplicants: '',
				uuid: '',
				whoString: ''
			});
		} else {
			break;
		}
		i++;
	}
	return whatToWho;
}

function extractStatistics(formData: FormData): Statistics[] {
	const statistics: Statistics[] = [];
	let i = 0;
	while (i < 100) {
		const what = formData.get(`what-to-who-${i.toString()}-what`) as string;
		const interval = formData.get(`statistics-${i.toString()}-interval`) as string;
		if (what && interval) {
			statistics.push({ what, interval });
		} else {
			break;
		}
		i++;
	}
	return statistics;
}

function markdownToLatex(md: string): string {
	// Why create a temporary file?
	// We could pipe the md-string into pandoc
	// But we get better results if we let pandoc read from a file
	// For example when including math equations
	const uniqueFileName = `markdown-tmp-${Date.now()}`;
	// create a temporary file
	//console.log('Writing markdown to file');
	fs.mkdirSync('uploads', { recursive: true });
	fs.writeFileSync(`uploads/${uniqueFileName}.md`, md);
	// convert markdown to tex
	const tex = spawnSync(`pandoc uploads/${uniqueFileName}.md -f markdown -t latex`, {
		shell: true
	}).stdout.toString();
	// remove temporary file
	spawnSync(`rm uploads/${uniqueFileName}.md`, { shell: true });
	return tex;
}

function deleteOldestFile(folder: string, keepHowMany: number = 10): void {
	const allFiles = fs.readdirSync(folder);
	if (allFiles.length >= keepHowMany) {
		const oldestFile = allFiles.reduce((oldest, file) => {
			const oldestTime = fs.statSync(`${folder}/${oldest}`).mtimeMs;
			const fileTime = fs.statSync(`${folder}/${file}`).mtimeMs;
			return oldestTime < fileTime ? oldest : file;
		});
		fs.unlinkSync(`${folder}/${oldestFile}`);
	}
}
