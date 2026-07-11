import gleam/dynamic/decode
import gleam/json
import gleam/option.{type Option, None, Some}

pub type Lexicon {
  Lexicon(roots: List(Root), affixes: Affixes)
}

pub fn lexicon_decoder() -> decode.Decoder(Lexicon) {
  use roots <- decode.field("roots", decode.list(root_decoder()))
  use affixes <- decode.field("affixes", affixes_decoder())
  decode.success(Lexicon(roots:, affixes:))
}

pub fn lexicon_encoder(lexicon: Lexicon) -> json.Json {
  json.object([
    #("roots", json.array(lexicon.roots, root_encoder)),
    #("affixes", affixes_encoder(lexicon.affixes)),
  ])
}

pub type Affixes {
  Affixes(
    standard: List(StandardAffix),
    accessor: List(CaseAccessorAffix),
    stacking: List(CaseStackingAffix),
  )
}

pub fn affixes_encoder(affixes: Affixes) -> json.Json {
  json.object([
    #("standard", json.array(affixes.standard, standard_affix_encoder)),
    #("accessor", json.array(affixes.accessor, case_accessor_affix_encoder)),
    #("stacking", json.array(affixes.stacking, case_stacking_affix_encoder)),
  ])
}

pub fn affixes_decoder() -> decode.Decoder(Affixes) {
  use standard <- decode.field(
    "standard",
    decode.list(standard_affix_decoder()),
  )
  use accessor <- decode.field(
    "accessor",
    decode.list(case_accessor_affix_decoder()),
  )
  use stacking <- decode.field(
    "stacking",
    decode.list(case_stacking_affix_decoder()),
  )
  decode.success(Affixes(standard:, accessor:, stacking:))
}

// pub fn lexicon_decoder() -> decode.Decoder(Lexicon) {
//   use variant <- decode.field("type", decode.string)
//   case variant {
//     "lexicon" -> {
//       use roots <- decode.field("roots", decode.list(root_decoder()))
//       decode.success(Lexicon(roots:))
//     }
//     "affixes" -> {
//       use standard <- decode.field(
//         "standard",
//         decode.list(standard_affix_decoder()),
//       )
//       use accessor <- decode.field(
//         "accessor",
//         decode.list(case_accessor_affix_decoder()),
//       )
//       use stacking <- decode.field(
//         "stacking",
//         decode.list(case_stacking_affix_decoder()),
//       )
//       decode.success(Affixes(standard:, accessor:, stacking:))
//     }
//     _ -> decode.failure(Lexicon(roots: []), "Lexicon")
//   }
// }

pub type Stem {
  Specs(bsc: String, cte: String, csv: String, obj: String)
  Other(String)
}

fn specs_decoder() -> decode.Decoder(Stem) {
  use bsc <- decode.field("BSC", decode.string)
  use cte <- decode.field("CTE", decode.string)
  use csv <- decode.field("CSV", decode.string)
  use obj <- decode.field("OBJ", decode.string)
  decode.success(Specs(bsc:, cte:, csv:, obj:))
}

pub fn stem_decoder() -> decode.Decoder(Stem) {
  decode.one_of(specs_decoder(), [
    decode.string |> decode.map(Other),
  ])
}

pub fn stems_encoder(stems: List(Stem)) -> json.Json {
  use variant <- json.array(stems)
  case variant {
    Other(string) -> json.string(string)
    Specs(bsc, cte, csv, obj) ->
      json.object([
        #("BSC", bsc |> json.string),
        #("CTE", cte |> json.string),
        #("CSV", csv |> json.string()),
        #("OBJ", obj |> json.string()),
      ])
  }
}

pub type Root {
  Root(
    root: String,
    refers: Option(String),
    stems: Option(List(Stem)),
    // /** Notes in markdown format */
    notes: Option(String),
    // /** See the root below if the stems are empty as they may have similar pattern */
    see: Option(String),
  )
}

