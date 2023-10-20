import { handler } from './build/handler.js';

import express from 'express';

const app = express();

const outputPath = 'output';

// add a route that lives separately from the SvelteKit app
app.get(`/${outputPath}/*`, (req, res) => {
	const fileName = req.url.split('/').pop();
	res.sendFile(`/${outputPath}/` + fileName, { root: '.' });
});

app.use(express.static(outputPath));

// let SvelteKit handle everything else, including serving prerendered pages and static assets
app.use(handler);

app.listen(3000, () => {
	console.log('listening on port 3000');
});
