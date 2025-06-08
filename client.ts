import { Client, Events, GatewayIntentBits, REST, Routes, SlashCommandBuilder, AttachmentBuilder } from 'discord.js'
import { textToScript } from '@zsnout/ithkuil/script/index.js'
//import puppeteer from 'puppeteer'
import { Resvg } from '@resvg/resvg-js';
import secrets from './secrets.json' with { type: 'json' }
// import { NewMemoryFace, RenderMode } from 'freetype2';
import { writeFileSync } from 'fs';
import text2png from 'text2png';
import { PRIMARY_CORES, PRIMARY_TOP_LEFT, PRIMARY_BOTTOM_RIGHT, PRIMARY_TOP_RIGHT, PRIMARY_BOTTOM_LEFT } from './textConversionInformation.js';
// import createSVG from './svg.js'

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
function svgToPngWithResvg(svgText) {
	console.log(svgText);
	return new Resvg(svgText, {
		fitTo: { mode: 'width', value: 512 }
	}).render().asPng();
}
function getCharType(chr) {
	if(chr.stem)
		return 1;
	if(chr.core)
		return 2;
	if(chr.aspect)
		return 3;
	return 4;
}
function fillDefaultsPrimary(char) {
	var core = PRIMARY_CORES[char.specification || "BSC"];
	const topLeft = PRIMARY_TOP_LEFT[char.perspective || "M"][char.extension || "DEL"];
	const bottomRight = PRIMARY_BOTTOM_RIGHT[char.function || "STA"][char.version || "PRC"][char.configuration?.startsWith("D") ? "D" : "M"][char.stem ?? 1];
	const topRight = PRIMARY_TOP_RIGHT[char.essence || "NRM"][char.affiliation || "CSL"];
	const bottomLeft = PRIMARY_BOTTOM_LEFT[char.configuration || "PX"];
	if(topLeft)
		core += `^${topLeft}`;
	if(bottomRight)
		core += `_${bottomRight}`;
	if(topRight)
		core += `>${topRight}`;
	if(bottomLeft)
		core += `<${bottomLeft}`;
	return core;
}
function specialMarkersToCharacters(name) {
	switch(name) {
		case "CORE_GEMINATE":
			return "=";
		case "DOT":
			return "a";
		default:
			return name;
	}
}
function fillDefaultsSecondary(char) {
	var core = char.core || "}";
	if(char.top)
		core += `^${specialMarkersToCharacters(char.top)}`;
	if(char.bottom)
		core += `_${specialMarkersToCharacters(char.bottom)}`;
	if(char.superposed)
		core += `^${specialMarkersToCharacters(char.superposed)}`;
	if(char.underposed)
		core += `_${specialMarkersToCharacters(char.underposed)}`;
	return core;
}
function fillDefaultsTertiary(char) {
	return "";
}
function fillDefaultsQuaternary(char) {
	return "";
}
function rawInputToIthkuilFormattedString(rawIn) {
	console.log(rawIn);
	if(!rawIn.ok)
		return "";
	var outstr = "";
	rawIn.value.forEach((chr) => {
		// console.log(typeof(chr.construct));
		switch(getCharType(chr)) {
			case 1:
				outstr += fillDefaultsPrimary(chr);
				break;
			case 2:
				outstr += fillDefaultsSecondary(chr);
				break;
			case 3:
				outstr += fillDefaultsTertiary(chr);
				break;
			case 4:
				outstr += fillDefaultsQuaternary(chr);
				break;
		}
	});
	return outstr;
}
function drawCharsFromRaw(rawInput) {
	var rawInputAsString = rawInputToIthkuilFormattedString(rawInput);
	var pngBytes = text2png(rawInputAsString, {
		font: '100px IthkuilBasic',
		localFontPath: "/home/tortus/Downloads/IthkuilBasic.ttf",
		localFontName: "Ithkuil Basic",
		color: 'white'
	});
	return pngBytes;
	// writeFileSync('test.png', pngBytes);
}

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
				// const svgRaw = await renderWord(text);
				// const svgRaw = await createSVG(text);
				// console.log("svg:", svg)
				// if(svg.ok !== true)
					// throw new Error((svg as { reason: string }).reason);
				// const pngBuffer = await svgToPng(svg.value)
				//const pngBuffer = await svgToPngWithPuppeteer(svg.value)
				// console.log('type:', svg.value);
				// const pngBuffer = await svgToPngWithResvg(svg.value)
				// const pngBuffer = await svgToPngWithResvg(svgRaw)
				const pngBuffer = await drawCharsFromRaw(svgRaw);
				// const pngBuffer = "";
				// console.log("pngBuffer:", pngBuffer)
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
