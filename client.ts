import { Client, Events, GatewayIntentBits, REST, Routes, SlashCommandBuilder, AttachmentBuilder } from 'discord.js'
import { textToScript } from '@zsnout/ithkuil/script/index.js'
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
			var result: AttachmentBuilder | null;
			try {
				const svgRaw = await textToScript(text);
				const pngBuffer = await drawCharsFromRaw(svgRaw);
				result = new AttachmentBuilder(pngBuffer, { name: 'image.png' });
				console.log("result:", result)
			} catch(e) {
				result = null;
				console.log(e);
			}
			if(result) {
				await interaction.reply({
					content: `text: ||\`${ text || 'null'}\`||`,
					files: [result]
				});
			} else {
				await interaction.reply("Could not render text");
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
