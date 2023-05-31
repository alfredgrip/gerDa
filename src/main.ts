// import App from './App.svelte';
import express from 'express';
import path from 'path';

const port = process.env.PORT || 5000;
const expressApp = express();
expressApp.use(express.static(path.join(__dirname, 'public')));
expressApp.listen(port, () => console.log(`Listening on port ${port}`));

expressApp.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

//const app = new App({
//	target: document.body,
//});


console.log('hello world');

//export default app;