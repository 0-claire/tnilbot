import { Client, Events, GatewayIntentBits, REST, Routes, SlashCommandBuilder, AttachmentBuilder } from 'discord.js'
import { textToScript } from '@zsnout/ithkuil/script/index.js'
import puppeteer from 'puppeteer'
import secrets from './secrets.json' with { type: 'json' }

// const commands = [
	// {
		// name: 'render',
		// description: 'Renders into TNIL script',
	// },
// ];

function svgToPng(svgText) {
	return sharp(Buffer.from(svgText))
			.png()
			.toBuffer();
}

async function svgToPngWithPuppeteer(svg, options = {}) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const width = options.width || 512;
  const height = options.height || 512;

  await page.setViewport({ width, height });

  const html = `
    <html>
      <body style="margin:0; padding:0; display:flex; align-items:center; justify-content:center;">
        ${svg}
      </body>
    </html>
  `;

  await page.setContent(html);
  const elementHandle = await page.$('svg');
  const screenshotBuffer = await elementHandle.screenshot({ omitBackground: true });

  await browser.close();
  return screenshotBuffer;
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on(Events.ClientReady, readyClient => {
	console.log(`Logged in as ${readyClient.user.tag}!`);
});

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
				const svg = await textToScript(text);
				console.log("svg:", svg)
				if(!svg.ok)
					throw new Error(svg.reason);
				// const pngBuffer = await svgToPng(svg.value)
				const pngBuffer = await svgToPngWithPuppeteer(svg.value)
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

client.login(secrets.token);

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
