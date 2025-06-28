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

async function render(text, font) {
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
	const pngBuffer = await drawCharsFromRaw(parserObjects, font);
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
								 )
			.addStringOption(option => 
			  option
				.setName("font")
				.setDescription("which font should I use")
				.addChoices(
					{ name: "calligraphic", value: "basic" },
					{ name: "handwritten", value: "flow" }
				)
			),
		exec: async function(interaction) {
			const text = interaction.options.get('text')?.value
			const user = interaction.options.get('mention')?.value
			const font = interaction.options.get('inverted')?.value;
			console.log('user option:', user);
			var result: AttachmentBuilder | string | null;
			try {
				result = await render(text, font);
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
			)
			builder.addStringOption(option => 
			  option
				.setName("font")
				.setDescription("which font should I use")
				.addChoices(
					{ name: "calligraphic", value: "basic" },
					{ name: "handwritten", value: "flow" }
				)
			 );
			 return builder;
		}),
		exec: async function(interaction) {
			const inverted = interaction.options.get('inverted')?.value;
			const font = interaction.options.get('inverted')?.value;
			const wordLength = 5;
			const randomChars = [...Array(wordLength).keys()].map(x => { 
				const char = generateChar();
				// if inverted is set to true, use a random number check to determine whether the char is inverted
				return  inverted === true ? (Math.random() > 0.5 ? `${char}'` : char ) : char;
			}).join('');
			// const charsAsWords = randomChars.map(x => 'a' + x + 'al').join(' ');
			var result: AttachmentBuilder | string | null;
			try {
				result = await textToPng(randomChars, font);
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
			const font = interaction.options.get('inverted')?.value;
			const secondaryChar = generateChar();
			let preChar = generateChar(true);
			if(preChar === secondaryChar) preChar = '=';
			let postChar = generateChar(true);
			if(postChar === secondaryChar) postChar = '=';
			const apostrophe = inverted === true ? `${Math.random() > 0.5 ? "'" : ''}` : '';
			const secondaryCharWithRotation = `${secondaryChar}${apostrophe}`; 
			const randomChars = `${secondaryCharWithRotation}^${preChar}_${postChar}`;
			const prettifiedChars = `${preChar}${secondaryCharWithRotation}${postChar}`;
			var result: AttachmentBuilder | string | null;
			try {
				result = await textToPng(randomChars, font);
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
	{
		data: createSlashCommand({ name: 'quiz', description: 'quiz on script chars'}, builder => {
			builder.addSubcommand(command =>
				command
					.setName("secondaries")
					.setDescription("Consonantal chars")
					.addBooleanOption(option => 
					  option
						.setName("inversions")
						.setDescription("Mix in inverted chars")
					 )
					.addBooleanOption(option => 
					  option
						.setName("extensions")
						.setDescription("Mix in char extensions")
					 )
			.addNumberOption(option =>
				option
					.setName("group_size")
					.setDescription("Number of chars (not including extensions) in each question")
			)
			.addNumberOption(option =>
				option
					.setName("length")
					.setDescription("Number of questions to be given")
			)
			.addNumberOption(option =>
				option
					.setName("time")
					.setDescription("Number of seconds to answer each question")
			)
			.addBooleanOption(option =>
				option
					.setName("collaborative")
					.setDescription("Allow others to join in")
			)
			)
			return builder;
		}),
		exec: async function(interaction) {
			// const subcommand = interaction.options.get('_subcommand')?.value 
			// TODO: there's probably a better way to do this
			const subcommand = interaction.options['_subcommand'];
			switch(subcommand) {
				case "secondaries":  {
					const inverted = interaction.options.get('inverted')?.value || true;
					const font = interaction.options.get('inverted')?.value;
					const wordLength = interaction.options.get('group_size')?.value || 5;
					const collaborative = interaction.options.get('collaborative')?.value || 5;
					let quizLength = interaction.options.get('length')?.value || 5;
					if(quizLength > 50) quizLength = 50;
					await interaction.reply("Quiz started");

					for(let i = 1; i <= quizLength; i++) {
					}

					const randomChars = [...Array(wordLength).keys()].map(x => { 
						const char = generateChar();
						// if inverted is set to true, use a random number check to determine whether the char is inverted
						return  inverted === true ? (Math.random() > 0.5 ? `${char}'` : char ) : char;
					}).join('');
					// const charsAsWords = randomChars.map(x => 'a' + x + 'al').join(' ');
					var result: AttachmentBuilder | string | null;
					try {
						result = await textToPng(randomChars, font);
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
						return subcommand;
				};
				default: {
					await interaction.reply("This is not a valid subcommand");
				};
			}
		}
	},
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
