import { handler } from './build/handler.js';

import express from 'express';

const app = express();

const outputPath = 'output/pdf';

// add a route that lives separately from the SvelteKit app
app.get('/output/pdf/:fileName', (req, res) => {
	const fullPath = `${outputPath}/${req.params.fileName}`;
	res.sendFile(fullPath, { root: '.' }, (err) => {
		if (err) {
			console.error('Failed to send file:', err);
			res.status(err.status || 500).send('Error serving file.');
		}
	});
});

app.use(express.static(outputPath));

// let SvelteKit handle everything else, including serving prerendered pages and static assets
app.use(handler);

app.listen(3000, () => {
	console.log('listening on port 3000');
});
