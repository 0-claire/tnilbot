import text2png from 'text2png';
import { Result } from '@zsnout/ithkuil/script'
import { PRIMARY_CORES, PRIMARY_TOP_LEFT, PRIMARY_BOTTOM_RIGHT, PRIMARY_TOP_RIGHT, PRIMARY_BOTTOM_LEFT, DIACRITICS, TERTIARY_VALENCES, TERTIARY_ASPECTS_PHASES_EFFECTS, LEVELS, CASE_ILLOCUTION_VALIDATION, CASE_SCOPE, MOOD, REGISTER, BIASES, } from './textConversionInformation.js';
import config from './config.js'

type CharType =  -1|1|2|3|4|5|6|7;

function getCharType(chr): CharType {

	if(['stem', 'specification', 'context'].some(p => chr.hasOwnProperty(p)))
		return 1;
	else if(chr.core)
		return 2;
	else if(typeof chr.value === 'string')
		return 4;
	else if(['absoluteLevel', 'valence', 'relativeLevel'].some(p => chr.hasOwnProperty(p)))
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
	if(topLeft)
		core += `^${topLeft}`;
	// console.log('bottomright:', bottomRight);
	if(bottomRight)
		core += `_${bottomRight}`;
	if(topRight)
		core += `>${topRight}`;
	if(bottomLeft)
		core += `<${bottomLeft}`;
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
	if(char.superposed) {
		valence += `^^${specialMarkersToCharacters(char.superposed)}`;
	}
	if(char.underposed) {
		if(char.bottom)
			valence += "_"
		valence += `^${specialMarkersToCharacters(char.underposed)}`;
	}
	if(char.relativeLevel) {
		valence += `_${LEVELS[char.relativeLevel]}`;
	}
	if(char.absoluteLevel) {
		valence += `_${LEVELS[char.absoluteLevel]}`;
	}
	return valence;
}

function fillDefaultsQuaternary(char) {
	// contents: case, illocution, validation, mood
	let bar = "|";
	if(char.value) {
		const ext = CASE_ILLOCUTION_VALIDATION[char.value];
		if(typeof ext === 'string') {
			bar += `${ext}`;
		} else {
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
	if(char.isSlotVIIAffix) {
		if(char.isInverse)
			bar += `_aó`
		else
			bar += `_aò`;
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
	// TODO: we may need a more robus processor that can identify formatives and elide chars from them and apply the information as diacritics to previous chars, unless zsnout allows for such through a parameter
	if((char.value === "OBS" || char.value === 'THM') && char.mood === undefined && char.caseScope === undefined && !char.isSlotVIIAffix)
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
	let ext = BIASES[char.bias]
	if(ext.dot === 'right')
		bias += `${ext.prefix}>${specialMarkersToCharacters(DIACRITICS[ext.ext])}`;
	else if(ext.dot === 'left')
		bias += `${ext.prefix}<${specialMarkersToCharacters(DIACRITICS[ext.ext])}`;
	else {
		let sub = "";
		var newExt = ext;
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
		bias += sub
		bias += specialMarkersToCharacters(newExt);
	}
	return bias;
}


function fillDefaultsNumeral(char): string {
	// process numerals by concatting their values and then converting to int
	const str = char.value.toString();
	var outtext = char.value.toString().at(-1); // 1's place is main char

	if(str.length > 3 && str.at(-4) !== '0') // thousands
		outtext += `<${str.at(-4)}`;
	if(str.length > 2 && str.at(-3) !== '0') // hundreds
		outtext += `^${str.at(-3)}`;
	if(str.length > 1 && str.at(-2) !== '0') // tens
		outtext += `_${str.at(-2)}`;

	return outtext;
}

function parserObjectToFontCompatibleString(rawIn) {
	console.log('rawIn:', rawIn);
	// TODO: throw and catch error, informing user
	let outstr = "";
	rawIn.forEach((chr) => {
		const charType = getCharType(chr);
		console.log(`processing char of type ${charType}:`, chr);
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
		console.log('outstr:', outstr)
	});
	return outstr;
}


function parserObjToFontChars() {
}


async function drawCharsFromRaw(parserObjects: Array<Result<any>>, options: object = {}) {
	// console.log('parserObject:', parserObject);
	
	const inputWordsAsParserObjects: Array<Array<Result<any>>> = [];

	for(let object of parserObjects) {
		object = await object
		console.log('object:', object);
		if(object.ok === false) {
			const err = new Error(object.reason);
			err.name = "PARSING_ERROR";
			throw err
		} else {
			inputWordsAsParserObjects.push(object.value);
		}
	}

	let fontCompatibleString = '';

	for(const wordObject of inputWordsAsParserObjects) {
		if(fontCompatibleString.length > 0 && fontCompatibleString.at(-1) !== ' ')
			fontCompatibleString += ' ';
		fontCompatibleString += parserObjectToFontCompatibleString(wordObject);
	}

	fontCompatibleString = fontCompatibleString.replace(/[ḑ]/g, 'ḍ') // replace d comma generated by the parser with d dot rendered by the font
	console.log('Rendering text:', fontCompatibleString);
	return textToPng(fontCompatibleString);
}

export function textToPng(fontCompatibleString: string) {
	const pngBytes = text2png(fontCompatibleString, {
		font: config.font,
		localFontPath: config.localFontPath,
		localFontName: config.localFontName,
		color: 'white',
		letterSpacing: -200,
	});
	return pngBytes;
}

export default drawCharsFromRaw