pub fn root_decoder() -> decode.Decoder(Root) {
  use root <- decode.field("root", decode.string)
  use refers <- decode.optional_field(
    "refers",
    None,
    decode.string |> decode.map(Some),
  )
  use stems <- decode.optional_field(
    "stems",
    None,
    decode.list(stem_decoder()) |> decode.map(Some),
  )
  // use notes2 <- decode.then(
  //   decode.optional(decode.field("notes", decode.optional(decode.string))),
  // )
  use notes <- decode.optional_field(
    "notes",
    None,
    decode.optional(decode.string),
  )
  use see <- decode.optional_field("see", None, decode.optional(decode.string))
  decode.success(Root(root:, refers:, stems:, notes:, see:))
}

pub fn root_encoder(root: Root) -> json.Json {
  json.object([
    #("root", json.string(root.root)),
    #("refers", json.nullable(root.refers, json.string)),
    #("stems", json.nullable(root.stems, stems_encoder)),
    #("notes", json.nullable(root.notes, json.string)),
    #("see", json.nullable(root.see, json.string)),
  ])
}

// type Specs {
//   /** basic */
//   "BSC": string;
//   /** contential */
//   "CTE": string;
//   /** constitutive */
//   "CSV": string;
//   /** objective */
//   "OBJ": string;
// }

pub type GradientType {
  Zero
  A1
  A2
  B
  C
  D1
  D2
}

pub fn gradient_type_decoder() -> decode.Decoder(GradientType) {
  use variant <- decode.then(decode.string)
  case variant {
    "0" -> decode.success(Zero)
    "A1" -> decode.success(A1)
    "A2" -> decode.success(A2)
    "B" -> decode.success(B)
    "C" -> decode.success(C)
    "D1" -> decode.success(D1)
    "D2" -> decode.success(D2)
    _ -> decode.failure(Zero, "GradientType")
  }
}

pub fn gradient_type_encoder(variant: GradientType) -> json.Json {
  case variant {
    Zero -> "0"
    A1 -> "A1"
    A2 -> "A2"
    B -> "B"
    C -> "C"
    D1 -> "D1"
    D2 -> "D2"
  }
  |> json.string
}

pub type StandardAffix {
  StandardAffix(
    name: String,
    description: String,
    gradient_type: GradientType,
    cs: String,
    associated_root: Bool,
    degrees: #(
      // Degree 0
      Option(Degree),
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
    ),
    notes: Option(String),
  )
}

