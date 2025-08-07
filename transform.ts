import { AttachmentBuilder, } from 'discord.js';
import text2png from 'text2png';
import { createCanvas, registerFont } from 'canvas';
import { Result, textToScript, } from '@zsnout/ithkuil/script/index.js';
import {
	PRIMARY_CORES, PRIMARY_TOP_LEFT, PRIMARY_BOTTOM_RIGHT, PRIMARY_TOP_RIGHT, PRIMARY_BOTTOM_LEFT, DIACRITICS, TERTIARY_VALENCES, TERTIARY_ASPECTS_PHASES_EFFECTS, LEVELS, CASE_ILLOCUTION_VALIDATION, CASE_SCOPE, MOOD, REGISTER, BIASES, PRIMARY_CONTEXTS, 
} from './textConversionInformation.js';
import config from './config.js';
import { Font, } from './util.js';

type CharType =  -1|1|2|3|4|5|6|7;

function getCharType(chr): CharType {

	if(['stem', 'specification', 'context',].some(p => chr.hasOwnProperty(p)))
		return 1;
	else if(chr.core)
		return 2;
	else if(typeof chr.value === 'string')
		return 4;
	else if(['absoluteLevel', 'valence', 'relativeLevel',].some(p => chr.hasOwnProperty(p)))
		return 3;
	else if(chr.bias) // bias
		return 5;
	else if(chr.mode) // register (type) x mode (mode)
		return 6;
	else if(typeof chr.value === 'number')
		return 7; // numerals
	else
		return -1; // otherwise this is a break character here
}

function fillDefaultsPrimary(char) {
	let core = PRIMARY_CORES[char.specification || "BSC"];
	const topLeft = PRIMARY_TOP_LEFT[char.perspective || "M"][char.extension || "DEL"];
	const bottomRight = PRIMARY_BOTTOM_RIGHT[char.function || "STA"][char.version || "PRC"][char.configuration?.startsWith("D") ? "D" : "M"][char.stem ?? 1];
	const topRight = PRIMARY_TOP_RIGHT[char.essence || "NRM"][char.affiliation || "CSL"];
	const plexity = char.configuration || "PX";
	const bottomLeft = PRIMARY_BOTTOM_LEFT[plexity.substring(plexity.length-2)];
	const superposed = PRIMARY_CONTEXTS[char.context];

	if(topLeft)
		core += `^${topLeft}`;
	// console.log('bottomright:', bottomRight);
	if(bottomRight)
		core += `_${bottomRight}`;
	if(topRight)
		core += `>${topRight}`;
	if(bottomLeft)
		core += `<${bottomLeft}`;
	if(superposed)
		core += `^^${superposed}`;
	if(char.bottom) {
		if(bottomRight)
			core += "_";
		core += `_${specialMarkersToCharacters(DIACRITICS[char.bottom])}`;
	}
	if(char.isSentenceInitial && core == "\\")
		return ""; //elisions
	if(char.isSentenceInitial && core == "\\_a")
		return "·";
	return core;
}

function specialMarkersToCharacters(name) {
	switch(name) {
	case "CORE_GEMINATE": return "=";
	case "EXTENSION_GEMINATE": return "≈";
	case "STANDARD_PLACEHOLDER": return "}";
	case "DOT": return "a";
	case "HORIZ_BAR": return "ä";
	case "CURVE_TO_LEFT": return "ò";
	case "CURVE_TO_RIGHT": return "ó";
	case "HORIZ_WITH_BOTTOM_LINE": return "e";
	case "HORIZ_WITH_TOP_LINE": return "ë";
	case "CURVE_TO_TOP": return "o";
	case "CURVE_TO_BOTTOM": return "ö";
	case "VERT_WITH_LEFT_LINE": return "ü";
	case "VERT_WITH_RIGHT_LINE": return "u";
	case "DIAG_BAR": return "i";
	case "VERT_BAR": return "ï";
	case "ALPHABETIC_PLACEHOLDER": return "{";
	default: return name;
	}
}

