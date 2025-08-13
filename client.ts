import {
	Client, Events, GatewayIntentBits, REST, Routes, SlashCommandBuilder, AttachmentBuilder, EmbedBuilder, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandsOnlyBuilder, ContextMenuCommandBuilder, ApplicationCommandType, User, APIEmbed, Snowflake, Message, CommandInteraction, Partials, 
} from 'discord.js';
import secrets from './secrets.json' with { type: 'json' };
import { textToPng, render, } from './transform.js';
import {
	generateChar, generateSecondary, generateAffix, 
} from './generator.js';
import config from './config.js';
import {
	initiateQuiz, engagedUsers, quizzes, Quiz, QuizOptions, QuizOptionsModel,
} from './quiz.js';
import { Font, } from './util.js';

// TODO: move code into commands/ and into svg.ts(x) or tnil.ts(x)

function createOptions(innerBuilder) {
	innerBuilder
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
				.setName("ignore_missing_apostrophes")
				.setDescription("Ignore missing apostrophes for flipped chars")
		)
		.addBooleanOption(option =>
			option
				.setName("shortcuts")
				.setDescription("Use secondary shortcuts for case & illocution/validation")
		)
		.addBooleanOption(option =>
			option
				.setName("collaborative")
				.setDescription("Allow others to join in")
		)
		.addStringOption(option => 
			option
				.setName("font")
				.setDescription("which font should I use")
				.addChoices(
					{
						name: "calligraphic",
						value: "basic", 
					},
					{
						name: "handwritten",
						value: "flow", 
					}
				)
		)
		.addStringOption(option => 
			option
				.setName("background_color")
				.setDescription("Background color (e.g. white, #fff, #fefefe")
		)
		.addStringOption(option => 
			option
				.setName("font_color")
				.setDescription("color of the rendered text (e.g. white, #fff, #fefefe)")
		)
		.addStringOption(option => 
			option
				.setName("border_color")
				.setDescription("border color of the rendered text (e.g. white, #fff, #fefefe)")
		)
		;
	return innerBuilder;
}

export async function shutdownClient() {
	// Shutdown quizzes
	await shutdownQuizzes("Bot restarting");
};

async function shutdownQuizzes(reason: string) {
	for(const channelId in quizzes) {
		const channel = quizzes[channelId];
		const promises = [];

		channel.privateQuizzes.forEach((quiz) => {
			promises.push(quiz.end(reason));
		});
		promises.push(channel.publicQuiz?.end(reason));

		await Promise.all(promises);
	}
}

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.MessageContent,
	],
	partials: [Partials.Message, Partials.Channel, Partials.Reaction,], // ✅ TS-safe
});

