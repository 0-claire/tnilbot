// Generate random chars
import { VOWEL_FORMS, Vx_VOWEL_FORMS, ALT_VOWELS, ILLOCUTION_VOWELS, VALIDATION_VOWELS, } from './textConversionInformation.js';
import { AFFIX_DIACRITICS, AFFIX_TYPE_DIACRITICS, CASE, ILLOCUTION, ILLOCUTION_SHORTCUTS, VALIDATION_SHORTCUTS, CASE_SHORTCUTS, VALIDATION, CASE_ILLOCUTION_VALIDATION, CASE_TO_SEQUENCE, SEQUENCE_TO_CASE, Vv_VOWELS, } from './textConversionInformation.js';
import { Font, } from './util.js';
import { textToPng, render } from './transform.js';
import config from './config.js';
import { QuizOptions } from './quiz.js';


export function generateChar(ext: boolean = false, inversions: boolean = false): string {
	const chars = ext !== true ? 'bcčçdḑfghjklļmnňprřsštţvxzžż' : '=bcčçdḑfghjklļmnňprřsštţvwxyzžż'; // wy only exist as extensions
	const length = chars.length;
	const rand = Math.random();
	const randomIndex = Math.floor(rand * length);
	const randomChar = chars[randomIndex];
	return randomChar;
}


// export function generateVxVowel(slotVI: boolean | null = null): string {
export function generateVxVowel(): [string, number, number] {
	// console.log('vowels:', Vx_VOWEL_FORMS);
	const randomType = Math.floor(Math.random() * 3) + 1;
	const randomDegree = Math.floor(Math.random() * 11);
	let randomVowel = '';
	if(randomDegree === 10) {
		randomVowel = 'üö'; // Ca stacking
	}
	else
		randomVowel = Object.keys(Vx_VOWEL_FORMS).find(e => Vx_VOWEL_FORMS[e][0] === randomType && Vx_VOWEL_FORMS[e][1] === randomDegree);
	return [randomVowel, randomType, randomDegree,];
}


export type GenerateResult = GeneratedQuestion | string;

export interface GeneratedQuestion {
	image: any,
	answer: string | string[],
};

export async function generateSecondary(settings: QuizOptions): Promise<GenerateResult> {
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

//export async function generateAffix(inversions: boolean, font: Font | 'random' = 'basic', extensions: boolean = false): Promise<GeneratedQuestion> {
export async function generateAffix(settings: QuizOptions): Promise<GeneratedQuestion> {
	const { inversions, extensions } = settings;
	let { font, } = settings;

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
		if(generateTopChar === true && extensions) preChar = generateChar(true);
		else preChar = '';
		if(generateBottomChar === true && extensions) postChar = generateChar(true);
		else postChar = '';



		consonantCluster = `${preChar}${secondaryChar}${postChar}`;
	}

	// disallow top-only extensions
	if(postChar === '' && preChar !== '') {
		postChar = preChar;
		preChar = '';
	}

	let slotV: boolean = false;
	if(inversions === true || (config.quizzes.inversionByDefault === true && inversions !== false))
		slotV = Math.random() > 0.5;


	const [vowel, vowelType, vowelDegree,] = generateVxVowel();

	// generate diacritics

	const secondaryCharWithRotation = `${secondaryChar}${slotV ? '' : "'"}`; 
	const fontChars = `${secondaryCharWithRotation}${preChar !== '' ? '^' + preChar : preChar}${vowelType > 1 ? '^' + AFFIX_TYPE_DIACRITICS[vowelType -1] : ''}${postChar !== '' ? '_' : ''}${postChar}_${AFFIX_DIACRITICS[vowelDegree]}`;
	let prettifiedChars = '';
	let prettifiedCharsAlt = '';
	let prettifiedCharsPrettyGeminate = '';
	let prettifiedCharsAltPrettyGeminate = '';
	const preCharPrettyGeminate = preChar === '=' ? secondaryChar : preChar;
	const postCharPrettyGeminate = postChar === '=' ? secondaryChar : postChar;

	if(slotV) {
		prettifiedChars = `${preChar}${secondaryChar}${postChar}${vowel}`;
		prettifiedCharsAlt = `${preChar}${secondaryChar}${postChar}${ALT_VOWELS[vowel]}`;
		prettifiedCharsPrettyGeminate = `${preCharPrettyGeminate}${secondaryChar}${postCharPrettyGeminate}${vowel}`;
		prettifiedCharsAltPrettyGeminate = `${preCharPrettyGeminate}${secondaryChar}${postCharPrettyGeminate}${ALT_VOWELS[vowel]}`;
	} else {
		prettifiedChars = `${vowel}${preChar}${secondaryChar}${postChar}`;
		prettifiedCharsAlt = `${ALT_VOWELS[vowel]}${preChar}${secondaryChar}${postChar}`;
		prettifiedCharsPrettyGeminate = `${vowel}${preCharPrettyGeminate}${secondaryChar}${postCharPrettyGeminate}`;
		prettifiedCharsAltPrettyGeminate = `${ALT_VOWELS[vowel]}${preCharPrettyGeminate}${secondaryChar}${postCharPrettyGeminate}`;
	 }
	
	const answer = [];

	if(vowelType === 3 && !['üo', 'eë', 'üö'].some(x => x === vowel)) {
		[prettifiedChars, prettifiedCharsAlt].forEach(x => answer.push(x))
		if(prettifiedCharsAltPrettyGeminate !== prettifiedCharsAlt) {
			answer.push(prettifiedCharsAltPrettyGeminate)
		}
	} else
		answer.push(prettifiedChars);

	if(prettifiedCharsPrettyGeminate !== prettifiedChars)
		answer.push(prettifiedCharsPrettyGeminate)
	console.log('answer:', answer);

	try {
		return {
			image: await textToPng(fontChars, font),
			// if type 3, and vowel not one of exceptions, give both vowel and alternate form
			answer,
		};
	} catch(e) {
		throw e;
	}
}


