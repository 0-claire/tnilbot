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

export const CASE_ILLOCUTION_VALIDATION = {
	// 1 Transrelative
	THM: { top: undefined, bottom: undefined }, 
	INS: { top: undefined, bottom: 'd' }, 
	ABS: { top: undefined, bottom: 'š' }, 
	AFF: { top: undefined, bottom: 'g' }, 
	STM: { top: undefined, bottom: 'p' }, 
	EFF: { top: undefined, bottom: 't' }, 
	ERG: { top: undefined, bottom: 'k' }, 
	DAT: { top: undefined, bottom: 'b' }, 
	IND: { top: undefined, bottom: 'm' }, 

	// 2 Appositive
	POS: { top: 'd', bottom: undefined }, 
	PRP: { top: 'd', bottom: 'd' }, 
	GEN: { top: 'd', bottom: 'š' }, 
	ATT: { top: 'd', bottom: 'g' }, 
	PDC: { top: 'd', bottom: 'p' }, 
	ITP: { top: 'd', bottom: 't' }, 
	OGN: { top: 'd', bottom: 'k' }, 
	IDP: { top: 'd', bottom: 'b' }, 
	PAR: { top: 'd', bottom: 'm' }, 

	// 3 Associative
	APL: { top: 'š', bottom: undefined }, 
	PUR: { top: 'š', bottom: 'd' }, 
	TRA: { top: 'š', bottom: 'š' }, 
	DFR: { top: 'š', bottom: 'g' }, 
	CRS: { top: 'š', bottom: 'p' }, 
	TSP: { top: 'š', bottom: 't' }, 
	CMM: { top: 'š', bottom: 'k' }, 
	CMP: { top: 'š', bottom: 'b' }, 
	CSD: { top: 'š', bottom: 'm' }, 

	// 4 Adverbial
	FUN: { top: 'g', bottom: undefined }, 
	TFM: { top: 'g', bottom: 'd' }, 
	CLA: { top: 'g', bottom: 'š' }, 
	RSL: { top: 'g', bottom: 'g' }, 
	CSM: { top: 'g', bottom: 'p' }, 
	CON: { top: 'g', bottom: 't' }, 
	AVR: { top: 'g', bottom: 'k' }, 
	CVS: { top: 'g', bottom: 'b' }, 
	SIT: { top: 'g', bottom: 'm' }, 

	// 5 Relational
	PRN: { top: 'p', bottom: undefined }, 
	DSP: { top: 'p', bottom: 'd' }, 
	COR: { top: 'p', bottom: 'š' }, 
	CPS: { top: 'p', bottom: 'g' }, 
	COM: { top: 'p', bottom: 'p' }, 
	UTL: { top: 'p', bottom: 't' }, 
	PRD: { top: 'p', bottom: 'k' }, 
	RLT: { top: 'p', bottom: 'm' }, 

	// 6 Affinitive
	ACT: { top: 't', bottom: undefined }, 
	ASI: { top: 't', bottom: 'd' }, 
	ESS: { top: 't', bottom: 'š' }, 
	TRM: { top: 't', bottom: 'g' }, 
	SEL: { top: 't', bottom: 'p' }, 
	CFM: { top: 't', bottom: 't' }, 
	DEP: { top: 't', bottom: 'k' }, 
	VOC: { top: 't', bottom: 'm' }, 

	// 7 ST-1
	LOC: { top: 'k', bottom: undefined }, 
	ATD: { top: 'k', bottom: 'd' }, 
	ALL: { top: 'k', bottom: 'š' }, 
	ABL: { top: 'k', bottom: 'g' }, 
	ORI: { top: 'k', bottom: 'p' }, 
	IRL: { top: 'k', bottom: 't' }, 
	INV: { top: 'k', bottom: 'k' }, 
	NAV: { top: 'k', bottom: 'm' }, 

	// 8 ST-2
	CNR: { top: 'b', bottom: undefined }, 
	ASS: { top: 'b', bottom: 'd' }, 
	PER: { top: 'b', bottom: 'š' }, 
	PRO: { top: 'b', bottom: 'g' }, 
	PCV: { top: 'b', bottom: 'p' }, 
	PCR: { top: 'b', bottom: 't' }, 
	ELP: { top: 'b', bottom: 'k' }, 
	PLM: { top: 'b', bottom: 'm' }, 

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

	OBS: '^s_s',
	REC: '^s_ḑ',
	PUP: '^s_f',
	RPR: '^s_ř',
	IMA: '^s_v',
	CVN: '^s_ţ',
	ITU: '^s_x',
	INF: '^s_n',
	USP: '^s_z',
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

export const THOUSANDS_DIACRITICS = {
	'1': '<ä',
	'2': '<ò',
	'3': '<i',
	'4': '<ï',
	'5': '⋮iäa',
	'6': '⋮aäf', // best I could find for now
	'7': '<o',
	'8': '<ö',
	'9': '<ó',
};