pub fn standard_affix_decoder() -> decode.Decoder(StandardAffix) {
  use name <- decode.field("name", decode.string)
  use description <- decode.field("description", decode.string)
  use gradient_type <- decode.field("gradient_type", gradient_type_decoder())
  use cs <- decode.field("cs", decode.string)
  use associated_root <- decode.field("associated_root", decode.bool)
  use degrees <- decode.field("degrees", {
    use a <- decode.field(0, decode.optional(degree_decoder()))
    use b <- decode.field(1, degree_decoder())
    use c <- decode.field(2, degree_decoder())
    use d <- decode.field(3, degree_decoder())
    use e <- decode.field(4, degree_decoder())
    use f <- decode.field(5, degree_decoder())
    use g <- decode.field(6, degree_decoder())
    use h <- decode.field(7, degree_decoder())
    use i <- decode.field(8, degree_decoder())
    use j <- decode.field(9, degree_decoder())

    decode.success(#(a, b, c, d, e, f, g, h, i, j))
  })
  use notes <- decode.optional_field(
    "notes",
    None,
    decode.string |> decode.map(Some),
  )
  decode.success(StandardAffix(
    name:,
    description:,
    gradient_type:,
    cs:,
    associated_root:,
    degrees:,
    notes:,
  ))
}

pub fn standard_affix_encoder(affix: StandardAffix) -> json.Json {
  json.object([
    #("name", affix.name |> json.string),
    #("description", affix.description |> json.string),
    #("gradient_type", affix.gradient_type |> gradient_type_encoder),
    #("cs", affix.cs |> json.string),
    #("associated_root", affix.associated_root |> json.bool),
    #("degrees", affix.degrees |> degrees_encoder),
    #("notes", affix.notes |> json.nullable(json.string)),
  ])
}

pub type Degree {
  // Suitable for most situations
  Degree(String)
  // Suitable for the situation where the Type-2 of current affix has another meaning
  Degrees(#(String, String))
}

pub fn degree_decoder() -> decode.Decoder(Degree) {
  use value <- decode.new_primitive_decoder("Degree")
  case decode.run(value, decode.string) {
    Ok(string) -> Ok(Degree(string))
    _ -> {
      case
        decode.run(value, decode.at([0], decode.string)),
        decode.run(value, decode.at([1], decode.string))
      {
        Ok(a), Ok(b) -> {
          Ok(Degrees(#(a, b)))
        }
        _, _ -> Error(Degree(""))
      }
    }
  }
}

pub fn degree_encoder(degree: Degree) -> json.Json {
  case degree {
    Degree(string) -> string |> json.string
    Degrees(#(a, b)) -> json.array([a, b], json.string)
  }
}

pub fn degrees_encoder(
  degrees: #(
    // Degree 0
    Option(Degree),
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
  ),
) -> json.Json {
  json.preprocessed_array([
    degrees.0 |> json.nullable(degree_encoder),
    degrees.1 |> degree_encoder,
    degrees.2 |> degree_encoder,
    degrees.3 |> degree_encoder,
    degrees.4 |> degree_encoder,
    degrees.5 |> degree_encoder,
    degrees.6 |> degree_encoder,
  ])
}

pub type Case {
  Case(
    cs: String,
    // /* All possible vowel forms */
    vx: List(String),
    description: String,
  )
}

pub fn case_decoder() -> decode.Decoder(Case) {
  use cs <- decode.field("cs", decode.string)
  use vx <- decode.field("vx", decode.list(decode.string))
  use description <- decode.field("description", decode.string)
  decode.success(Case(cs:, vx:, description:))
}

pub fn case_encoder(case_: Case) -> json.Json {
  json.object([
    #("cs", json.string(case_.cs)),
    #("vx", json.array(case_.vx, json.string)),
    #("description", json.string(case_.description)),
  ])
}

pub type CaseAccessorAffix {
  CaseAccessorAffix(
    name: String,
    description: String,
    gradient_type: GradientType,
    types: #(
      // Type-1
      List(Case),
      // Type-2
      List(Case),
      // Type-3
      List(Case),
    ),
  )
}

pub fn case_accessor_affix_decoder() -> decode.Decoder(CaseAccessorAffix) {
  use name <- decode.field("name", decode.string)
  use description <- decode.field("description", decode.string)
  use gradient_type <- decode.field("gradient_type", gradient_type_decoder())
  use types <- decode.field("types", {
    use a <- decode.field(0, decode.list(case_decoder()))
    use b <- decode.field(1, decode.list(case_decoder()))
    use c <- decode.field(2, decode.list(case_decoder()))

    decode.success(#(a, b, c))
  })
  decode.success(CaseAccessorAffix(name:, description:, gradient_type:, types:))
}

pub fn case_accessor_affix_encoder(affix: CaseAccessorAffix) -> json.Json {
  json.object([
    #("name", json.string(affix.name)),
    #("description", json.string(affix.description)),
    #("gradient_type", gradient_type_encoder(affix.gradient_type)),
    #(
      "types",
      json.array(
        [affix.types.0, affix.types.1, affix.types.2],
        fn(case_list: List(Case)) { json.array(case_list, case_encoder) },
      ),
    ),
  ])
}

pub fn case_accessor_encoder(affix: CaseAccessorAffix) -> json.Json {
  json.object([
    #("name", json.string(affix.name)),
    #("description", json.string(affix.description)),
    #("gradient_type", gradient_type_encoder(affix.gradient_type)),
  ])
}

pub type CaseStackingAffix {
  CaseStackingAffix(
    name: String,
    description: String,
    gradient_type: GradientType,
    cases: List(Case),
  )
}

pub fn case_stacking_affix_decoder() -> decode.Decoder(CaseStackingAffix) {
  use name <- decode.field("name", decode.string)
  use description <- decode.field("description", decode.string)
  use gradient_type <- decode.field("gradient_type", gradient_type_decoder())
  use cases <- decode.field("cases", decode.list(case_decoder()))
  decode.success(CaseStackingAffix(name:, description:, gradient_type:, cases:))
}

pub fn case_stacking_affix_encoder(affix: CaseStackingAffix) -> json.Json {
  json.object([
    #("name", json.string(affix.name)),
    #("description", json.string(affix.description)),
    #("gradient_type", gradient_type_encoder(affix.gradient_type)),
    #("cases", json.array(affix.cases, case_encoder)),
  ])
}
