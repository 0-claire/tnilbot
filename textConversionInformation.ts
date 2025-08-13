export const PRIMARY_CORES = {
	BSC: "\\",
	CTE: ":",
	CSV: "(",
	OBJ: ")"
};
export const PRIMARY_TOP_LEFT = {
    M: {
        DEL: undefined,
        PRX: "s",
        ICP: "t",
        ATV: "d",
        GRA: "m",
        DPL: "n",
    },
    G: {
        DEL: "p",
        PRX: "g",
        ICP: "ž",
        ATV: "ḑ",
        GRA: "v",
        DPL: "x",
    },
    N: {
        DEL: "š",
        PRX: "≈",
        ICP: "w",
        ATV: "h",
        GRA: "f",
        DPL: "ř",
    },
    A: {
        DEL: "b",
        PRX: "k",
        ICP: "c",
        ATV: "č",
        GRA: "ż",
        DPL: "j",
    },
};
/**
 * An object mapping from function, version, M/D, and stem into secondary
 * extensions.
 */
export const PRIMARY_BOTTOM_RIGHT = {
    STA: {
        PRC: {
            M: ["b", undefined, "p", "š"],
            D: ["c", "z", "P", "w"],
        },
        CPT: {
            M: ["k", "l", "g", "≈"],
            D: ["č", "ɹ", "G", "h"],
        },
    },
    DYN: {
        PRC: {
            M: ["d", "m", "=", "t"],
            D: ["D", "n", "ň", "ž"],
        },
        CPT: {
            M: ["ţ", "s", "x", "f"],
            D: ["ḑ", "r", "ř", "v"],
        },
    },
};

export const Vv_VOWELS: { PRC: string[], CPT: string[] } = {
	PRC: ['o', 'a', 'e', 'u'],
	CPT: ['ö', 'ä', 'i', 'ü'],
}

export const PRIMARY_TOP_RIGHT = {
    NRM: {
        CSL: undefined,
        ASO: "i",
        VAR: "ï",
        COA: "ä",
    },
    RPV: {
        CSL: "e",
        ASO: "ü",
        VAR: "o",
        COA: "ö",
    },
};

export const PRIMARY_BOTTOM_LEFT = {
    PX: undefined,
    SS: "i",
    SC: "ï",
    SF: "ä",
    DS: "ë",
    DC: "u",
    DF: "ö",
    FS: "o",
    FC: "äi",
    FF: "ő",
}

export const DIACRITICS = {
    "UNF/K": "DOT",
    FRM: "HORIZ_BAR",
    1: "VERT_BAR",
    2: "HORIZ_WITH_BOTTOM_LINE",
};

export const TERTIARY_VALENCES = {
    MNO: "≡aa",
    PRL: "≡az",
    CRO: "≡za",
    RCP: "≡zz",
    CPL: "≡sa",
    DUP: "≡as",
    DEM: "≡af",
    CNG: "≡av",
    PTI: "≡sf"
};

export const TERTIARY_ASPECTS_PHASES_EFFECTS = {
    "1:BEN": "⋮aia",
    "2:BEN": "⋮sia",
    "3:BEN": "⋮ais",
    "SLF:BEN": "⋮sis",
    "UNKNOWN": "⋮zia",
    "SLF:DET": "⋮aiz",
    "3:DET": "⋮sim",
    "2:DET": "⋮mia",
    "1:DET": "⋮aim",

    "PCT": "⋮aïa",
    "ITR": "⋮sïa",
    "REP": "⋮aïs",
    "ITM": "⋮sïs",
    "RCT": "⋮aïz",
    "FRE": "⋮pïs",
    "FRG": "⋮sïp",
    "VAC": "⋮pïa",
    "FLC": "⋮aïp",

    "RTR": "⋮aäi",
    "PRS": "⋮aäţ",
    "HAB": "⋮aäḍ",
    "PRG": "⋮säi",
    "IMM": "⋮säţ",
    "PCS": "⋮säḍ",
    "REG": "⋮fäa",
    "SMM": "⋮fäi",
    "ATP": "⋮fäz",
    "RSM": "⋮iäa",
    "CSS": "⋮ţäa",
    "PAU": "⋮ḍäa",
    "RGR": "⋮iäs",
    "PCL": "⋮ţäs",
    "CNT": "⋮ḍäs",
    "ICS": "⋮aäf",
    "EXP": "⋮iäf",
    "IRP": "⋮zäf",
    "PMP": "⋮aäk",
    "CLM": "⋮aäg",
    "DLT": "⋮aä≈",
    "TMP": "⋮aäš",
    "XPD": "⋮aäp",
    "LIM": "⋮aät",
    "EPD": "⋮aäř",
    "PTC": "⋮aäx",
    "PPR": "⋮aä=",
    "DCL": "⋮käa",
    "CCL": "⋮gäa",
    "CUL": "⋮≈äa",
    "IMD": "⋮šäa",
    "TRD": "⋮päa",
    "TNS": "⋮täa",
    "ITC": "⋮řäa",
    "MTV": "⋮xäa",
    "SQN": "⋮=äa",
};

