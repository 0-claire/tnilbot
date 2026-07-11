// import gleam/io
import gleam/dynamic
import gleam/dynamic/decode
import gleam/io
import gleam/json
import gleam/list
import lexicon
import search.{search}

fn serialize_errors(errors: List(decode.DecodeError)) -> Nil {
  use error <- list.each(errors)
  io.println("Expected: " <> error.expected)
  io.println("Found: " <> error.found)
  io.println(
    "Path: "
    <> error.path |> list.fold("", fn(acc, item) { acc <> "." <> item }),
  )
  io.println("")
}

pub fn main(
  raw_lexicon: dynamic.Dynamic,
  raw_search_type: dynamic.Dynamic,
  raw_search_options: dynamic.Dynamic,
) {
  let lexicon_ = raw_lexicon |> decode.run(lexicon.lexicon_decoder())
  let search_type_ = raw_search_type |> decode.run(search.search_type_decoder())
  let search_options_ =
    raw_search_options |> decode.run(search.search_options_decoder())

  case lexicon_ {
    Error(errors) -> {
      errors |> serialize_errors()
      panic as "Failed to decode lexicon"
    }

    _ -> Nil
  }

  case search_type_ {
    Error(errors) -> {
      io.println("raw_search_type:")
      raw_search_type |> echo
      errors |> serialize_errors()
      panic as "Failed to decode search_type"
    }
    _ -> Nil
  }

  case search_options_ {
    Error(errors) -> {
      io.println("raw_search_options:")
      raw_search_options |> echo
      errors |> serialize_errors()
      panic as "Failed to decode search_options"
    }
    _ -> Nil
  }

  case lexicon_, search_type_, search_options_ {
    Ok(lexicon), Ok(search_type), Ok(search_options) ->
      search(lexicon, search_type, search_options)
      |> search.search_lexicon_result_encoder
      |> json.to_string
    // |> echo
    _, _, _ -> panic
  }
}
