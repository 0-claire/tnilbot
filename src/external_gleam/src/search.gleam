import gleam/dynamic/decode
import gleam/io
import gleam/json
import gleam/list
import gleam/option.{type Option, None, Some}
import gleam/string
import lexicon.{type Lexicon}

pub type SearchField {
  All
  Name
  Description
  Notes
  Value
  Association
  Cases
  GradientType
}

pub fn search_field_decoder() -> decode.Decoder(SearchField) {
  use variant <- decode.then(decode.string)
  case variant {
    "all" -> decode.success(All)
    "name" -> decode.success(Name)
    "description" -> decode.success(Description)
    "notes" -> decode.success(Notes)
    "value" -> decode.success(Value)
    "association" -> decode.success(Association)
    "cases" -> decode.success(Cases)
    "gradient_type" -> decode.success(GradientType)
    _ -> decode.failure(All, "SearchField")
  }
}

pub type SearchType {
  Lexicon
  Roots
  Affixes
  Morphology
}

pub fn search_type_decoder() -> decode.Decoder(SearchType) {
  use variant <- decode.then(decode.string)
  case variant {
    "lexicon" -> decode.success(Lexicon)
    "roots" -> decode.success(Roots)
    "affixes" -> decode.success(Affixes)
    "morphology" -> decode.success(Morphology)
    _ -> decode.failure(Lexicon, "SearchType")
  }
}

pub fn search_type_encoder(search_type: SearchType) -> json.Json {
  case search_type {
    Lexicon -> "lexicon"
    Roots -> "roots"
    Affixes -> "affixes"
    Morphology -> "morphology"
  }
  |> json.string
}

pub type SearchLexiconResult {
  SearchLexiconResult(
    matches: Lexicon,
    type_: SearchType,
    options: SearchOptions,
  )
}

pub type SearchOptions {
  SearchOptions(keyword: String, fields: List(SearchField))
}

pub fn search_options_decoder() -> decode.Decoder(SearchOptions) {
  use keyword <- decode.field("keyword", decode.string)
  use fields <- decode.field("fields", decode.list(search_field_decoder()))
  decode.success(SearchOptions(keyword:, fields:))
}

pub fn search_options_encoder(search_options: SearchOptions) -> json.Json {
  json.object([
    #("keyword", json.string(search_options.keyword)),
    #(
      "fields",
      json.array(search_options.fields, fn(a: SearchField) {
        case a {
          All -> "all"
          Name -> "name"
          Description -> "description"
          Notes -> "notes"
          Value -> "value"
          Association -> "association"
          Cases -> "cases"
          GradientType -> "gradient_type"
        }
        |> json.string
      }),
    ),
  ])
}

pub fn search(
  lexicon: lexicon.Lexicon,
  type_: SearchType,
  options: SearchOptions,
) -> SearchLexiconResult {
  let options = SearchOptions(..options, fields: options.fields)

  io.print("options: ")
  options |> echo
  io.print("type_: ")
  type_ |> echo

  case type_ {
    Lexicon ->
      SearchLexiconResult(
        type_:,
        options:,
        matches: lexicon.Lexicon(
          search_roots(lexicon.roots, options),
          search_affixes(lexicon, type_, options),
        ),
      )
    Roots ->
      SearchLexiconResult(
        type_:,
        options:,
        matches: lexicon.Lexicon(
          search_roots(lexicon.roots, options),
          lexicon.Affixes(standard: [], accessor: [], stacking: []),
        ),
      )
    Affixes ->
      SearchLexiconResult(
        type_:,
        options:,
        matches: lexicon.Lexicon([], search_affixes(lexicon, type_, options)),
      )
    Morphology -> todo
  }
}

