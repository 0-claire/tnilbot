import { Client, Events, GatewayIntentBits, REST, Routes, SlashCommandBuilder, AttachmentBuilder, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandsOnlyBuilder } from 'discord.js'
import { textToScript } from '@zsnout/ithkuil/script/index.js'
import { Result } from '@zsnout/ithkuil/script'
import secrets from './secrets.json' with { type: 'json' }
import drawCharsFromRaw from './transform.js'
import { textToPng } from './transform.js'
import { generateChar } from './generator.js'

// TODO: move code into commands/ and into svg.ts(x) or tnil.ts(x)

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Log successful login
client.on(Events.ClientReady, readyClient => {
	console.log(`Logged in as ${readyClient.user.tag}!`);
});

async function render(text) {
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
	var result = new AttachmentBuilder(pngBuffer, { name: 'image.png' });
	console.log("result:", result)
	return result
}

// define slash command data
function createSlashCommand(settings: {
	name: string,
	description: string,
	// subcommands: SlashCommandSubcommandsOnlyBuilder[] | undefined,
	// options: SlashCommandOptionsOnlyBuilder[] | undefined
	}, callback: (builder: SlashCommandBuilder) => SlashCommandBuilder): SlashCommandBuilder {
		// the slash command
		const builder = new SlashCommandBuilder();

		// Set options
		builder.setName(settings.name);
		builder.setDescription(settings.description);

		// TODO: add any default options


		// Allow mutations
		const newBuilder = callback(builder);

		// return the full slash command object
		return newBuilder;
}

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
			)
			.addUserOption(option =>
								 option.
								 setName("mention")
								 .setDescription("The user to mention (ping)")
								 .setRequired(false)
								 ),
		exec: async function(interaction) {
			const text = interaction.options.get('text')?.value
			const user = interaction.options.get('mention')?.value
			console.log('user option:', user);
			var result: AttachmentBuilder | string | null;
			try {
				result = await render(text);
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
						content: user ? `<@${user}>` : undefined,
						files: [result]
					});
			} else {
				await interaction.reply("Internal error");
			}
		}
	},
	{
		data: createSlashCommand({ name: "secondary", description: "gives a random secondary character" }, builder => {
			builder.addBooleanOption(option => 
			  option
				.setName("inverted")
				.setDescription("mix in inverted chars")
			 );
			 return builder;
		}),
		exec: async function(interaction) {
			const inverted = interaction.options.get('inverted')?.value
			const wordLength = 5;
			const randomChars = [...Array(wordLength).keys()].map(x => { 
				const char = generateChar();
				// if inverted is set to true, use a random number check to determine whether the char is inverted
				return  inverted === true ? (Math.random() > 0.5 ? `${char}'` : char ) : char;
			}).join('');
			// const charsAsWords = randomChars.map(x => 'a' + x + 'al').join(' ');
			var result: AttachmentBuilder | string | null;
			try {
				result = await textToPng(randomChars);
			} catch(e) {
				result = null;
				if(e.name === 'PARSING_ERROR')
					result = `Parsing error: ${e.message}`;
				else
					console.log(e);
			}
			if(result) {
				if(typeof result === 'string')
					await interaction.reply(result);
				else
					await interaction.reply({
						content: `Transcript: ||${randomChars}||`,
						files: [result]
					});
			} else {
				await interaction.reply("Internal error");
			}
		}
	},
	{
		data: new SlashCommandBuilder()
			.setName('extensions')
			.setDescription('gives random secondary chars with extensions')
			.addBooleanOption(option => 
			  option
				.setName("inverted")
				.setDescription("mix in inverted chars")
			 )
			 ,
		exec: async function(interaction) {
			const wordLength = 5;
			const inverted = interaction.options.get('inverted')?.value
			const secondaryChar = generateChar();
			let preChar = generateChar();
			if(preChar === secondaryChar) preChar = '=';
			let postChar = generateChar();
			if(postChar === secondaryChar) postChar = '=';
			const apostrophe = inverted === true ? `${Math.random() > 0.5 ? "'" : ''}` : '';
			const secondaryCharWithRotation = `${secondaryChar}${apostrophe}`; 
			const randomChars = `${secondaryCharWithRotation}^${preChar}_${postChar}`;
			const prettifiedChars = `${preChar}${secondaryCharWithRotation}${postChar}`;
			var result: AttachmentBuilder | string | null;
			try {
				result = await textToPng(randomChars);
			} catch(e) {
				result = null;
				if(e.name === 'PARSING_ERROR')
					result = `Parsing error: ${e.message}`;
				else
					console.log(e);
			}
			if(result) {
				if(typeof result === 'string')
					await interaction.reply(result);
				else
					await interaction.reply({
						content: `Transcript: ||${prettifiedChars}||`,
						files: [result]
					});
			} else {
				await interaction.reply("Internal error");
			}
		}
	},
	// {
		// data: createSlashCommand({ name: 'quiz', description: 'quiz on script chars'}, builder => {
			// builder.addSubcommand(command =>
				// command
					// .setName("secondaries")
					// .setDescription("Consonantal chars")
					// .addBooleanOption(option => 
					  // option
						// .setName("inversions")
						// .setDescription("Mix in inverted chars")
					 // )
					// .addBooleanOption(option => 
					  // option
						// .setName("extensions")
						// .setDescription("Mix in char extensions")
					 // )
			// .addNumberOption(option =>
				// option
					// .setName("group size")
					// .setDescription("Number of chars (not including extensions) in each question")
			// )
			// .addNumberOption(option =>
				// option
					// .setName("length")
					// .setDescription("Number of questions to be given")
			// )
			// .addNumberOption(option =>
				// option
					// .setName("time")
					// .setDescription("Number of seconds to answer each question")
			// )
			// )
			// return builder;
		// }),
		// exec: async function(interaction) {
			// const subcommand = interaction.options.get('_subcommand')?.value 
			// switch(subcommand) {
				// case "secondaries":  {
					// const inverted = interaction.options.get('inverted')?.value
					// const wordLength = interaction.options.get('inverted')?.value || 5;
					// const randomChars = [...Array(wordLength).keys()].map(x => { 
						// const char = generateChar();
						// // if inverted is set to true, use a random number check to determine whether the char is inverted
						// return  inverted === true ? (Math.random() > 0.5 ? `${char}'` : char ) : char;
					// }).join('');
					// // const charsAsWords = randomChars.map(x => 'a' + x + 'al').join(' ');
					// var result: AttachmentBuilder | string | null;
					// try {
						// result = await textToPng(randomChars);
					// } catch(e) {
						// result = null;
						// if(e.name === 'PARSING_ERROR')
							// result = `Parsing error: ${e.message}`;
						// else
							// console.log(e);
					// }
					// if(result) {
						// if(typeof result === 'string')
							// await interaction.reply(result);
						// else
							// await interaction.reply({
								// content: `Transcript: ||${randomChars}||`,
								// files: [result]
							// });
					// } else {
						// await interaction.reply("Internal error");
					// }
						// return subcommand;
				// };
			// }
			// await interaction.reply("options: " + JSON.stringify(interaction.options));
		// }
	// },
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
