import lexicon from '../resources/lexicon-json/lexicon_en.json';
import { main as search, } from './external_gleam/build/dev/javascript/external_gleam/external_gleam.mjs';
import { SearchType, } from './search';

declare function search(lexicon: Lexicon, type: SearchType, options: SearchOptions): string;

export type Lexicon = {
  roots: Array<Root>;
  affixes: {
    standard: Array<StandardAffix>;
    accessor: Array<CaseAccessorAffix>;
    stacking: Array<CaseStackingAffix>;
  };
};

export type SearchOptions = {
    keyword: string;
    fields: Array< "all" | "name" | "description" | "notes" | "value" | "association" >;
};

export type SearchLexiconResult  = {
    matches: Lexicon;
    type: SearchType;
    options: SearchOptions;
};


export type Root = {
  root: string;
  refers?: string;
  stems?: [
    Specs | string,
    Specs | string,
    Specs | string,
  ];
  /** Notes in markdown format */
  notes?: string;
  /** See the root below if the stems are empty as they may have similar pattern */
  see?: string;
};

type Specs = {
  /** basic */
  "BSC": string;
  /** contential */
  "CTE": string;
  /** constitutive */
  "CSV": string;
  /** objective */
  "OBJ": string;
};


type StandardAffix = {
  name: string;
  description: string;
  gradient_type: "0" | "A1" | "A2" | "B" | "C" | "D1" | "D2";
  cs: string;
  associated_root: boolean;
  degrees: [
    // Degree 0
    Degree | null,
    // Below are Degree 1~9
    Degree,
    Degree,
    Degree,
    Degree,
    Degree,
    Degree,
    Degree,
    Degree,
    Degree,
  ];
  notes?: string;
};

type Degree =
  // Suitable for most situations
  | string
  // Suitable for the situation where the Type-2 of current affix has another meaning
  | [string, string];

  type Case = {
  cs: string;
  /* All possible vowel forms */
  vx: Array<string>;
  description: string;
};

type CaseAccessorAffix = {
  name: string;
  description: string;
  gradient_type: string;
  types: [
    // Type-1
    Array<Case>,
    // Type-2
    Array<Case>,
    // Type-3
    Array<Case>,
  ];
};

type CaseStackingAffix = {
  name: string;
  description: string;
  gradient_type: string;
  cases: Array<Case>;
};


export default search;

// const result = search(lexicon as unknown as Lexicon, "lexicon", {
// 	keyword: "hi",
// 	fields: [ "name",],
// });
//
// console.log("Search results:", JSON.stringify(result, null, 2));