function fillDefaultsSecondary(char) {
	let core = specialMarkersToCharacters(char.core || "STANDARD_PLACEHOLDER");
	if(char.rotated)
		core += "'";
	if(char.top)
		core += `^${specialMarkersToCharacters(char.top)}`;
	if(char.bottom)
		core += `_${specialMarkersToCharacters(char.bottom)}`;
	if(char.superposed)
		core += `^${specialMarkersToCharacters(char.superposed)}`;
	if(char.underposed) {
		if(char.bottom)
			core += "_"; // place lower just so it looks better
		core += `_${specialMarkersToCharacters(char.underposed)}`;
	}
	if(char.right)
		core += `>>${specialMarkersToCharacters(char.right)}`;
	// TODO: move this further right with chars like k
	if(char.left)
		core += `<${specialMarkersToCharacters(char.left)}`;
	return core;
}

function fillDefaultsTertiary(char) {
	// contents: valence, aspect, level, phase, effect
	let valence = "";
	valence += TERTIARY_VALENCES[char.valence || "MNO"];
	if(char.top)
		valence += `^${TERTIARY_ASPECTS_PHASES_EFFECTS[char.top]}`;
	if(char.bottom)
		valence += `_${TERTIARY_ASPECTS_PHASES_EFFECTS[char.bottom]}`;
	if(char.superposed) 
		valence += `^^${specialMarkersToCharacters(char.superposed)}`;
	
	if(char.underposed) {
		if(char.bottom)
			valence += "_";
		valence += `^${specialMarkersToCharacters(char.underposed)}`;
	}
	if(char.relativeLevel) 
		valence += `_${LEVELS[char.relativeLevel]}`;
	
	if(char.absoluteLevel) 
		valence += `_${LEVELS[char.absoluteLevel]}`;
	
	return valence;
}

function fillDefaultsQuaternary(char) {
	// contents: case, illocution, validation, mood
	console.log('quat:', char);
	let bar = "|";
	if(char.value) {
		const ext = CASE_ILLOCUTION_VALIDATION[char.value];
		if(typeof ext === 'string') 
			bar += `${ext}`;
		 else {
			if(ext.top)
				bar += `^${ext.top}`;
			if(ext.bottom)
				bar += `_${ext.bottom}`;
		}
	}
	if(char.mood && MOOD[char.mood])
		bar += `^${MOOD[char.mood]}`;
	if(char.caseScope && CASE_SCOPE[char.caseScope])
		bar += `_${CASE_SCOPE[char.caseScope]}`;
	if(typeof char.type === 'number') {
		if(char.isSlotVIIAffix) {
			if(char.isInverse)
				bar += `_aó`;
			else
				bar += `_aò`;
		} else {
			if(char.isInverse)
				bar += `_ó`;
			else
				bar += `_ò`;
		}

		switch(char.type) {
		case 2:
			bar += `^a`;
			break;
		case 3:
			bar += `^ä`;
			break;
		default:
			break;
		}
	}
	// ellision; only elide Cr root verbal quats with ASR and default values besides validation, and nominal quats with default values that are not affixes.
	// Never elide referential quaternaries, and don't elide Cs root or personal reference root quaternaries with non-OBS validation or non-THM case as they can't be shown with diacritics
	// this check doesn't elide quats for Cr root formatives with default values besides case or ill+val
	// TODO: check for diacritics such as rps, concat, etc
	// TODO: we may need a more robus processor that can identify formatives and elide chars from them and apply the information as diacritics to previous chars, unless zsnout allows for such through a parameter
	if(typeof char.type !== 'number' && (char.value === "OBS" || char.value === 'THM') && char.mood === undefined && char.caseScope === undefined && !char.isSlotVIIAffix && char.isSentenceInitial === true)
		return "";
	// if(char.mood === undefined && char.caseScope === undefined && !char.belongsToReferential && !char.belongsToCsFormative)
		// return "";
	else
		return bar;
}

function fillDefaultsRegisterMode(char) {
	return REGISTER[char.type || 'NRR'][char.mode];
}