export async function generateExtensions(settings: {
	inversions: boolean,
	font: Font|'random',
	wordLength: number
	ignoreMissingApostrophes: boolean,
}): Promise<{ image: any, answer: string[] }> {
	let {inversions, font,} = settings;
	if(font === 'random')
		font = 'basic';

	const secondaryChar = generateChar();
	let preChar = generateChar(true);
	let scriptPreChar = preChar
	let postChar = generateChar(true);
	let scriptPostChar = postChar
	let apostrophe = '';
	if(inversions === true || (config.quizzes.inversionByDefault === true && inversions !== false))
		apostrophe += `${Math.random() > 0.5 ? "'" : ''}`;
	const secondaryCharWithRotation = `${secondaryChar}${apostrophe}`; 
	const randomChars = `${secondaryCharWithRotation}${scriptPreChar !== '' ? '^' + scriptPreChar : ''}${scriptPostChar !== '' ? '_' + scriptPostChar : ''}`;
	const prettifiedChars = `${preChar}${secondaryCharWithRotation}${postChar}`;
	const noApostrophe = `${preChar}${secondaryChar}${postChar}`;
	const answer = [prettifiedChars];

	if(noApostrophe !== prettifiedChars && settings.ignoreMissingApostrophes === true)
		answer.push(noApostrophe);

	return {
		image: await textToPng(randomChars, font),
		answer,
	};
}


export async function generateIllVal(settings: QuizOptions): Promise<{ image: any, answer: string|string[] }> {
	const is_val = Math.random()  >= 0.5;
	let ill = generateIllocution();
	if(!is_val && ill === 'ASR') {
		while(ill === 'ASR') {
			ill = generateIllocution();
			if(ill !== 'ASR')
				break;
		}
	} else if(is_val && ill !== 'ASR')
		ill = 'ASR';
	let value = ill === 'ASR' ? generateValidation() : ill;
	const answer = { ...ILLOCUTION_VOWELS, ...VALIDATION_VOWELS }[value]

	let fontChars = settings.shortcuts === false
		? `|${ ill === 'ASR' ? VALIDATION[value] : ILLOCUTION[value] }`
		: `\\<a${generateChar()}${ ill === 'ASR' ? VALIDATION_SHORTCUTS[value] : ILLOCUTION_SHORTCUTS[value] }`;
		
	
	return {
		image: await textToPng(fontChars),
		answer,
	}
}