export const LEVELS = {
	// Levels
	"MIN": "a",
	"SBE": "ë",
	"IFR": "ü",
	"DFC": "o",
	"EQU": "ï",
	"SUR": "ö",
	"SPL": "u",
	"SPQ": "e",
	"MAX": "ä",
};

export const ILLOCUTION_VOWELS = {
	// TODO: test ASR
	ASR: null,
	DIR: 'ái',
	DEC: 'áu',
	IRG: 'éi',
	VRF: 'éu',
	ADM: 'óu',
	POT: 'ói',
	HOR: 'íu',
	CNJ: 'úi',
}

export const ILLOCUTION = {
	// TODO: test ASR
	ASR: '^s_s',
	DIR: '^ḑ',
	DEC: '^f',
	IRG: '^ř',
	VRF: '^v',
	ADM: '^ţ',
	POT: '^x',
	HOR: '^n',
	CNJ: '^z',
}

export const VALIDATION_VOWELS = {
	OBS: 'á',
	REC: 'â',
	PUP: 'é',
	RPR: 'í',
	IMA: 'ô',
	CVN: 'ó',
	ITU: 'û',
	INF: 'ú',
	USP: 'êi',
}

// for quaternaries
export const VALIDATION = {
	OBS: '^s_s',
	REC: '^s_ḑ',
	PUP: '^s_f',
	RPR: '^s_ř',
	IMA: '^s_v',
	CVN: '^s_ţ',
	ITU: '^s_x',
	INF: '^s_n',
	USP: '^s_z',
}

export const ILLOCUTION_SHORTCUTS = {
	ASR: '',
	DIR: '^a',
	DEC: '^ä',
	IRG: '^ò',
	VRF: '^ó',
	ADM: '^e',
	POT: '^ë',
	HOR: '^o',
	CNJ: '^ö',
}

export const VALIDATION_SHORTCUTS = {
	OBS: '',
	REC: '_a',
	PUP: '_ä',
	RPR: '_ò',
	IMA: '_ó',
	CVN: '_e',
	ITU: '_ë',
	INF: '_o',
	USP: '_ö',
}

export const CASE_TO_SEQUENCE = {
	null: 1,
	d: 2,
	š: 3,
	g: 4,
	p: 5,
	t: 6,
	k: 7,
	b: 8,
	m: 9,
}

export const SEQUENCE_TO_CASE = {
	1: null,
	2: 'd',
	3: 'š',
	4: 'g',
	5: 'p',
	6: 't',
	7: 'k',
	8: 'b',
	9: 'm',
}

export const CASE_SHORTCUTS = [
	'',
	'a',
	'ä',
	'ò',
	'ó',
	'e',
	'ë',
	'o',
	'ö',
];

