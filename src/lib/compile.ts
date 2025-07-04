import { execaCommand } from 'execa';
import { promises as fs } from 'fs';
import path from 'path';

const TEX_DIR = 'output/tex';
const PDF_DIR = 'output/pdf';
const IMAGE_DIR = 'output/img';

async function ensureDirs() {
	await Promise.all([
		fs.mkdir(TEX_DIR, { recursive: true }),
		fs.mkdir(PDF_DIR, { recursive: true }),
		fs.mkdir(IMAGE_DIR, { recursive: true })
	]);
}

async function deleteOldestFile(dir: string, keep: number = 10) {
	const files = await fs.readdir(dir);
	if (files.length >= keep) {
		const withStats = await Promise.all(
			files.map(async (file) => ({
				name: file,
				time: (await fs.stat(path.join(dir, file))).mtimeMs
			}))
		);
		const oldest = withStats.reduce((a, b) => (a.time < b.time ? a : b));
		await fs.unlink(path.join(dir, oldest.name));
	}
}

export async function markdownToLatex(markdown: string): Promise<string> {
	await ensureDirs();
	const id = crypto.randomUUID();
	const filePath = path.join(TEX_DIR, `${id}.md`);
	await fs.writeFile(filePath, markdown);

	const { stdout } = await execaCommand(`pandoc ${filePath} -f markdown -t latex`);
	await fs.unlink(filePath);
	console.log('stdout:', stdout);
	return stdout;
}

export async function compileTex(tex: string, fileName: string): Promise<string> {
	console.log(`Compiling LaTeX to PDF: ${fileName}`);

	await ensureDirs();
	await deleteOldestFile(PDF_DIR);

	const texFilePath = path.join(TEX_DIR, `${fileName}.tex`);
	await fs.writeFile(texFilePath, tex);

	const { stdout: tectonicPath } = await execaCommand('which tectonic');
	console.log(`Using tectonic at: ${tectonicPath.trim()}`);

	// Echo current working directory
	const { stdout: pwd } = await execaCommand('pwd');
	console.log(`Current working directory: ${pwd.trim()}`);

	const compileCommand = [
		'tectonic',
		'-X compile',
		`${texFilePath}`,
		`-Z search-path=dsekdocs`,
		`-Z search-path=${IMAGE_DIR}`,
		`-Z continue-on-errors`
	].join(' ');

	const { stdout: compileStdOut, stderr: compileStdErr } = await execaCommand(compileCommand);
	console.log(compileStdOut);

	fs.unlink(texFilePath).catch((err) => {
		console.error(`Failed to delete temporary file ${texFilePath}:`, err);
	});

	if (compileStdErr) console.error(compileStdErr);

	// Move PDF to output directory
	const { stdout: mvStdOut, stderr: mvStdErr } = await execaCommand(
		`mv ${TEX_DIR}/${fileName}.pdf ${PDF_DIR}`
	);
	console.log(mvStdOut);
	if (mvStdErr) console.error(mvStdErr);

	// TODO: Clean up all files
	// const { stdout: rmStdOut, stderr: rmStdErr } = await execaCommand(
	// 	`rm -rf _markdown_* && rm -rf ${UPLOAD_DIR}/*`
	// );
	// console.log(rmStdOut);
	// if (rmStdErr) console.error(rmStdErr);

	const result = path.join('/', PDF_DIR, `${fileName}.pdf`);
	console.log(`PDF compiled successfully: ${result}`);
	return result;
}
