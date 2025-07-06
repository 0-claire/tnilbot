// Generate random chars
import { VOWEL_FORMS, } from './textConversionInformation.js';
import { AFFIX_DIACRITICS, AFFIX_TYPE_DIACRITICS } from './textConversionInformation.js'
import { Font } from './util.js';
import { textToPng } from './transform.js';
import config from './config.js'

export function generateChar(ext: boolean = false): string {
	const chars = ext !== true ? 'bcčçdḑfghjklļmnňprřsštţvxzžż' : 'bcčçdḑfghjklļmnňprřsštţvwxyzžż'; // wy only exist as extensions
	const length = chars.length;
	const rand = Math.random();
	const randomIndex = Math.floor(rand * length);
	const randomChar = chars[randomIndex];
	return randomChar;
}


const vowels = Object.keys(VOWEL_FORMS);

// export function generateVowel(slotVI: boolean | null = null): string {
export function generateVowel(): [string, number, number] {
	console.log('vowels:', VOWEL_FORMS);
	const length = vowels.length;
	const rand = Math.random();
	const randomIndex = Math.floor(rand * length);
	const randomVowel = vowels[randomIndex];
	const vowelType = VOWEL_FORMS[randomVowel][0];
	const vowelDegree = VOWEL_FORMS[randomVowel][1];
	return [randomVowel, vowelType, vowelDegree];
}


export type GenerateResult = GeneratedQuestion | string;

export interface GeneratedQuestion {
	image: any,
	answer: string,
};

export async function generateSecondary(settings: { inverted: boolean, font: Font|'random', wordLength: number}): Promise<GenerateResult> {
	let { inverted, font, wordLength } = settings

	// TODO support random font
	if(font === 'random')
		font = 'basic'

	const randomChars = [...Array(wordLength).keys()].map(x => { 
		const char = generateChar();
		// if inverted is set to true, use a random number check to determine whether the char is inverted
		if(inverted === true || (config.quizzes.inversionByDefault === true && inverted !== false))
			return Math.random() > 0.5 ? `${char}'` : char;
		else
			return char;
	}).join('');

	try {
		return {
			image: await textToPng(randomChars, font),
			answer: randomChars,
		}
	} catch(e) {
		if(e.name === 'PARSING_ERROR')
			return `Parsing error: ${e.message}`;
		else {
			console.log(e);
			return "Internal error";
		}
	}

}

export async function generateAffix(inverted: boolean, font: Font | 'random' = 'basic', extensions: boolean = false): Promise<{ image: any, answer: string }> {
	if(font === 'random')
		font = 'basic';
	const generateTopChar = extensions && Math.random() > 0.5 ? true : false;
	let preChar = '';

	const generateBottomChar = extensions && Math.random() > 0.5 ? true : false;
	let postChar = '';

	let secondaryChar = generateChar();
	let consonantCluster = `${preChar}${secondaryChar}${postChar}`;

	// disallow impermissible affixes
	while([  "w",
	"y",
	"ç",
	"ļ",
	"ļw",
	"ļy",].some(x => x === consonantCluster)) {
		if(generateTopChar === true) preChar = generateChar(true);
		else preChar = '';
		if(generateBottomChar === true) postChar = generateChar(true);
		else postChar = '';

		let secondaryChar = generateChar();

		consonantCluster = `${preChar}${secondaryChar}${postChar}`;
	}

	let slotV: boolean = false;
	if(inverted === true || (config.quizzes.inversionByDefault === true && inverted !== false))
		slotV = Math.random() > 0.5;


	const [vowel, vowelType, vowelDegree] = generateVowel();

	// generate diacritics

	let plainChars = `${vowel}${consonantCluster}`;

	const secondaryCharWithRotation = `${secondaryChar}${slotV ? '' : "'"}`; 
	let fontChars = `${secondaryCharWithRotation}^${preChar}^${AFFIX_TYPE_DIACRITICS[vowelType -1]}_${postChar}_${AFFIX_DIACRITICS[vowelDegree]}`;
	let prettifiedChars = '';

	if(slotV) {
		prettifiedChars = `${preChar}${secondaryChar}${postChar}${vowel}`;
		// word = `ta${preChar}${secondaryChar}${postChar}${vowel}talla`
	} else {
		prettifiedChars = `${vowel}${preChar}${secondaryChar}${postChar}`;
		// word = `tal${plainChars}at`
	}
	// return {
		// fontChars,
		// prettifiedChars
	// }
	try {
		return {
			image: await textToPng(fontChars, font),
			answer: prettifiedChars
		}
	} catch(e) {
		throw e;
	}
}
