import { error } from '@sveltejs/kit';
import {
	NEW_GENERATE_ELECTION_PROPOSAL,
	NEW_GENERATE_MOTION,
	NEW_GENERATE_PROPOSITION
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
		if (
			typeof value === 'string' &&
			key !== 'markdown' &&
			key !== 'documentType' &&
			key !== 'meeting' &&
			key !== 'title' &&
			!(key.startsWith('what-to-who-') && key.endsWith('-who'))
		) {
			params[key] = markdownToLatex(value);
		}
	});
	Object.keys(params).forEach((key) => {
		formData.set(key, params[key]);
	});
	// }
	return formData;
};

export async function PUT(event) {
	const request = event.request;
	const formData = extractFormData(await request.formData());
	switch (formData.get('documentType')) {
		case 'motion': {
			const tex = generateMotionTex(formData);
			return new Response(tex);
		}
		case 'proposition': {
			const tex = generatePropositionTex(formData);
			return new Response(tex);
		}
		case 'electionProposal': {
			const tex = generateElectionProposalTex(formData);
			return new Response(tex);
		}
		default:
			throw error(400, 'Invalid document type');
	}
}

export async function POST(event) {
	const request = event.request;
	const formData = extractFormData(await request.formData());
	switch (formData.get('documentType')) {
		case 'motion': {
			const tex = generateMotionTex(formData);
			const uniqueFileName = `motion-${(formData.get('title') as string).replace(
				/ /g,
				'_'
			)}-${Date.now()}`;
			const filePath = await compileTex(tex, uniqueFileName);
			return new Response(filePath.replace('output/', ''));
		}
		case 'proposition': {
			const tex = generatePropositionTex(formData);
			const uniqueFileName = `proposition-${(formData.get('title') as string).replace(
				/ /g,
				'_'
			)}-${Date.now()}`;
			const filePath = await compileTex(tex, uniqueFileName);
			return new Response(filePath.replace('output/', ''));
		}
		case 'electionProposal': {
			const tex = generateElectionProposalTex(formData);
			const uniqueFileName = `proposal-${(formData.get('meeting') as string).replace(
				/ /g,
				'_'
			)}-${Date.now()}`;
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
	return NEW_GENERATE_MOTION({
		// return GENERATE_MOTION({
		meeting: formData.get('meeting') as string,
		title: formData.get('title') as string,
		body: formData.get('body') as string, //.replace(/\n/g, '\\\\'),
		clauses: clauses,
		authors: authors,
		signMessage: (formData.get('signMessage')?.toString().length === 0
			? 'För D-sektionen, dag som ovan'
			: formData.get('signMessage')) as string
	});
}

function generatePropositionTex(formData: FormData): string {
	const clauses = extractClauses(formData);
	const authors = extractAuthors(formData);
	return NEW_GENERATE_PROPOSITION({
		meeting: formData.get('meeting') as string,
		title: formData.get('title') as string,
		body: formData.get('body') as string, //.replace(/\n/g, '\\\\'),
		clauses: clauses,
		authors: authors,
		signMessage: (formData.get('signMessage')?.toString().length === 0
			? 'För D-sektionen, dag som ovan'
			: formData.get('signMessage')) as string,
		markdown: formData.get('markdown') === 'markdown'
	});
}

function generateElectionProposalTex(formData: FormData): string {
	const authors = extractAuthors(formData);
	const whatToWho = extractWhatToWho(formData);
	const statistics = extractStatistics(formData);
	return NEW_GENERATE_ELECTION_PROPOSAL({
		// return GENERATE_ELECTION_PROPOSAL({
		meeting: formData.get('meeting') as string,
		body: formData.get('body') as string, //.replace(/\n/g, '\\\\'),
		authors: authors,
		whatToWho: whatToWho,
		statistics: statistics,
		signMessage: (formData.get('signMessage')?.toString().length === 0
			? 'För Valberedningen'
			: formData.get('signMessage')) as string
	});
}

async function compileTex(tex: string, fileName: string): Promise<string> {
	fs.mkdirSync('uploads', { recursive: true });
	fs.mkdirSync('output', { recursive: true });
	fs.mkdirSync('logs', { recursive: true });
	// if there are more than 10 pdfs in the output folder, delete the oldest one
	deleteOldestFile('output');
	// if there are more than 10 logs in the logs folder, delete the oldest one
	deleteOldestFile('logs');

	fs.writeFileSync(`uploads/${fileName}.tex`, tex);

	// Compile tex, multiple times to make sure all references are correct, e.g. page numbers
	// console.log(
	// 	spawnSync(`latexmk -g uploads/${fileName}.tex || true`, { shell: true }).stdout.toString()
	// );
	// console.log(
	// 	spawnSync(`latexmk -g -f uploads/${fileName}.tex || true`, { shell: true }).stdout.toString()
	// );
	console.log(
		spawnSync(
			`tectonic -X compile uploads/${fileName}.tex -Z search-path=tex -Z continue-on-errors`,
			{
				shell: true
			}
		).stdout.toString()
	);

	// Move files to output folder
	// spawnSync('mv *.pdf output/ && mv *.log logs/', { shell: true });
	spawnSync(`mv uploads/${fileName}.pdf output/ && mv ${fileName}.log logs/`, { shell: true });
	spawnSync('rm -rf _markdown_* && rm -rf uploads/*', { shell: true });
	return `output/${fileName}.pdf`;
}

function extractAuthors(formData: FormData): Author[] {
	const authors: Author[] = [];
	let i = 0;
	while (i < 100) {
		const name = formData.get(`author-${i.toString()}-name`) as string;
		const position = formData.get(`author-${i.toString()}-position`) as string | null;
		if (name) {
			authors.push({ name, position });
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
			clauses.push({ toClause, description: description ?? '' });
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
		const who = formData.get(`what-to-who-${i.toString()}-who`) as string;
		if (what && who) {
			whatToWho.push({ what, who: who.split('\n') });
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
	const uniqueFileName = `markdown-tmp-${Date.now()}`;
	// create a temporary file
	fs.mkdirSync('uploads', { recursive: true });
	fs.writeFileSync(`uploads/${uniqueFileName}.md`, md);
	// convert markdown to tex
	const tex = spawnSync(`pandoc uploads/${uniqueFileName}.md -t latex`, {
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
