// Generate random chars
import { VOWEL_FORMS, ALT_VOWELS, } from './textConversionInformation.js';
import { AFFIX_DIACRITICS, AFFIX_TYPE_DIACRITICS, } from './textConversionInformation.js';
import { Font, } from './util.js';
import { textToPng, } from './transform.js';
import config from './config.js';

export function generateChar(ext: boolean = false): string {
	const chars = ext !== true ? 'bcčçdḑfghjklļmnňprřsštţvxzžż' : 'bcčçdḑfghjklļmnňprřsštţvwxyzžż'; // wy only exist as extensions
	const length = chars.length;
	const rand = Math.random();
	const randomIndex = Math.floor(rand * length);
	const randomChar = chars[randomIndex];
	return randomChar;
}


// export function generateVowel(slotVI: boolean | null = null): string {
export function generateVowel(): [string, number, number] {
	// console.log('vowels:', VOWEL_FORMS);
	const randomType = Math.floor(Math.random() * 2) + 1;
	const randomDegree = Math.floor(Math.random() * 10);
	let randomVowel = '';
	if(randomDegree === 10)
		randomVowel = 'üö'; // Ca stacking
	else
		randomVowel = Object.keys(VOWEL_FORMS).find(e => VOWEL_FORMS[e][0] === randomType && VOWEL_FORMS[e][1] === randomDegree);
	return [randomVowel, randomType, randomDegree,];
}


export type GenerateResult = GeneratedQuestion | string;

export interface GeneratedQuestion {
	image: any,
	answer: string | string[],
};

export async function generateSecondary(settings: { inversions: boolean, font: Font|'random', wordLength: number}): Promise<GenerateResult> {
	let {
		inversions, font, wordLength, 
	} = settings;

	// TODO support random font
	if(font === 'random')
		font = 'basic';

	const randomChars = [...Array(wordLength).keys(),].map(x => { 
		const char = generateChar();
		// if inversions is set to true, use a random number check to determine whether the char is inverted
		if(inversions === true || (config.quizzes.inversionByDefault === true && inversions !== false))
			return Math.random() > 0.5 ? `${char}'` : char;
		else
			return char;
	}).join('');

	try {
		return {
			image: await textToPng(randomChars, font),
			answer: randomChars,
		};
	} catch(e) {
		if(e.name === 'PARSING_ERROR')
			return `Parsing error: ${e.message}`;
		else {
			console.log(e);
			return "Internal error";
		}
	}

}

export async function generateAffix(inversions: boolean, font: Font | 'random' = 'basic', extensions: boolean = false): Promise<GeneratedQuestion> {
	if(font === 'random')
		font = 'basic';
	const generateTopChar = extensions && Math.random() > 0.5 ? true : false;
	let preChar = '';

	const generateBottomChar = extensions && Math.random() > 0.5 ? true : false;
	let postChar = '';

	const secondaryChar = generateChar();
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

		const secondaryChar = generateChar();

		consonantCluster = `${preChar}${secondaryChar}${postChar}`;
	}

	let slotV: boolean = false;
	if(inversions === true || (config.quizzes.inversionByDefault === true && inversions !== false))
		slotV = Math.random() > 0.5;


	const [vowel, vowelType, vowelDegree,] = generateVowel();

	// generate diacritics

	const secondaryCharWithRotation = `${secondaryChar}${slotV ? '' : "'"}`; 
	const fontChars = `${secondaryCharWithRotation}^${preChar}^${AFFIX_TYPE_DIACRITICS[vowelType -1]}_${postChar}_${AFFIX_DIACRITICS[vowelDegree]}`;
	let prettifiedChars = '';
	let prettifiedCharsAlt = '';

	if(slotV) {
		prettifiedChars = `${preChar}${secondaryChar}${postChar}${vowel}`;
		prettifiedCharsAlt = `${preChar}${secondaryChar}${postChar}${ALT_VOWELS[vowel]}`;
	}
	// word = `ta${preChar}${secondaryChar}${postChar}${vowel}talla`
	 else {
		prettifiedChars = `${vowel}${preChar}${secondaryChar}${postChar}`;
		prettifiedCharsAlt = `${ALT_VOWELS[vowel]}${preChar}${secondaryChar}${postChar}`;
	 }
	// word = `tal${plainChars}at`
	
	// return {
	// fontChars,
	// prettifiedChars
	// }
	try {
		return {
			image: await textToPng(fontChars, font),
			answer: vowelType === 3 ? [prettifiedChars, prettifiedCharsAlt,] : prettifiedChars
		};
	} catch(e) {
		throw e;
	}
}


export async function generateExtensions(settings: {
	inversions: boolean,
	font: Font|'random',
	wordLength: number
}): Promise<{ image: any, answer: string }> {
	let {inversions, font,} = settings;
	if(font === 'random')
		font = 'basic';

	const secondaryChar = generateChar();
	let preChar = generateChar(true);
	if(preChar === secondaryChar) preChar = '=';
	let postChar = generateChar(true);
	if(postChar === secondaryChar) postChar = '=';
	let apostrophe = '';
	if(inversions === true || (config.quizzes.inversionByDefault === true && inversions !== false))
		apostrophe += `${Math.random() > 0.5 ? "'" : ''}`;
	const secondaryCharWithRotation = `${secondaryChar}${apostrophe}`; 
	const randomChars = `${secondaryCharWithRotation}^${preChar}_${postChar}`;
	const prettifiedChars = `${preChar}${secondaryCharWithRotation}${postChar}`;

	return {
		image: await textToPng(randomChars, font),
		answer: prettifiedChars,
	};
}

/*
export async function generateCases(settings: {
	inversions: boolean,
	font: Font|'random',
	wordLength: number
}): Promise<{ image: any, answer: string }>
{
	let {
		inversions, font,
	} = settings;
	if(font === 'random')
		font = 'basic';

	const mainChar = generateChar();
	let preChar = generateChar(true);
	if(preChar === secondaryChar) preChar = '=';
	let postChar = generateChar(true);
	if(postChar === secondaryChar) postChar = '=';
	let apostrophe = '';
	if(inversions === true || (config.quizzes.inversionByDefault === true && inversions !== false))
		apostrophe += `${Math.random() > 0.5 ? "'" : ''}`;
	const secondaryCharWithRotation = `${secondaryChar}${apostrophe}`; 
	const randomChars = `${secondaryCharWithRotation}^${preChar}_${postChar}`;
	const prettifiedChars = `${preChar}${secondaryCharWithRotation}${postChar}`;

	return {
		image: await textToPng(randomChars, font),
		answer: prettifiedChars,
	};
}
*/

// next generate diacritics for case/ill/val & also ill/val/mood chars etc
