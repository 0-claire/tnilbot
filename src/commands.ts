import {
	SlashCommandBuilder, AttachmentBuilder, SlashCommandSubcommandBuilder, SlashCommandSubcommandsOnlyBuilder,
	User,
    Interaction,
    ChatInputCommandInteraction,
    SlashCommandStringOption,
} from 'discord.js';
import { render, } from './transform.js';
import config from './config.js';
import {initiateQuiz, QuizOptionsModel,} from './quiz.js';
import {
    formatResultsForDiscord,
	searchLexicon, type SearchCommandOptions, type SearchField, 
} from './search.js';
import {
	generateChar, generateSecondary, generateAffix, 
} from './generator.js';

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

function createSearchCommandOptions(builder: SlashCommandSubcommandBuilder): typeof builder {
	builder
		.addStringOption(option => 
			option
				.setName('terms')
				.setDescription("The text to search for")
				.setRequired(true)
		)
		.addBooleanOption(option =>
			option.setName("ignore_punctuation")
				.setDescription("Ignore punctuation while searching")
		)
		.addStringOption((option: SlashCommandStringOption) =>
			option 
				.setName("field")
                .setDescription("fields to search")
				.addChoices(<{name: string, value: SearchField}[]>[
                    {
                        name: "all",
                        // name: "any (default)",
                        value: "all",
                    }, {
                        name: "name",
                        value: "name",
                    }, {
                        name: "description",
                        value: "description",
                    }, {
                        name: "notes",
                        value: "notes",
                    }, {
                        name: "value",
                        value: "value",
                    }
                ])
		);
	;
	return builder;
}

function createQuizCommandOptions(innerBuilder: SlashCommandSubcommandBuilder): typeof innerBuilder {
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

// const contextMenuCommands = [
// 	{
// 		comm: new ContextMenuCommandBuilder()
// 			.setName("Render a reply")
// 			.setType(ApplicationCommandType.Message),
// 	},
// ];


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
				result = await render(text, font);
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
				result = await render(randomChars, font);
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
				return createQuizCommandOptions(command);
			});

			builder.addSubcommand(command => {
				command
					.setName("affixes")
					.setDescription("VxCs/CsVx affixes");
				return createQuizCommandOptions(command);
			});

			builder.addSubcommand(command => {
				command
					.setName("extensions")
					.setDescription("Consonant extensions");
				return createQuizCommandOptions(command);
			});

			builder.addSubcommand(command => {
				command
					.setName("cases")
					.setDescription("Case characters");
				return createQuizCommandOptions(command);
			});

			builder.addSubcommand(command => {
				command
					.setName("ill_val")
					.setDescription("Illocutions & Validations");
				return createQuizCommandOptions(command);
			});

			builder.addSubcommand(command => {
				command
					.setName("primary_bottom_ext")
					.setDescription("Primary Bottom Extensions");
				return createQuizCommandOptions(command);
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
				);
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
				console.log('result:', result)
			}
		},
	},
	{ 
		data: createSlashCommand({
			name: "search",
			description: "Search for roots and/or affixes",
			// description: "Search for roots, affixes, morphology categories, or morphemes",
		}, builder => {
			const subcommands = [
				["lexicon", "Root, affix, and bias search",],
				["roots", "Search for word roots",],
				["affixes", "Search for affixes",],
				["morphology", "Search for morphemes",],
			];
			subcommands.forEach(([name, description,]) => {
				builder.addSubcommand(command => {
					command
						.setName(name)
						.setDescription(description);
					return createSearchCommandOptions(command);
				});
			});
			return builder;
		})
		,
		async exec(interaction: ChatInputCommandInteraction) {
			const options: SearchCommandOptions = {
				terms: interaction.options.get('terms')?.value || "",
				field: interaction.options.get('field')?.value || 'all',
				ignore_punctuation: interaction.options.get('ignore_punctuation')?.value || true,
				regex: interaction.options.get('regex')?.value || false,
			};
			const subcommand = interaction.options['_subcommand'];

			try {
				const result = searchLexicon(subcommand, {
					keyword: options.terms,
					fields: ['notes','description','name','value'],
				});
				await interaction.reply(formatResultsForDiscord(result));
			} catch(e) {
				console.log(e);
				await interaction.reply("An error occurred while searching. Please check your options and try again.");
			};
		},
	},
];

export default commands;
