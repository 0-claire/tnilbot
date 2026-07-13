import search, {
	type Lexicon, type SearchOptions, type SearchLexiconResult, Root, 
} from "./lexicon";
import lexicon from '../resources/lexicon-json/lexicon_en.json' with { type: 'json'};
import { ChatInputCommandInteraction, CommandInteraction } from "discord.js";

export type SearchType = "lexicon" | "roots" | "affixes" | "morphology";
export type SearchField = "all" | "name" | "description" | "notes" | "value" | "association";

export type SearchCommandOptions = {
	ignore_punctuation: boolean;
	terms: string;
	field: SearchField;
	regex: boolean;
};

export async function replyUnimplemented(interaction): Promise<unknown> {
	return await interaction.reply({
		content: "This command is not yet implemented.",
		ephemeral: true, 
	});
}


export function searchLexicon(subcommand: SearchType, options: SearchOptions): SearchLexiconResult {
	return JSON.parse(search(lexicon as unknown as Lexicon, subcommand, options)) as SearchLexiconResult;
}

export function formatResultsForDiscord(results: SearchLexiconResult): string[] {
    const { matches, } = results;
    const { roots, affixes, } = matches;
    const {
        standard, accessor, stacking, 
    } = affixes;

    // TODO: write affixes

    console.log(JSON.stringify(matches, null, 2));

    
    let returned: string[] = serializeRoots(roots);

    return returned;
}

function serializeRoots(roots: Root[]): string[] {
  let returned: string[] = [];

    for(let i = 0; i < roots.length; i++) {
      const rootA = '\n' + serializeRoot(roots[i]);
      const rootB = i == roots.length -1 ? "" : '\n' + serializeRoot(roots[i+1]);
      returned.push(rootA + rootB)
      i++;
    }

  return returned;
}

function serializeRoot(root: Root): string {

  let str = '\n' + decorateRoot(root.root);

  if(root.refers)
    str += `\n${root.refers}`;

  if(root.stems)
    str += '\n' + serializeStems(root.stems)

  if(root.notes) 
    str += '\n' + decorateNotes(root.notes);

  if(root.see) 
    str += '\n' + serializeSee(root.see)

  return str;
}


function serializeSee(see: Root['see']): string {
  let str = `See: ${decorateRoot(see)}`;
  // str += 
  // getRoot
  return str;
}

function decorateRoot(root: string): string {
  return `**-${root.toLocaleUpperCase()}-**`;
}

function decorateNotes(notes: string): string {
  return '*' + notes + '*';
}

function serializeStems(stems: Root['stems']): string {
  let str = "";
  if(stems)
    for(let i = 0; i < stems.length; i++) {
      const stem = stems[i];

      if(typeof stem === 'string')
        str += `\nStem ${i+1}: ${stem}`
      else {
        str += '\n'
        str += `\nBSC: ${stem.BSC}`
        str += `\nCTE: ${stem.CTE}`
        str += `\nCSV: ${stem.CSV}`
        str += `\nOBJ: ${stem.OBJ}`
      }
    }
    return str;
}
