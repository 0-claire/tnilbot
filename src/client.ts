import {
	Client, Events, GatewayIntentBits, REST, Routes, AttachmentBuilder, EmbedBuilder, User, Snowflake, Message, Partials, 
} from 'discord.js';
import secrets from '../secrets.json' with { type: 'json' };
import { render, } from './transform.js';
import config from './config.js';
import { engagedUsers, quizzes, } from './quiz.js';
import commands, { searches, updateSearch } from './commands.js';
// import { type Font, } from './util.js';

// TODO: move code into commands/ and into svg.ts(x) or tnil.ts(x)


export async function shutdownClient(): Promise<void> {
	// Shutdown quizzes
	await shutdownQuizzes("Bot restarting");
};

async function shutdownQuizzes(reason: string): Promise<void> {
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
	partials: [Partials.Message, Partials.Channel, Partials.Reaction,],
});

// Log successful login
client.on(Events.ClientReady, readyClient => {
	console.log(`Logged in as ${readyClient.user.tag}!`);
});



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
		if(/^[$.!-]/.test(message.content)) 
		// if(/^[\$\.\!\-]/.test(message.content)) 
			return;
		// pass off to quizzes based on channels
		await passMessage(message);
		return;
	}
	
});


client.on(Events.MessageReactionAdd, async (_reaction, emojiAuthor) => {
	let message: Message = await _reaction.message.fetch();
	let reaction = await _reaction.fetch();
	let messageInitiatorId: Snowflake = getCommandSenderId(message);


	if(emojiAuthor.bot) 
		return;
	
	
	// if the emoji is right, if it was a message sent by us, and if the user who sent it was the same as the one who reacted to it
	// TODO: 5 day limit
    
    switch (reaction.emoji.name) {
      case '❌':
        if(emojiAuthor.id === messageInitiatorId) {
            try {
                console.log('delete based on reaction');
                await reaction.message.delete();
            } catch(e) {
                console.log("Couldn't delete message after emoji reaction");
            }
        }
        break;
      case '⏮️':
        if(searches[reaction.message.id]) {
        updateSearch((await reaction.message.fetch()), (search) => {
          search.page = 0;
          return search;
        })
        try {
          searchReactions(message)
        } catch(e) {
          console.error("Couldn't reset reaction");
          console.error(e);
        }
      }
        break;
      case '⬅️':
        if(searches[reaction.message.id]) {
        updateSearch((await reaction.message.fetch()), (search) => {
          if(search.page > 0)
            search.page--;
          return search;
        })
      }
        try {
          searchReactions(message)
        } catch(e) {
          console.error("Couldn't reset reaction");
          console.error(e);
        }
        break;
      case '➡️':
        if(searches[reaction.message.id]) {
        updateSearch((await reaction.message.fetch()), (search) => {
          if(search.page < search.formattedResults.length -1)
          search.page++;
          return search;
        })
      }
        try {
          searchReactions(message)
        } catch(e) {
          console.error("Couldn't reset reaction");
          console.error(e);
        }
        break;
      case '⏭️':
        if(searches[reaction.message.id]) {
        updateSearch(message, (search) => {
          search.page = search.formattedResults.length -1;
          return search;
        })
      }
        try {
          searchReactions(message)
        } catch(e) {
          console.error("Couldn't reset reaction");
          console.error(e);
        }
        break;

      default:
        break;
    }
		// console.log('extraneous reaction');
		// console.log({ emojiAuthor, emoji: reaction.emoji.name, messageInitiatorId, })
});

async function searchReactions(message: Message) {
  for(const _reaction of (await message.awaitReactions())) {
    const [str, unfetchedReaction] = _reaction;
    const reaction = await unfetchedReaction.fetch();

    if(['⏮️','⬅️','➡️','⏭️'].find(x => x === reaction.emoji.name || x === reaction.emoji.toString() || x === reaction.emoji.id)) {
      reaction.remove()
    }
    // reaction.emoji.name
  }
  for(const emoji of ['⏮️','⬅️','➡️','⏭️']) {
    await message.react(emoji);
  }
}

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
// client.login(secrets.token);

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