// Log successful login
client.on(Events.ClientReady, readyClient => {
	console.log(`Logged in as ${readyClient.user.tag}!`);
});

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
			.setDescription('Renders valid TNIL words into TNIL script')
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
						{
							name: "calligraphic",
							value: "basic", 
						},
						{
							name: "handwritten",
							value: "flow", 
						}
					)
			)
			.addBooleanOption(option => 
			  option
					.setName("spacing")
					.setDescription("attempt to insert spaces between words")
			)
			// .addMentionableOption(option => 
		// option
		// .setName("reply")
		// .setDescription("Message to reply to")
			// )
		,
		async exec(interaction) {
			const text = interaction.options.get('text')?.value;
			const user = interaction.options.get('mention')?.value;
			const font = interaction.options.get('font')?.value;
			const spacing = interaction.options.get('spacing')?.value || config.rendering.spaceBetweenWords;
			console.log('user option:', user);
			let result: AttachmentBuilder | string | null;
			try {
				result = await render(text, font, spacing);
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
				else {
					await interaction.reply({
					// content: `text: ||\`${ text || 'null'}\`||`,
						content: user ? `<@${user}>` : undefined,
						files: [result,],
					});
				}
			} else {
				await interaction.reply("Internal error");
				console.log('result:', result);
			}
		},
	},
	{ 
		data: new SlashCommandBuilder()
			.setName('render_raw')
			.setDescription('Renders literal chars into TNIL font')
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
						{
							name: "calligraphic",
							value: "basic", 
						},
						{
							name: "handwritten",
							value: "flow", 
						}
					)
			)
			// .addMentionableOption(option => 
		// option
		// .setName("reply")
		// .setDescription("Message to reply to")
			// )
		,
		async exec(interaction) {
			const text = interaction.options.get('text')?.value;
			const user = interaction.options.get('mention')?.value;
			const font = interaction.options.get('font')?.value;
			console.log('user option:', user);
			let result: AttachmentBuilder | string | null;
			try {
				result = await textToPng(text, font);
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
				else {
					await interaction.reply({
					// content: `text: ||\`${ text || 'null'}\`||`,
						content: user ? `<@${user}>` : undefined,
						files: [result,],
					});
				}
			} else {
				await interaction.reply("Internal error");
				console.log('result:', result);
			}
		},
	},
	{
		data: createSlashCommand({
			name: "secondary",
			description: "gives a random secondary character", 
		}, builder => {
			builder.addBooleanOption(option => 
			  option
					.setName("inverted")
					.setDescription("mix in inverted chars")
			);
			builder.addStringOption(option => 
			  option
					.setName("font")
					.setDescription("which font should I use")
					.addChoices(
						{
							name: "calligraphic",
							value: "basic", 
						},
						{
							name: "handwritten",
							value: "flow", 
						}
					)
			 );
			 return builder;
		}),
		async exec(interaction) {
			const result = await generateSecondary(new QuizOptionsModel(interaction.options));
			if(typeof result !== 'string') {
				const { image, answer, } = result;
				await interaction.reply({
					content: `Transcript: ||${answer}||`,
					files: [image,],
				});
			} else 
				await interaction.reply(result);
			
		},
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
			.addStringOption(option => 
			  option
					.setName("font")
					.setDescription("which font should I use")
					.addChoices(
						{
							name: "calligraphic",
							value: "basic", 
						},
						{
							name: "handwritten",
							value: "flow", 
						}
					)
			)
			 ,
		async exec(interaction) {
			const wordLength = 5;
			const inverted = interaction.options.get('inverted')?.value;
			const font = interaction.options.get('font')?.value;

			const secondaryChar = generateChar();
			let preChar = generateChar(true);
			if(preChar === secondaryChar) preChar = '=';
			let postChar = generateChar(true);
			if(postChar === secondaryChar) postChar = '=';
			let apostrophe = '';
			if(inverted === true || (config.quizzes.inversionByDefault === true && inverted !== false))
				apostrophe += `${Math.random() > 0.5 ? "'" : ''}`;
			const secondaryCharWithRotation = `${secondaryChar}${apostrophe}`; 
			const randomChars = `${secondaryCharWithRotation}^${preChar}_${postChar}`;
			const prettifiedChars = `${preChar}${secondaryCharWithRotation}${postChar}`;
			let result: AttachmentBuilder | string | null;
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
				else {
					await interaction.reply({
						content: `Transcript: ||${prettifiedChars}||`,
						files: [result,],
					});
				}
			} else {
				await interaction.reply("Internal error");
				console.log('result:', result);
			}
		},
	},
	{
		data: createSlashCommand({
			name: 'quiz',
			description: 'quiz on script chars',
		}, builder => {

			builder.addSubcommand(command => {
				command
					.setName("secondaries")
					.setDescription("Consonantal chars");
				return createOptions(command);
			});

			builder.addSubcommand(command => {
				command
					.setName("affixes")
					.setDescription("VxCs/CsVx affixes");
				return createOptions(command);
			});

			builder.addSubcommand(command => {
				command
					.setName("extensions")
					.setDescription("Consonant extensions");
				return createOptions(command);
			});

			builder.addSubcommand(command => {
				command
					.setName("cases")
					.setDescription("Case characters");
				return createOptions(command);
			});

			builder.addSubcommand(command => {
				command
					.setName("ill_val")
					.setDescription("Illocutions & Validations");
				return createOptions(command);
			});

			builder.addSubcommand(command => {
				command
					.setName("primary_bottom_ext")
					.setDescription("Primary Bottom Extensions");
				return createOptions(command);
			});

			return builder;
		}),
		exec: async interaction => {
			// const subcommand = interaction.options.get('_subcommand')?.value 
			// TODO: there's probably a better way to do this
			const subcommand = interaction.options['_subcommand'];

			// defined a timeout for the quiz

			// createQuizOptions
			const result = initiateQuiz(interaction, new QuizOptionsModel(interaction.options, subcommand));

			if(typeof result !== 'string') {
				// TODO: insert quiz data & embed perhaps
				
				await interaction.reply(`Quiz started.`);
				try {
					await result.activate(
						async result => {
							await interaction.followUp({
								// content: `Answer: ||${result.answer}||`,
								files: [result.image,],
							});
						},
						async (answer: string|string[]) => {
							await interaction.followUp(`Too late. Answer was \`${Array.isArray(answer) ? answer.join('/') : answer}\``);
						},
						async (winner: User, answer: string|string[]) => {
							await interaction.followUp(`Well done <@${winner.id}>! Answer was \`${Array.isArray(answer) ? answer.join('/') : answer}\``);
						},
						async (stats) => {
							// TODO: elaborate
							await interaction.followUp(`Quiz ended.`);
						}
					);
				} catch(e) {
					await interaction.followUp("Internal error");
					console.log('e:', e);
				}
			} else {
				// TODO: elaborate
				await interaction.reply("You're already engaged in something. Please cancel it or wait 1m till it expires");
			}
			return subcommand;
		},
	},
	{
		data: createSlashCommand({
			name: 'affixes',
			description: 'random affixes',
		}, x => {
			//createOptions(x);
			x.addBooleanOption(option => 
			  option
					.setName("slot_vi")
					.setDescription("mix in slot VI affixes (inverted)")
			 )
			.addStringOption(option => 
			  option
					.setName("font")
					.setDescription("which font should I use")
					.addChoices(
						{
							name: "calligraphic",
							value: "basic", 
						},
						{
							name: "handwritten",
							value: "flow", 
						}
					)
			)
			return x;
		})
		,
		exec: async interaction => {
			const options = new QuizOptionsModel(interaction.options);
			options.inversions = interaction.options.get('slot_vi')?.value || false;
			const result = await generateAffix(options);
			const { image, answer, } = result;

			if(result) {
				if(typeof result === 'string')
					await interaction.reply(result);
				else {
					await interaction.reply({
						content: `Transcript: ||${Array.isArray(answer) ? answer.join('/') : answer}||`,
						files: [image,],
					});
				}
			} else {
				await interaction.reply("Internal error");
				console.log('result:', result);
			}
		},
	},
];

