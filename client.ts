import { Client, Events, GatewayIntentBits, REST, Routes, SlashCommandBuilder, AttachmentBuilder } from 'discord.js'
import { textToScript } from '@zsnout/ithkuil/script/index.js'
import { Result } from '@zsnout/ithkuil/script'
import secrets from './secrets.json' with { type: 'json' }
import drawCharsFromRaw from './transform.js'

// TODO: move code into commands/ and into svg.ts(x) or tnil.ts(x)

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Log successful login
client.on(Events.ClientReady, readyClient => {
	console.log(`Logged in as ${readyClient.user.tag}!`);
});

// define slash command data
const commands = [
	{ 
		data: new SlashCommandBuilder()
			.setName('render')
			.setDescription('Renders into TNIL script')
			.addStringOption(option => 
				option
				.setName('text')
				.setDescription("The text to render into the script")
				.setRequired(true)
			),
		exec: async function(interaction) {
			const text = interaction.options.get('text')?.value
			var result: AttachmentBuilder | string | null;
			try {
				// Parse text
				var phrases = text.split(' ');
				// const vowels = '[aeiouäëïöüáéíóúâêîôû']'
				const modularAdjunctRegex = /^['wy]?[aeiouäëïöüáéíóúâêîôû]+(w|y|h[lrmnň]?w?)?/;
				const affixualAdjunctRegex = /^[aeiouäëïöüáéíóúâêîôû]+[^aeiouäëïöüáéíóúâêîôû]+[aeiouäëïöüáéíóúâêîôû]{0,2}/;
				const multipleAffixAdjunctRegex = /^ë?'?h[wrl]?/;
				const regexA = /^h([nmň][aeiouäëïöüáéíóúâêîôû']{1,3}|([aeou]?i?|iu))/;
				const regexB = /^ah[nmň][aeiouäëïöüáéíóúâêîôû']{1,3}x/;
				// TODO: honestly why not just use the parser to determine if it's a suppletive or carrier
				// TODO: or even just add spaces after quat chars or before prim chars
				const regexC = /^(([wy]|h[wrl]?)?[aeiouäëïöüáéíóúâêîôû']{1,3}s|s[aeiouäëïöüáéíóúâêîôû']{1,3}[^aeiouäëïöüáéíóúâêîôûxy])/;
				for(var i = phrases.length -1; i > 0; i--) {
					console.log('i:', i);
					const currentPhrase = phrases[i];
					const previousPhrase = phrases[i-1];

					if(regexA.test(previousPhrase.toLowerCase()) ||
					   regexB.test(previousPhrase.toLowerCase()) ||
					   modularAdjunctRegex.test(previousPhrase.toLowerCase()) || // Don't separate aspect adjuncts & others
					   regexC.test(previousPhrase.toLowerCase())
					  ) {
						console.log(`phrase ${currentPhrase} matches`);
						phrases[i-1] = `${previousPhrase} ${currentPhrase}`
						phrases.splice(i, 1);
					}
				}
				console.log('phrases:', phrases);
				const parserObjects: Result<any>[] = phrases.map(async x => await textToScript(x));
				// Convert to script-compatible text and then to png
				const pngBuffer = await drawCharsFromRaw(parserObjects);
				result = new AttachmentBuilder(pngBuffer, { name: 'image.png' });
				console.log("result:", result)
			} catch(e) {
					result = null;
				if(e.name === 'PARSING_ERROR') {
					result = `Parsing error: ${e.message}`;
				} else {
					console.log(e);
				}
			}
			if(result) {
				if(typeof result === 'string')
					await interaction.reply(result);
				else
					await interaction.reply({
						// content: `text: ||\`${ text || 'null'}\`||`,
						files: [result]
					});
			} else {
				await interaction.reply("Internal error");
			}
		}
	}
]


// Run slash command function on its receipt
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const comm = commands.find(c => c.data.name === interaction.commandName);
	if(comm) {
		try {
			await comm.exec(interaction)
		} catch(e) {
			console.log('error! =>', e)
			await interaction.reply("An error occurred running this command. It has been logged")
		}
	}
});

// Log in the bot
client.login(secrets.token);

// Reset the bot's slash commands
const rest = new REST({ version: '10' }).setToken(secrets.token);

try {
	console.log('Started refreshing application (/) commands.');

	await rest.put(Routes.applicationCommands(secrets.id), { body: commands.map(x => x.data) });
	// await rest.put(Routes.applicationCommands(secrets.id), { body: commands.map(x => x.data) });

	console.log('Successfully reloaded application (/) commands.');
} catch (error) {
	console.error(error);
}

export default client
