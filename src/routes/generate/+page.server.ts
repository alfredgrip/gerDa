import { error, type Actions, redirect } from '@sveltejs/kit';
import {
	GENERATE_ELECTION_COMMITTEE_PROPOSAL,
	GENERATE_MOTION,
	GENERATE_PROPOSITION
} from '$lib/templates';
import type { Author, Clause, Statistics, WhatToWho } from '$lib/types';
import { exec } from 'node:child_process';
import fs from 'node:fs';

export const actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		switch (formData.get('documentType')) {
			case 'motion': {
				const tex = generateMotionTex(formData);
				const uniqueFileName = `motion-${(formData.get('title') as string).replace(
					RegExp(' ', 'g'),
					'_'
				)}-${Date.now()}`;
				const filePath = await compileTex(tex, uniqueFileName);
				throw redirect(303, filePath);
			}
			case 'proposition': {
				const tex = generatePropositionTex(formData);
				const uniqueFileName = `proposition-${(formData.get('title') as string).replace(
					RegExp(' ', 'g'),
					'_'
				)}-${Date.now()}`;
				const filePath = await compileTex(tex, uniqueFileName);
				throw redirect(303, filePath);
			}
			case 'electionCommitteeProposal': {
				const tex = generateElectionCommitteeProposalTex(formData);
				const uniqueFileName = `electionCommitteeProposal-${(
					formData.get('title') as string
				).replace(RegExp(' ', 'g'), '_')}-${Date.now()}`;
				const filePath = await compileTex(tex, uniqueFileName);
				throw redirect(303, filePath);
			}
			default:
				throw error(400, 'Invalid document type');
		}
	}
} satisfies Actions;

function generateMotionTex(formData: FormData): string {
	const clauses = extractClauses(formData);
	const authors = extractAuthors(formData);
	return GENERATE_MOTION({
		meeting: formData.get('meeting') as string,
		title: formData.get('title') as string,
		body: formData.get('body') as string,
		clauses: clauses,
		authors: authors,
		signMessage: (formData.get('signMessage') ?? undefined) as string | undefined
	});
}

function generatePropositionTex(formData: FormData): string {
	const clauses = extractClauses(formData);
	const authors = extractAuthors(formData);
	return GENERATE_PROPOSITION({
		meeting: formData.get('meeting') as string,
		title: formData.get('title') as string,
		body: formData.get('body') as string,
		clauses: clauses,
		authors: authors,
		signMessage: (formData.get('signMessage') ?? undefined) as string | undefined
	});
}

function generateElectionCommitteeProposalTex(formData: FormData): string {
	const authors = extractAuthors(formData);
	const whatToWho = extractWhatToWho(formData);
	const statistics = extractStatistics(formData);
	return GENERATE_ELECTION_COMMITTEE_PROPOSAL({
		meeting: formData.get('meeting') as string,
		title: formData.get('title') as string,
		body: formData.get('body') as string,
		authors: authors,
		whatToWho: whatToWho,
		statistics: statistics,
		signMessage: (formData.get('signMessage') ?? undefined) as string | undefined
	});
}

async function compileTex(tex: string, fileName: string): Promise<string> {
	fs.mkdirSync('uploads', { recursive: true });
	fs.mkdirSync('output', { recursive: true });
	fs.mkdirSync('logs', { recursive: true });
	// Bun.spawnSync(['mkdir', '-p', 'uploads', 'output', 'logs']);
	// if there are more than 10 pdfs in the output folder, delete the oldest one
	const files = fs.readdirSync('output');
	if (files.length >= 10) {
		const oldestFile = files.reduce((oldest, file) => {
			const oldestTime = fs.statSync(`output/${oldest}`).mtimeMs;
			const fileTime = fs.statSync(`output/${file}`).mtimeMs;
			return oldestTime < fileTime ? oldest : file;
		});
		fs.unlinkSync(`output/${oldestFile}`);
	}
	fs.writeFileSync(`uploads/${fileName}.tex`, tex);
	// Compile tex
	await execShellCommand(`latexmk -f uploads/${fileName}.tex || true`);
	// Move file to output folder
	await execShellCommand('mv *.pdf output/ && mv *.log logs/');
	// Clean up
	await execShellCommand(
		`rm -f *.aux *.fdb_latexmk *.fls *.out *.synctex.gz uploads/${fileName}.tex`
	);
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
			clauses.push({ toClause, description });
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
		const who = (formData.get(`what-to-who-${i.toString()}-who`) as string).split('\n');
		if (what && who) {
			whatToWho.push({ what, who });
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
		const what = formData.get(`statistics-${i.toString()}-what`) as string;
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

function execShellCommand(cmd: string) {
	return new Promise((resolve) => {
		exec(cmd, (error, stdout, stderr) => {
			if (error) {
				console.warn(error);
			}
			resolve(stdout ? stdout : stderr);
		});
	});
}