export const CASE = {
	// 1 Transrelative
	THM: { series: 1, val: 1, top: undefined, bottom: undefined }, 
	INS: { series: 1, val: 2, top: undefined, bottom: 'd' }, 
	ABS: { series: 1, val: 3, top: undefined, bottom: 'š' }, 
	AFF: { series: 1, val: 4, top: undefined, bottom: 'g' }, 
	STM: { series: 1, val: 5, top: undefined, bottom: 'p' }, 
	EFF: { series: 1, val: 6, top: undefined, bottom: 't' }, 
	ERG: { series: 1, val: 7, top: undefined, bottom: 'k' }, 
	DAT: { series: 1, val: 8, top: undefined, bottom: 'b' }, 
	IND: { series: 1, val: 9, top: undefined, bottom: 'm' }, 

	// 2 Appositive
	POS: { series: 2, val: 1, top: 'd', bottom: undefined }, 
	PRP: { series: 2, val: 2, top: 'd', bottom: 'd' }, 
	GEN: { series: 2, val: 3, top: 'd', bottom: 'š' }, 
	ATT: { series: 2, val: 4, top: 'd', bottom: 'g' }, 
	PDC: { series: 2, val: 5, top: 'd', bottom: 'p' }, 
	ITP: { series: 2, val: 6, top: 'd', bottom: 't' }, 
	OGN: { series: 2, val: 7, top: 'd', bottom: 'k' }, 
	IDP: { series: 2, val: 8, top: 'd', bottom: 'b' }, 
	PAR: { series: 2, val: 9, top: 'd', bottom: 'm' }, 

	// 3 Associative
	APL: { series: 3, val: 1, top: 'š', bottom: undefined }, 
	PUR: { series: 3, val: 2, top: 'š', bottom: 'd' }, 
	TRA: { series: 3, val: 3, top: 'š', bottom: 'š' }, 
	DFR: { series: 3, val: 4, top: 'š', bottom: 'g' }, 
	CRS: { series: 3, val: 5, top: 'š', bottom: 'p' }, 
	TSP: { series: 3, val: 6, top: 'š', bottom: 't' }, 
	CMM: { series: 3, val: 7, top: 'š', bottom: 'k' }, 
	CMP: { series: 3, val: 8, top: 'š', bottom: 'b' }, 
	CSD: { series: 3, val: 9, top: 'š', bottom: 'm' }, 

	// 4 Adverbial
	FUN: { series: 4, val: 1, top: 'g', bottom: undefined }, 
	TFM: { series: 4, val: 2, top: 'g', bottom: 'd' }, 
	CLA: { series: 4, val: 3, top: 'g', bottom: 'š' }, 
	RSL: { series: 4, val: 4, top: 'g', bottom: 'g' }, 
	CSM: { series: 4, val: 5, top: 'g', bottom: 'p' }, 
	CON: { series: 4, val: 6, top: 'g', bottom: 't' }, 
	AVR: { series: 4, val: 7, top: 'g', bottom: 'k' }, 
	CVS: { series: 4, val: 8, top: 'g', bottom: 'b' }, 
	SIT: { series: 4, val: 9, top: 'g', bottom: 'm' }, 

	// 5 Relational
	PRN: { series: 5, val: 1, top: 'p', bottom: undefined }, 
	DSP: { series: 5, val: 2, top: 'p', bottom: 'd' }, 
	COR: { series: 5, val: 3, top: 'p', bottom: 'š' }, 
	CPS: { series: 5, val: 4, top: 'p', bottom: 'g' }, 
	COM: { series: 5, val: 5, top: 'p', bottom: 'p' }, 
	UTL: { series: 5, val: 6, top: 'p', bottom: 't' }, 
	PRD: { series: 5, val: 7, top: 'p', bottom: 'k' }, 
	RLT: { series: 5, val: 8, top: 'p', bottom: 'm' }, 
                      val: 9,
	// 6 Affinitive
	ACT: { series: 6, val: 1, top: 't', bottom: undefined }, 
	ASI: { series: 6, val: 2, top: 't', bottom: 'd' }, 
	ESS: { series: 6, val: 3, top: 't', bottom: 'š' }, 
	TRM: { series: 6, val: 4, top: 't', bottom: 'g' }, 
	SEL: { series: 6, val: 5, top: 't', bottom: 'p' }, 
	CFM: { series: 6, val: 6, top: 't', bottom: 't' }, 
	DEP: { series: 6, val: 7, top: 't', bottom: 'k' }, 
	VOC: { series: 6, val: 9, top: 't', bottom: 'm' }, 
	// 7 ST-1
	LOC: { series: 7, val: 1, top: 'k', bottom: undefined }, 
	ATD: { series: 7, val: 2, top: 'k', bottom: 'd' }, 
	ALL: { series: 7, val: 3, top: 'k', bottom: 'š' }, 
	ABL: { series: 7, val: 4, top: 'k', bottom: 'g' }, 
	ORI: { series: 7, val: 5, top: 'k', bottom: 'p' }, 
	IRL: { series: 7, val: 6, top: 'k', bottom: 't' }, 
	INV: { series: 7, val: 7, top: 'k', bottom: 'k' }, 
	NAV: { series: 7, val: 9, top: 'k', bottom: 'm' }, 
	// 8 ST-2
	CNR: { series: 8, val: 1, top: 'b', bottom: undefined }, 
	ASS: { series: 8, val: 2, top: 'b', bottom: 'd' }, 
	PER: { series: 8, val: 3, top: 'b', bottom: 'š' }, 
	PRO: { series: 8, val: 4, top: 'b', bottom: 'g' }, 
	PCV: { series: 8, val: 5, top: 'b', bottom: 'p' }, 
	PCR: { series: 8, val: 6, top: 'b', bottom: 't' }, 
	ELP: { series: 8, val: 7, top: 'b', bottom: 'k' }, 
	PLM: { series: 8, val: 9, top: 'b', bottom: 'm' }, 

}