pub fn search_roots(
  roots: List(lexicon.Root),
  options: SearchOptions,
) -> List(lexicon.Root) {
  list.filter(roots, fn(root: lexicon.Root) {
    options.fields
    |> list.unique
    |> list.fold_until(False, fn(_bool: Bool, field: SearchField) {
      case
        {
          case field {
            Name -> root.refers |> optional_string_contains(options.keyword)
            Description ->
              root.notes |> optional_string_contains(options.keyword)
            Notes -> root.notes |> optional_string_contains(options.keyword)
            Value ->
              root.root
              |> string.lowercase
              |> string.contains(options.keyword |> string.lowercase())
            Association ->
              root.refers |> optional_string_contains(options.keyword)
            // these don't apply to roots
            Cases -> False
            // these don't apply to roots
            GradientType -> False
            // ignore the All case
            All -> False
          }
        }
      {
        True -> list.Stop(True)
        False -> list.Continue(False)
      }
    })
  })
}

pub fn optional_string_contains(
  maybe_string: Option(String),
  keyword: String,
) -> Bool {
  case maybe_string {
    Some(string) ->
      string
      |> string.lowercase()
      |> string.contains(keyword |> string.lowercase())
    None -> False
  }
}

pub fn search_affixes(
  lexicon: lexicon.Lexicon,
  _type_: SearchType,
  options: SearchOptions,
) -> lexicon.Affixes {
  let accessor =
    list.filter(lexicon.affixes.accessor, fn(affix: lexicon.CaseAccessorAffix) {
      options.fields
      |> list.fold_until(False, fn(_bool: Bool, field: SearchField) {
        case
          case field {
            Name -> affix.name |> string.contains(options.keyword)
            Description -> affix.description |> string.contains(options.keyword)
            GradientType -> todo
            Cases -> todo
            _ -> False
          }
        {
          True -> list.Stop(True)
          False -> list.Continue(False)
        }
        // xyz
      })
    })

  let stacking =
    list.filter(lexicon.affixes.stacking, fn(affix: lexicon.CaseStackingAffix) {
      options.fields
      |> list.fold_until(False, fn(_bool: Bool, field: SearchField) {
        case
          case field {
            Name -> affix.name |> string.contains(options.keyword)
            Description -> affix.description |> string.contains(options.keyword)
            // gradient_type
            // cases
            GradientType -> todo
            Cases -> todo
            _ -> False
          }
        {
          True -> list.Stop(True)
          False -> list.Continue(False)
        }
        // xyz
      })
    })

  let standard =
    list.filter(lexicon.affixes.standard, fn(affix: lexicon.StandardAffix) {
      options.fields
      |> list.fold_until(False, fn(_bool: Bool, field: SearchField) {
        case
          {
            case field {
              Name -> affix.name |> string.contains(options.keyword)
              Description ->
                affix.description |> string.contains(options.keyword)
              Notes -> affix.notes |> optional_string_contains(options.keyword)
              Value -> affix.cs |> string.contains(options.keyword)
              Association -> {
                case get_associated_root(lexicon, affix) {
                  Some(the_associated_root) ->
                    case search_roots([the_associated_root], options) {
                      [_, ..] -> True
                      [] -> False
                    }
                  None -> False
                }
              }
              // ignore the All case
              All -> False
              GradientType -> todo
              Cases -> False
            }
          }
        {
          True -> list.Stop(True)
          False -> list.Continue(False)
        }
      })
    })
  lexicon.Affixes(standard:, accessor:, stacking:)
}

pub fn get_associated_root(
  lexicon: lexicon.Lexicon,
  affix: lexicon.StandardAffix,
) -> Option(lexicon.Root) {
  case affix.associated_root {
    True ->
      case list.find(lexicon.roots, fn(root) { root.root == affix.cs }) {
        Ok(the_associated_root) -> Some(the_associated_root)
        _ -> {
          None
        }
      }
    False -> {
      None
    }
  }
}

pub fn search_lexicon_result_encoder(result: SearchLexiconResult) -> json.Json {
  json.object([
    #("matches", lexicon.lexicon_encoder(result.matches)),
    #("type", search_type_encoder(result.type_)),
    #("options", search_options_encoder(result.options)),
  ])
}
