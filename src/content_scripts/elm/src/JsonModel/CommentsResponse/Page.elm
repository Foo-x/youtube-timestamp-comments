module JsonModel.CommentsResponse.Page exposing (decodeContinuation, decodeItct)

import Common.Error as Error exposing (Error)
import Json.Decode as D exposing (Decoder, Value)
import JsonModel.CommentsResponse.Common exposing (Continuation, Itct)
import Maybe.Extra as MaybeEx



-- continuation


decodeContinuation : Value -> Result Error Continuation
decodeContinuation value =
    D.decodeValue (decoder "continuation") value
        |> Result.mapError Error.decodeError



-- itct


decodeItct : Value -> Result Error Itct
decodeItct value =
    D.decodeValue (decoder "clickTrackingParams") value
        |> Result.mapError Error.decodeError


decoder : String -> Decoder String
decoder key =
    D.list (eachContinuationDataDecoder key)
        |> D.map (MaybeEx.values >> List.head)
        |> D.andThen extractStringDecoder


atContents : Decoder a -> Decoder (Maybe (List a))
atContents d =
    D.maybe <|
        D.at [ "response", "contents", "twoColumnWatchNextResults", "results", "results", "contents" ] <|
            D.list d


eachContinuationDataDecoder : String -> Decoder (Maybe String)
eachContinuationDataDecoder key =
    atContents (D.maybe <| D.at [ "itemSectionRenderer", "continuations" ] <| D.index 0 <| D.at [ "nextContinuationData", key ] D.string)
        -- Maybe (List (Maybe String)) -> Maybe
        |> D.map (Maybe.map (MaybeEx.values >> List.head) >> MaybeEx.join)


extractStringDecoder : Maybe String -> Decoder String
extractStringDecoder maybeContinuation =
    Maybe.map D.succeed maybeContinuation
        |> Maybe.withDefault (D.fail "no value")