export const CASE_ILLOCUTION_VALIDATION = {
	...CASE,
	...ILLOCUTION,
	...VALIDATION,
};

// export const VALIDATIONS = [
	// OBS: '^s_s',
	// REC: '^s_ḑ',
	// PUP: '^s_f',
	// RPR: '^s_ř',
	// IMA: '^s_v',
	// CVN: '^s_ţ',
	// ITU: '^s_x',
	// INF: '^s_n',
	// USP: '^s_z',
// ];

export const MOOD = {
	FAC: undefined,
	SUB: 'a',
	ASM: 'ï',
	SPC: 'o',
	COU: 'ö',
	HYP: 'ä',
};

export const CASE_SCOPE = {
	CCN: undefined,
	CCA: 'a',
	CCS: 'ï',
	CCQ: 'o',
	CCP: 'ö',
	CCV: 'ä',
};

export const REGISTER = {
	NRR: {
		standard: '·00',
		alphabetic: '·10',
		transcriptive: '·20',
		transliterative: '·30',
	},
	DSV: {
		standard: '·01',
		alphabetic: '·11',
		transcriptive: '·21',
		transliterative: '·31',
	},
	PNT: {
		standard: '·02',
		alphabetic: '·12',
		transcriptive: '·22',
		transliterative: '·32',
	},
	SPF: {
		standard: '·03',
		alphabetic: '·13',
		transcriptive: '·23',
		transliterative: '·33',
	},
	EXM: {
		standard: '·04',
		alphabetic: '·14',
		transcriptive: '·24',
		transliterative: '·34',
	},
	CGT: {
		standard: '·05',
		alphabetic: '·15',
		transcriptive: '·25',
		transliterative: '·35',
	},
};


