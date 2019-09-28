module JsonModel.CommentsResponse.Comments exposing
    ( Comments
    , decodeCommentTexts
    , decodeMaxCount
    , decodeNextContinuation
    , decodeReplyContinuations
    )

import Common.Error as Error exposing (Error)
import Json.Decode as D exposing (Decoder, Value)
import JsonModel.CommentsResponse.Common exposing (Continuation, MaxCount, Texts)
import Maybe.Extra as MaybeEx


type alias Comments =
    Value


atContents : Decoder a -> Decoder (List a)
atContents decoder =
    D.at [ "response", "continuationContents", "itemSectionContinuation", "contents" ] <|
        D.list decoder



-- for texts


decodeCommentTexts : Value -> Result Error Texts
decodeCommentTexts value =
    D.decodeValue commentTextsDecoder value
        |> Result.mapError Error.decodeError


atRuns : Decoder a -> Decoder (List a)
atRuns decoder =
    D.at [ "commentThreadRenderer", "comment", "commentRenderer", "contentText", "runs" ] <|
        D.list decoder


commentTextDecoder : Decoder String
commentTextDecoder =
    atRuns (D.field "text" D.string)
        |> D.map (String.join "")


commentTextsDecoder : Decoder Texts
commentTextsDecoder =
    atContents commentTextDecoder



-- for maxCount


decodeMaxCount : Value -> Result Error MaxCount
decodeMaxCount value =
    D.decodeValue maxCountDecoder value
        |> Result.mapError Error.decodeError


maxCountDecoder : Decoder MaxCount
maxCountDecoder =
    (D.at [ "response", "continuationContents", "itemSectionContinuation", "header", "commentsHeaderRenderer", "countText", "runs" ] <| D.index 0 <| D.field "text" D.string)
        |> D.map String.words
        |> D.map List.head
        |> D.map (Maybe.map <| String.replace "," "")
        |> D.map (Maybe.andThen String.toInt)
        |> D.map (Maybe.withDefault 0)



-- for replyContinuations


decodeReplyContinuations : Value -> Result Error (List Continuation)
decodeReplyContinuations value =
    D.decodeValue replyContinuationsDecoder value
        |> Result.mapError Error.decodeError


replyContinuationDecoder : Decoder (Maybe Continuation)
replyContinuationDecoder =
    D.maybe <|
        D.at [ "commentThreadRenderer", "replies", "commentRepliesRenderer", "continuations" ] <|
            D.index 0 <|
                D.at [ "nextContinuationData", "continuation" ] D.string


replyContinuationsDecoder : Decoder (List Continuation)
replyContinuationsDecoder =
    atContents replyContinuationDecoder
        |> D.map MaybeEx.values



-- for nextContinuation


decodeNextContinuation : Value -> Result Error (Maybe Continuation)
decodeNextContinuation value =
    D.decodeValue nextContinuationDecoder value
        |> Result.mapError Error.decodeError


nextContinuationDecoder : Decoder (Maybe Continuation)
nextContinuationDecoder =
    D.maybe <|
        D.at [ "response", "continuationContents", "itemSectionContinuation", "continuations" ] <|
            D.index 0 <|
                D.at [ "nextContinuationData", "continuation" ] D.string
