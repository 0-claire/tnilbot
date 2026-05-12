import client from './client.js';
import { shutdownClient, } from './client.js';
import secrets from '../secrets.json' with { type: "json" };

// Most of the work occurs in client.ts & svg.tsx
// Log the bot in
client.login(secrets.token);

async function shutDown(): Promise<void> {
	try {
		console.log("Shutting down quizzes");
		await shutdownClient();
		console.log("Done");
	} catch(e) {
		console.log(e);
	}
}

process.on('SIGTERM', async () => {
	console.log('SIGTERM signal received.');
	await shutDown();
	process.exit();
});

process.on('SIGINT', async () => {
	console.log('SIGINT signal received.');
	await shutDown();
	process.exit();
});
