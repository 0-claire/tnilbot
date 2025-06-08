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