const contextMenuCommands = [
	{
		comm: new ContextMenuCommandBuilder()
			.setName("Render a reply")
			.setType(ApplicationCommandType.Message),
	},
];


// Listen for interactions
client.on(Events.InteractionCreate, async interaction => {

	// Run slash command function on its receipt
	if (interaction.isChatInputCommand()) {
		const comm = commands.find(c => c.data?.name === interaction.commandName);
		if(comm) {
			try {
				await comm.exec(interaction);
			} catch(e) {
				console.log('error! =>', e);
				try {
					await interaction.reply("An error occurred running this command. It has been logged");
				} catch(e) {}
			}
		}
	} else if(interaction.isMessageContextMenuCommand()) {
		  const message = interaction.targetMessage; // This is the message that was right-clicked
		  // TODO: grab options input
		  // render a response
	} else 
		return;
	
});


// Listen for commands via message
client.on(Events.MessageCreate, async message => {

	// Ignore messages from bots
	if (message.author.bot) return;

	// Check prefix
	if(message.content.startsWith(config.prefix)) {
		// Check if the message is a reply to another message
		if (message.type === 19 && message.reference?.messageId) {
			try {
				const repliedMessage = await message.channel.messages.fetch(message.reference.messageId);
				// if(repliedMessage.interactionMetadata)
				// console.log('metadata:', repliedMessage.interactionMetadata.user);
				
				// console.log('User replied to a message:');
				// console.log('Original Message:', repliedMessage.content);
				// console.log('Reply Content:', message.content);

				// You can now do something with repliedMessage
				const array = message.content.split(' ');
				const content = array.slice(1).join(' ');
				if(content.length < 1) {
					message.reply("no text provided");
					return;
				}
				const command = array[0].replace(config.prefix, '');
				let ping = false;
				let handwritten = false;
				let commandFound = false;
				// if command is one of
				if(['r', 'render',].some(x => x === command)) 
					commandFound = true;
				
				else if(['rh', 'renderHandwritten',].some(x => x === command)) {
					commandFound = true;
					handwritten = true;
				} else if(['rp', 'renderPing',].some(x => x === command)) {
					commandFound = true;
					ping = true;
				} else if(['rhp', 'renderHandwritenPing',].some(x => x === command)) {
					commandFound = true;
					handwritten = true;
					ping = true;
				} else 
					commandFound = false;
				

				if(commandFound) {
					let result: AttachmentBuilder | string | null;
					try {
						result = await render(content, handwritten ? "flow" : "basic");
					} catch(e) {
						result = null;
						if(e.name === 'PARSING_ERROR') 
							result = `Parsing error: ${e.message}`;
						 else 
							console.log(e);
						
					}
					if(result) {
						if(typeof result === 'string') // prolly a parsing error
							await message.reply(result);
						else {
							// check it was sent by us
							let originatingUserId: string | null = null;
							if(repliedMessage.embeds?.length > 0) {
								const embed = repliedMessage.embeds?.[0];
								const match = embed.footer.text.match(/User ID:\s*(\d{17,})/);
								originatingUserId = match ? match[1] : null;
							} else if(repliedMessage.author.bot === false && repliedMessage.author.id !== message.author.id) 
								originatingUserId = repliedMessage.author.id;
							
							await repliedMessage.reply(createUserEmbed(message.author, result, content, ping && originatingUserId ? originatingUserId : null));
							try {
								await message.delete();
							} catch(e) {
								console.log("Couldn't delete message");
							}
						}
					} else {
						// TODO: make ephemeral
						await message.reply("Internal error");
						console.log('result:', result);
					}
				} else 
					throw new Error();
				
			} catch (err) {
				console.error('Failed to fetch the replied-to message:', err);
			}
		} else 
			await passMessage(message);
		
	} else {
		// skip bot commands and the like
		if(/^[\$\.\!\-]/.test(message.content)) 
			return;
		// pass off to quizzes based on channels
		await passMessage(message);
		return;
	}
	
});