function fillBiasChar(char) {
	let bias = "Ʃ";
	const ext = BIASES[char.bias];
	if(ext.dot === 'right')
		bias += `${ext.prefix}>${specialMarkersToCharacters(DIACRITICS[ext.ext])}`;
	else if(ext.dot === 'left')
		bias += `${ext.prefix}<${specialMarkersToCharacters(DIACRITICS[ext.ext])}`;
	else {
		let sub = "";
		let newExt = ext;
		if(/'/.test(newExt)) {
			newExt = newExt.replace(/'/, '');
			sub += "'";
		} if(/_/.test(ext)) {
			const prior = newExt;
			newExt = newExt.replace(/_E/, 'E');
			newExt = newExt.replace(/_C/, 'C');
			if(prior !== newExt)
				sub += "_";
		} if(/\^/.test(newExt)) {
			newExt = newExt.replace(/\^/, '');
			sub += "^";
		}
		console.log('sub:', sub);
		console.log('newExt:', newExt);
		bias += sub;
		bias += specialMarkersToCharacters(newExt);
	}
	return bias;
}


function fillDefaultsNumeral(char): string {
	// process numerals by concatting their values and then converting to int
	const str = char.value.toString();
	let outtext = char.value.toString().at(-1); // 1's place is main char

	if(str.length > 3 && str.at(-4) !== '0') // thousands
		outtext += `<${str.at(-4)}`;
	if(str.length > 2 && str.at(-3) !== '0') // hundreds
		outtext += `^${str.at(-3)}`;
	if(str.length > 1 && str.at(-2) !== '0') // tens
		outtext += `_${str.at(-2)}`;

	return outtext;
}

function parserObjectToFontCompatibleString(rawIn) {
	// console.log('rawIn:', rawIn);
	// TODO: throw and catch error, informing user
	let outstr = "";
	rawIn.forEach((chr) => {
		const charType = getCharType(chr);
		// console.log(`processing char of type ${charType}:`, chr);
		switch(charType) {
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
		case 5:
			outstr += fillBiasChar(chr);
			break;
		case 6:
			outstr += fillDefaultsRegisterMode(chr);
			break;
		case 7:
			outstr += fillDefaultsNumeral(chr);
			break;
		default:
			break;
		}
		// console.log('outstr:', outstr)
	});
	return outstr;
}


function parserObjToFontChars() {
}


export async function render(text, font, spacing: boolean = config.rendering.spaceBetweenWords) {
	let parserObjects: Result<any>[];

	if(spacing === true) {
		// Parse text
		const phrases = text.split(' ');
		// const vowels = '[aeiouäëïöüáéíóúâêîôû']'
		const modularAdjunctRegex = /^['wy]?[aeiouäëïöüáéíóúâêîôû]+(w|y|h[lrmnň]?w?)?/;
		const affixualAdjunctRegex = /^[aeiouäëïöüáéíóúâêîôû]+[^aeiouäëïöüáéíóúâêîôû]+[aeiouäëïöüáéíóúâêîôû]{0,2}/;
		const multipleAffixAdjunctRegex = /^ë?'?h[wrl]?/;
		const regexA = /^h([nmň][aeiouäëïöüáéíóúâêîôû']{1,3}|([aeou]?i?|iu))/;
		const regexB = /^ah[nmň][aeiouäëïöüáéíóúâêîôû']{1,3}x/;
		// TODO: honestly why not just use the parser to determine if it's a suppletive or carrier
		// TODO: or even just add spaces after quat chars or before prim chars
		const regexC = /^(([wy]|h[wrl]?)?[aeiouäëïöüáéíóúâêîôû']{1,3}s|s[aeiouäëïöüáéíóúâêîôû']{1,3}[^aeiouäëïöüáéíóúâêîôûxy])/;
		for(let i = phrases.length -1; i > 0; i--) {
			console.log('i:', i);
			const currentPhrase = phrases[i];
			const previousPhrase = phrases[i-1];

			if(regexA.test(previousPhrase.toLowerCase()) ||
			   regexB.test(previousPhrase.toLowerCase()) ||
			   modularAdjunctRegex.test(previousPhrase.toLowerCase()) || // Don't separate aspect adjuncts & others
			   regexC.test(previousPhrase.toLowerCase())
			  ) {
				console.log(`phrase ${currentPhrase} matches`);
				phrases[i-1] = `${previousPhrase} ${currentPhrase}`;
				phrases.splice(i, 1);
			}
		}
		console.log('phrases:', phrases);
		parserObjects = phrases.map((x: string) => textToScript(x));
	} else 
		parserObjects = [textToScript(text),];
	

	const pngBuffer = await drawCharsFromObjects(parserObjects, font);
	const result = new AttachmentBuilder(pngBuffer, { name: 'image.png', });
	// Convert to script-compatible text and then to png
	// console.log("result:", result)
	return result;
}

async function drawCharsFromObjects(parserObjects: Array<Result<any>>, font) {
	// console.log('parserObject:', parserObject);
	
	const inputWordsAsParserObjects: Array<Array<Result<any>>> = [];

	for(let object of parserObjects) {
		object = await object;
		console.log('object:', object);
		if(object.ok === false) {
			const err = new Error(object.reason);
			err.name = "PARSING_ERROR";
			throw err;
		} else 
			inputWordsAsParserObjects.push(object.value);
		
	}

	let fontCompatibleString = '';

	for(const wordObject of inputWordsAsParserObjects) {
		if(fontCompatibleString.length > 0 && fontCompatibleString.at(-1) !== ' ')
			fontCompatibleString += ' ';
		fontCompatibleString += parserObjectToFontCompatibleString(wordObject);
	}

	// console.log('Rendering text:', fontCompatibleString);
	return textToPng(fontCompatibleString, font);
	// return canvasTtP(fontCompatibleString, font);
}


// text -> font-compatible
export function sanitizeInput(arg: string): string {
	return arg
		.toLowerCase()
		.replace(/’/g, "'")
		.replace(/đ/g, "ḑ")
		.replace(/ẓ/g, "ż");
	// .replace(/đ/g, "ḑ")
}

// font-compatible -> official tnil
export function prettifyInput(arg: string): string {
	return arg
		.replace(/ż/g, 'ẓ')
}



export function canvasTtP(str: string, font: Font = 'basic') {
	registerFont(config.fonts[font].path, { family: 'YourFont' });
	const split = str.split(/(?<cap>·?(?:[bcčçdḑfghjklļmnňprřsštţvxzžż]+|[|])(?:[><^_]+(?:(?:≡|⋮)[aeiouäëïöüáéíóúâêîôû]+|[bcčçdḑfghjklļmnňprřsštţvxzžż])*)*)/)

	const canvas = createCanvas(500, 100);
	const ctx = canvas.getContext('2d');
	ctx.font = config.fonts[font].font;
	ctx.fillStyle = 'white';
	
	let x = 0;
	const spacing = -1; // negative value to bring letters closer
	
	for (const char of split) {
		if(char === '' || !char)
			continue
	  ctx.fillText(char, x, 70);
	  x += ctx.measureText(char).width + spacing;
	}
	console.log({ str, split });
	
	return canvas.toBuffer();
}


export function textToPng(fontCompatibleString: string, font: Font = 'basic') {
	const fixed = fontCompatibleString.replace(/[ḑ]/g, 'ḍ'); // replace d comma generated by the parser with d dot rendered by the font
	const pngBytes = text2png(fixed, {
		font: config.fonts[font].font,
		localFontPath: config.fonts[font].path,
		localFontName: config.fonts[font].name,
		// backgroundColor: '#152342',
		// backgroundColor: 'black',
		// strokeColor: 'black',
		textAlign: 'center',
		// strokeWidth: 1,
		color: 'white',
		// color: 'pink',
		// color: 'blue',
		// borderColor: '#3780C8',
		padding: 10,
	});
	return pngBytes;
}

export default drawCharsFromObjects;