export const BIASES = {
  "ACC": "'",
  "ACH": "'_l",
  "ADS": "'_z",
  "ANN": "'_s",
  "ANP": "'_k",
  "APB": "'_g",
  "APH": "'_EXTENSION_GEMINATE",
  "ARB": "'_CORE_GEMINATE",
  "ATE": "'_d",
  "CMD": "'_t",
  "CNV": "'_š",
  "COI": "'_p",
  "CRP": "'_x",
  "CRR": "'_ř",
  "CTP": "'_ţ",
  "CTV": "'_f",

  // top
  "DCC": { prefix: "'", dot: 'left', ext: 'a' },
  "DEJ": "'^l",
  "DES": "'^z",
  "DFD": "'^s",
  "DIS": "'^k",
  "DLC": "'^g",
  "DOL": "'^EXTENSION_GEMINATE",
  "DPB": "'^CORE_GEMINATE",
  "DRS": "'^d",
  "DUB": "'^t",
  "EUH": "'^š",
  "EUP": "'^p",
  "EXA": "'^x",
  "EXG": "'^ř",
  "MNF": "'^ţ",
  "FOR": "'^f",

  // rotated chars (no ' cuz script uses rotated by default)
  "FSC": "",
  "GRT": "_l",
  "IDG": "_z",
  "IFT": "_s",
  "IPL": "_k",
  "IPT": "_g",
  "IRO": "_EXTENSION_GEMINATE",
  "ISP": "_CORE_GEMINATE",
  "IVD": "_d",
  "MAN": "_t",
  "OPT": "_š",
  "PES": "_p",
  "PPT": "_x",
  "PPX": "_ř",
  "PPV": "_ţ",
  "PSC": "_f",

  // top
  "PSM": { prefix: '', dot: 'right', ext: 'a' },
  "RAC": "^l",
  "RFL": "^z",
  "RSG": "^s",
  "RPU": "^k",
  "RVL": "^g",
  "SAT": "^EXTENSION_GEMINATE",
  "SGS": "^CORE_GEMINATE",
  "SKP": "^d",
  "SOL": "^t",
  "STU": "^š",
  "TRP": "^p",
  "VEX": "^x",
  // ř
  // ţ
  // f
};         

export const Vx_VOWEL_FORMS: { [key: string]: [1|2|3, 1|2|3|4|5|6|7|8|9|0] } = {
	ae: [1, 0],
	a: [1, 1],
	ä: [1, 2],
	e: [1, 3],
	i: [1, 4],
	ëi: [1, 5],
	ö: [1, 6],
	o: [1, 7],
	ü: [1, 8],
	u: [1, 9],
	
	ea: [2, 0],
	ai: [2, 1],
	au: [2, 2],
	ei: [2, 3],
	eu: [2, 4],
	ëu: [2, 5],
	ou: [2, 6],
	oi: [2, 7],
	iu: [2, 8],
	ui: [2, 9],
	
	üo: [3, 0],
	ia: [3, 1],
	uä: [3, 1],
	ie: [3, 2],
	uë: [3, 2],
	io: [3, 3],
	üä: [3, 3],
	iö: [3, 4],
	üë: [3, 4],
	eë: [3, 5],
	uö: [3, 6],
	öë: [3, 6],
	uo: [3, 7],
	öä: [3, 7],
	ue: [3, 8],
	ië: [3, 8],
	ua: [3, 9],
	iä: [3, 9],
}

export const VOWEL_FORMS: { [key: string]: [1|2|3|4, 1|2|3|4|5|6|7|8|9|0] } = {
	...Vx_VOWEL_FORMS,

	üö: [4, 0],
	ao: [4, 1],
	aö: [4, 2],
	eo: [4, 3],
	eö: [4, 4],
	oë: [4, 5],
	öe: [4, 6],
	oe: [4, 7],
	öa: [4, 8],
	oa: [4, 9],
};

export const ALT_VOWELS = {
	üo:'üo',
	eë: 'eë',

	uä:'ia',
	üë:'iö',
	üä:'io',
	uö:'öë',
	uo:'öä',
	ue:'ië',
	ua:'iä',

	ia: 'uä',
	ie: 'uë',
	io: 'üä',
	iö: 'üë',
	öë: 'uö',
	öä: 'uo',
	ië: 'ue',
	iä: 'ua',
}

export const AFFIX_DIACRITICS = [
	'ó', // 0
	'a', //
	'e', //
	'u', //
	'o', //
	// 'i', // 5
	'ï', // 5
	'ö', // 6
	'ü', // 7
	'ë', // 8
	'ä', // 9
	'ò', // Ca
];

export const AFFIX_TYPE_DIACRITICS = [
	'',
	'a',
	'ä',
];

export const PRIMARY_CONTEXTS = {
	EXS: null,
	FNC: 'a',
	RPS: 'ä',
	AMG: 'i',
};