export function generateIllocution(): keyof typeof ILLOCUTION {
	const ills = Object.keys(ILLOCUTION) as Array<keyof typeof ILLOCUTION>;
	const random = Math.floor(Math.random() * ills.length);
	const illocution = ills[random];

	return illocution;
}


export function generateValidation(): keyof typeof VALIDATION {
	const vals = Object.keys(VALIDATION) as Array<keyof typeof VALIDATION>;
	const random = Math.floor(Math.random() * vals.length);
	const validation = vals[random];

	return validation;
}

export async function generateCaseChar(settings: QuizOptions): Promise<{ image: any, answer: string|string[] }>
{
	let {
		inversions, font,
	} = settings;
	if(font === 'random')
		font = 'basic';


	const randomSeries = Math.floor(Math.random() * 7) + 1
	let randomRow = Math.floor(Math.random() * (randomSeries > 4 ? 7 : 8)) + 1;
	if(randomSeries > 4 && randomRow === 8)
		randomRow = 9;

	const caseAbbr = Object.keys(CASE).find(x => {
		// console.log({ case: CASE[x], top: CASE[x].top ? true : false, bottom: CASE[x].bottom ? true : false, seqBot: SEQUENCE_TO_CASE[randomRow], randomRow, })
		return (CASE[x].top
			? CASE[x].top === SEQUENCE_TO_CASE[randomSeries]
			: randomSeries === 1)
		&& (CASE[x].bottom
			? CASE[x].bottom === SEQUENCE_TO_CASE[randomRow]
			: randomRow === 1)
	});

	const caseMods = CASE[caseAbbr];

	const caseChar = settings.shortcuts === true
	? `\\${generateChar()}${caseMods.top ? '^^' + CASE_SHORTCUTS[caseMods.series -1] : ''}${caseMods.bottom ? '__' + CASE_SHORTCUTS[caseMods.val -1] : ''}`
	: `|${caseMods.top ? '^' + caseMods.top : ''}${caseMods.bottom ? '_' + caseMods.bottom : ''}`;

	const plainVowelForm = Object.keys(VOWEL_FORMS).find(x => VOWEL_FORMS[x][0] === (randomSeries > 4 ? randomSeries -4 : randomSeries) && VOWEL_FORMS[x][1] === randomRow);
	// add glottal stop where necessary
	// TODO: prettify slightly (-a'- or -a'a)
	// console.log({ randomSeries, randomRow, caseAbbr, caseMods, caseChar, plainVowelForm, });
	const vowelForm =
		randomSeries >= 5
			? randomSeries >= 6
				? (plainVowelForm[0] || 'a') + "'" + (plainVowelForm[1] || 'a')
				: (plainVowelForm || 'a') + "'"  + (plainVowelForm || 'a')
			: plainVowelForm;

	console.log('casechar:', caseChar);
	return {
		image: await textToPng(`${caseChar}`, font),
		answer: vowelForm,
	};
}

export async function generatePrimaryBottomExt(settings: QuizOptions): Promise<{ image: any, answer: string|string[] }> {
	// TODO: stem (4) + version (2) + function (2)
	const version = Math.random() >= 0.5 ? 'PRC' : 'CPT';
	const fn = Math.random() >= 0.5 ? 'DYN' : 'STA';
	const duplex = Math.random() >= 0.5 ? true : false;
	const stem = Math.floor(Math.random() * 4);
	const root = generateChar();
	const Vv = Vv_VOWELS[version][stem]

	const formative = `${Vv}${root}${fn === 'STA' ? 'a' : 'u' }${duplex === true ? 's' : 'l'}`;
	const answer = [formative];
	if(version === 'PRC' && stem === 1) {
		answer.push(formative.replace(/a/, '')) // allow elision of initial a
	}
	if(fn === 'STA' && duplex === false)
		answer.push(`w${Vv}${root}a`)

	return {
		answer,
		image: await render(formative, settings.font === 'random' ? 'basic' : settings.font, false),
	}
}

// next generate diacritics for case/ill/val & also ill/val/mood chars etc

// export function generateCaseChar() {}
