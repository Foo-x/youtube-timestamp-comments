module JsonModel.Message exposing (Incoming(..), ViewPropsValue, decode)

import Json.Decode as D exposing (Decoder, Error)
import Json.Decode.Pipeline as DP
import JsonModel.Second2Comments as S2C exposing (Second2Comments)


type Incoming
    = Page Second2Comments Int
    | Complete HasNext
    | MaxCount Int
    | IsReady
    | ViewProps ViewPropsValue


type alias HasNext =
    Bool


type alias ViewPropsValue =
    { scroll : Float
    , sideMenuScroll : Float
    , selectedSeconds : String
    }


decode : D.Value -> Result Error Incoming
decode value =
    D.decodeValue decoder value


atData : Decoder a -> Decoder a
atData d =
    D.field "data" d


decoder : Decoder Incoming
decoder =
    D.field "type" D.string
        |> D.andThen incomingDecoder


viewPropsValueDecoder : Decoder ViewPropsValue
viewPropsValueDecoder =
    D.succeed ViewPropsValue
        |> DP.required "scroll" D.float
        |> DP.required "sideMenuScroll" D.float
        |> DP.required "selectedSeconds" D.string


incomingDecoder : String -> Decoder Incoming
incomingDecoder typeStr =
    case typeStr of
        "page" ->
            atData
                (D.succeed
                    Page
                    |> DP.required "page" S2C.decoder
                    |> DP.required "fetchedCount" D.int
                )

        "complete" ->
            atData
                (D.succeed Complete
                    |> DP.required "hasNext" D.bool
                )

        "max-count" ->
            D.succeed MaxCount
                |> DP.required "data" D.int

        "is-ready" ->
            D.succeed IsReady

        "view-props" ->
            D.succeed ViewProps
                |> DP.required "data" viewPropsValueDecoder

        _ ->
            D.fail "Undefined type"