client.on(Events.MessageReactionAdd, async (reaction, emojiAuthor) => {
	let messageInitiatorId: Snowflake;
	let message: Message;

	try {
		if(reaction.partial)
			await reaction.fetch();
		message = await reaction.message.fetch();
		messageInitiatorId = getCommandSenderId(message);
	} catch(e) {
		console.log(e);
	}


	if(emojiAuthor.bot) 
		return;
	
	
	// if the emoji is right, if it was a message sent by us, and if the user who sent it was the same as the one who reacted to it
	// TODO: 5 day limit
	if(reaction.emoji.name === '❌' && emojiAuthor.id === messageInitiatorId) {
		try {
			console.log('delete based on reaction');
			await reaction.message.delete();
		} catch(e) {
			console.log("Couldn't delete message after emoji reaction");
		}
	} else {
		// console.log('extraneous reaction');
		// console.log({ emojiAuthor, emoji: reaction.emoji.name, messageInitiatorId, })
	}
});

// type OurMessage<InGuild extends boolean> = typeof Message<InGuild>

function getCommandSenderId(message: Message): Snowflake {
	let originatingUserId;

	if(message.author.id !== client.user.id)
		throw "RECEIVED_FOREIGN_MESSAGE";

	if(message.interactionMetadata) {
		const metadata = message.interactionMetadata;
		originatingUserId = metadata.user.id;
	} else if(message.embeds?.length > 0) {
		const embed = message.embeds?.[0];
		const match = embed.footer.text.match(/User ID:\s*(\d{17,})/);
		originatingUserId = match ? match[1] : null;
	}
	if(!originatingUserId) 
		throw "ERR";
		
	return originatingUserId;
}


// function passMessage(message: Message) {
async function passMessage(message: Message): Promise<boolean> {
	// check quizzes, private, then group
	const engagement = engagedUsers[message.author.id];
	let quiz = quizzes[message.channel.id]?.publicQuiz;
	// first check for private quizzes
	if(engagement) {
		// find quiz & pass off data
		// return its result (accepted, rejected)
		quiz = quizzes[message.channel.id]?.privateQuizzes?.get(engagement.commandId);
		if(quiz && message.author.id === engagement.userId)
			await quiz.receiveAttempt(message);
		return true;
	} else if(quiz) { // then check public quizzes
		await quiz.receiveAttempt(message);
		return true;
	} else { // otherwise fail
		return false;
	}
}

function createUserEmbed(user: User, image: AttachmentBuilder, text: string, mention: null | Snowflake = null) {
	return {
		content: mention ? `<@${mention}>` : null, // ping if desired
		embeds: [
			new EmbedBuilder()
				.setAuthor({
					name: `${user.tag}`, // Shows as clickable in Discord UI
					iconURL: user.displayAvatarURL({ size: 64, }),
					// url: `https://discord.com/users/${user.id}` // Makes username clickable
				})
				.setTitle(`||${text}||`)
			// .setImage(imageUrl) // Big wide image here
				.setImage(`attachment://image.png`)
				.setColor(0x5865F2) // Discord blurple
				.setFooter({ text: `User ID: ${user.id}`, })
				.setTimestamp(),
		],
		files: [image,],
		allowedMentions: {
			users: mention ? [mention,] : [],
		// repliedUser: mention ? true : false
		},
	};
}




// Log in the bot
client.login(secrets.token);

// Reset the bot's slash commands
const rest = new REST({ version: '10', }).setToken(secrets.token);

try {
	console.log('Started refreshing application (/) commands.');

	await rest.put(Routes.applicationCommands(secrets.id), { body: commands.map(x => x.data), });
	// await rest.put(Routes.applicationCommands(secrets.id), { body: commands.map(x => x.data) });

	console.log('Successfully reloaded application (/) commands.');
} catch (error) {
	console.error(error);
}

export default client;
