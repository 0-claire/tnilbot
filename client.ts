import { Client, Events, GatewayIntentBits, REST, Routes, SlashCommandBuilder, AttachmentBuilder } from 'discord.js'
import { textToScript } from '@zsnout/ithkuil/script/index.js'
//import puppeteer from 'puppeteer'
import { Resvg } from '@resvg/resvg-js';
import secrets from './secrets.json' with { type: 'json' }
import createSVG from './svg.js'

// TODO: move code into commands/ and into svg.ts(x) or tnil.ts(x)


// currently unused
// sharp doesn't support needed svg features
//function svgToPng(svgText) {
//	return sharp(Buffer.from(svgText))
//			.png()
//			.toBuffer();
//}

// currently unused
// not entirely sure why resvg didn't work
//function svgToPngWithResvg(svgText) {
//	return new Resvg(svgText, {
//		fitTo: { mode: 'width', value: 512 }
//	}).render().asPng();
//}


// TODO: puppeeteer might work it just won't install (claire@infinity). Test it
//async function svgToPngWithPuppeteer(svg, options = {}) {
//  const browser = await puppeteer.launch();
//  const page = await browser.newPage();
//
//  const width = options.width || 512;
//  const height = options.height || 512;
//
//  await page.setViewport({ width, height });
//
//  const html = `
//    <html>
//      <body style="margin:0; padding:0; display:flex; align-items:center; justify-content:center;">
//        ${svg}
//      </body>
//    </html>
//  `;
//
//  await page.setContent(html);
//  const elementHandle = await page.$('svg');
//  const screenshotBuffer = await elementHandle.screenshot({ omitBackground: true });
//
//  await browser.close();
//  return screenshotBuffer;
//}

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
				// const svg = await textToScript(text);
				// const svgRaw = await renderWord(text);
				const svgRaw = await createSVG(text);
				// console.log("svg:", svg)
				// if(svg.ok !== true)
					// throw new Error((svg as { reason: string }).reason);
				// const pngBuffer = await svgToPng(svg.value)
				//const pngBuffer = await svgToPngWithPuppeteer(svg.value)
				// console.log('type:', svg.value);
				// const pngBuffer = await svgToPngWithResvg(svg.value)
				const pngBuffer = await svgToPngWithResvg(svgRaw)
				console.log("pngBuffer:", pngBuffer)
				result = new AttachmentBuilder(pngBuffer, { name: 'image.png' });
				console.log("result:", result)
			} catch(e) {
				result = null;
				console.log(e);
			}
			// console.log('running subcommand for interaction:', interaction);
			// await interaction.reply(interaction.options.get('text') || 'no result');
			// console.log('interaction.text:', interaction.options.get('text'));
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
