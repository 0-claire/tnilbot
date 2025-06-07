import client from './client.js'
import secrets from './secrets.json' with { type: 'json' }

client.login(secrets.token);
