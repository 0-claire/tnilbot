import text2png from 'text2png';
import { PRIMARY_CORES, PRIMARY_TOP_LEFT, PRIMARY_BOTTOM_RIGHT, PRIMARY_TOP_RIGHT, PRIMARY_BOTTOM_LEFT, DIACRITICS, TERTIARY_VALENCES, TERTIARY_ASPECTS_PHASES_EFFECTS, LEVELS, CASE_ILLOCUTION_VALIDATION, CASE_SCOPE, MOOD, REGISTER, BIASES } from './textConversionInformation.js';
import config from './config.js'

function getCharType(chr) {
	if(chr.stem || chr.specification)
		return 1;
	if(chr.core)
		return 2;
	if(chr.value)
		return 4;
	if(chr.absoluteLevel || chr.top || chr.valence || chr.bottom || chr.relativeLevel)
		return 3;
	if(chr.bias) // bias
		return 5;
	if(chr.mode) // register (type) x mode (mode)
		return 6;
	// otherwise this is a break character here
	return -1;
}

function fillDefaultsPrimary(char) {
	var core = PRIMARY_CORES[char.specification || "BSC"];
	const topLeft = PRIMARY_TOP_LEFT[char.perspective || "M"][char.extension || "DEL"];
	const bottomRight = PRIMARY_BOTTOM_RIGHT[char.function || "STA"][char.version || "PRC"][char.configuration?.startsWith("D") ? "D" : "M"][char.stem ?? 1];
	const topRight = PRIMARY_TOP_RIGHT[char.essence || "NRM"][char.affiliation || "CSL"];
	const plexity = char.configuration || "PX";
	const bottomLeft = PRIMARY_BOTTOM_LEFT[plexity.substring(plexity.length-2)];
	if(topLeft)
		core += `^${topLeft}`;
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
	var core = specialMarkersToCharacters(char.core || "STANDARD_PLACEHOLDER");
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
		core += `>${specialMarkersToCharacters(char.right)}`;
	if(char.left)
		core += `<${specialMarkersToCharacters(char.left)}`;
	return core;
}

function fillDefaultsTertiary(char) {
	// contents: valence, aspect, level, phase, effect
	var valence = "";
	if(char.top)
		valence += `${TERTIARY_ASPECTS_PHASES_EFFECTS[char.top]}`;
	valence += TERTIARY_VALENCES[char.valence || "MNO"];
	if(char.bottom)
		valence += `_${TERTIARY_ASPECTS_PHASES_EFFECTS[char.bottom]}`;
	if(char.superposed) {
		valence += `^${specialMarkersToCharacters(char.superposed)}`;
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
	console.log('quat char:', char);
	// contents: case, illocution, validation, mood
	var bar = "|";
	if(char.value) {
		const ext = CASE_ILLOCUTION_VALIDATION[char.value];
		console.log(char.value);
		if(typeof ext === 'string') {
			bar += `${ext}`;
		} else {
			if(ext.top)
				bar += `^${ext.top}`;
			if(ext.bottom)
				bar += `_${ext.bottom}`;
		}
	}
	if(char.mood)
		bar += `^${MOOD[char.mood] || ''}`;
	if(char.caseScope)
		bar += `_${CASE_SCOPE[char.caseScope] || ''}`;
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
	return bar;
}

function fillDefaultsRegisterMode(char) {
	return REGISTER[char.type || 'NRR'][char.mode];
}

function fillBiasChar(char) {
	var bias = "Ʃ";
	var ext = BIASES[char.bias]
	if(ext.dot === 'right')
		bias += `${ext.prefix}>${specialMarkersToCharacters(DIACRITICS[ext.ext])}`;
	else if(ext.dot === 'left')
		bias += `${ext.prefix}<${specialMarkersToCharacters(DIACRITICS[ext.ext])}`;
	else
		bias += specialMarkersToCharacters(ext);
	console.log('bias:', bias);
	return bias;
}

function rawInputToIthkuilFormattedString(rawIn) {
	console.log(rawIn);
	if(!rawIn.ok)
		return "";
	var outstr = "";
	rawIn.value.forEach((chr) => {
		// console.log(typeof(chr.construct));
		console.log('char:', chr);
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
			case 5:
				outstr += fillBiasChar(chr);
			case 6:
				outstr += fillDefaultsRegisterMode(chr);
				break;
		}
	});
	return outstr;
}
function drawCharsFromRaw(rawInput) {
	var rawInputAsString = rawInputToIthkuilFormattedString(rawInput);
	var pngBytes = text2png(rawInputAsString, {
		font: config.font,
		localFontPath: config.localFontPath,
		localFontName: config.localFontName,
		color: 'white'
	});
	return pngBytes;
}

export default drawCharsFromRaw
