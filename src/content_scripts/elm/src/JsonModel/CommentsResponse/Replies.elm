module JsonModel.CommentsResponse.Replies exposing (Replies, decodeNextReplyContinuation, decodeReplyTexts)

import Common.Error as Error exposing (Error)
import Json.Decode as D exposing (Decoder, Value)
import JsonModel.CommentsResponse.Common exposing (Continuation, Texts)


type alias Replies =
    Value


atContents : Decoder a -> Decoder (List a)
atContents decoder =
    D.at [ "response", "continuationContents", "commentRepliesContinuation", "contents" ] <|
        D.list decoder



-- for texts


decodeReplyTexts : Value -> Result Error Texts
decodeReplyTexts value =
    D.decodeValue replyTextsDecoder value
        |> Result.mapError Error.decodeError


atRuns : Decoder a -> Decoder (List a)
atRuns decoder =
    D.at [ "commentRenderer", "contentText", "runs" ] <|
        D.list decoder


replyTextDecoder : Decoder String
replyTextDecoder =
    atRuns (D.field "text" D.string)
        |> D.map (String.join "")


replyTextsDecoder : Decoder Texts
replyTextsDecoder =
    atContents replyTextDecoder



-- for nextReplyContinuation


decodeNextReplyContinuation : Value -> Result Error (Maybe Continuation)
decodeNextReplyContinuation value =
    D.decodeValue nextReplyContinuationDecoder value
        |> Result.mapError Error.decodeError


nextReplyContinuationDecoder : Decoder (Maybe Continuation)
nextReplyContinuationDecoder =
    D.maybe <|
        D.at [ "response", "continuationContents", "commentRepliesContinuation", "continuations" ] <|
            D.index 0 <|
                D.at [ "nextContinuationData", "continuation" ] D.string
