module JsonModel.Message exposing (Incoming(..), Scroll, decode)

import Common.Error as Error exposing (Error)
import Json.Decode as D exposing (Decoder, Value)
import Json.Decode.Pipeline as DP


type alias Scroll =
    Float


type Incoming
    = Undefined
    | Initialize
    | NextPage
    | Cache
    | SaveScroll Scroll


decode : Value -> Result Error Incoming
decode value =
    D.decodeValue decoder value
        |> Result.mapError Error.decodeError


decoder : Decoder Incoming
decoder =
    D.field "type" D.string
        |> D.andThen incomingDecoder


incomingDecoder : String -> Decoder Incoming
incomingDecoder typeStr =
    case typeStr of
        "initialize" ->
            D.succeed Initialize

        "cache" ->
            D.succeed Cache

        "next-page" ->
            D.succeed NextPage

        "save-scroll" ->
            D.succeed SaveScroll
                |> DP.required "data" D.float

        _ ->
            D.succeed Undefined
