import client from './client.js'
import secrets from './secrets.json' with { type: 'json' }

// Most of the work occurs in client.ts & svg.tsx
// Log the bot in
client.login(secrets.token);
