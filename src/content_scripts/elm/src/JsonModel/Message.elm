module JsonModel.Message exposing (Incoming(..), ViewProps, decode)

import Common.Error as Error exposing (Error)
import Json.Decode as D exposing (Decoder, Value)
import Json.Decode.Pipeline as DP


type Incoming
    = Undefined
    | Initialize
    | NextPage
    | Cache ViewProps
    | SaveViewProps ViewProps


type alias ViewProps =
    { scroll : Float
    , sideMenuScroll : Float
    , selectedSeconds : String
    }


decode : Value -> Result Error Incoming
decode value =
    D.decodeValue decoder value
        |> Result.mapError Error.decodeError


decoder : Decoder Incoming
decoder =
    D.field "type" D.string
        |> D.andThen incomingDecoder


viewPropsDecoder : Decoder ViewProps
viewPropsDecoder =
    D.succeed ViewProps
        |> DP.required "scroll" D.float
        |> DP.required "sideMenuScroll" D.float
        |> DP.required "selectedSeconds" D.string


incomingDecoder : String -> Decoder Incoming
incomingDecoder typeStr =
    case typeStr of
        "initialize" ->
            D.succeed Initialize

        "cache" ->
            D.succeed Cache
                |> DP.required "data" viewPropsDecoder

        "next-page" ->
            D.succeed NextPage

        "save-view-props" ->
            D.succeed SaveViewProps
                |> DP.required "data" viewPropsDecoder

        _ ->
            D.succeed Undefined
