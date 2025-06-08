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
    ICP: "≡zz",
    CPL: "≡sa",
    DUP: "≡as",
    DEM: "≡af",
    CNG: "≡av",
    PTI: "≡sf"
};

export const TERTIARY_ASPECTS_PHASES_EFFECTS = {
    "1/BEN": "⋮aia",
    "2/BEN": "⋮sia",
    "3/BEN": "⋮ais",
    "SLF/BEN": "⋮sis",
    "UNKNOWN": "⋮zia",
    "SLF/DET": "⋮aiz",
    "3/DET": "⋮sim",
    "2/DET": "⋮mia",
    "1/DET": "⋮aim",

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