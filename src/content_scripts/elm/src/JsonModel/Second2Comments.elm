module JsonModel.Second2Comments exposing (Second2Comments, createSecond2Comments, encode, mergeSecond2Comments)

import Dict exposing (Dict)
import Json.Encode as E
import JsonModel.CommentsResponse.Common exposing (Texts)
import Regex exposing (Regex)


type alias Second2Comments =
    Dict Seconds Texts


type alias Hours =
    Int


type alias Minutes =
    Int


type alias Seconds =
    Int


timestampRegex : Regex
timestampRegex =
    Regex.fromString "(?:\\d{1,2}:)?\\d{1,2}:\\d{2}" |> Maybe.withDefault Regex.never


encode : Second2Comments -> E.Value
encode s2c =
    E.dict String.fromInt (E.list E.string) s2c


createSecond2Comments : Texts -> Second2Comments
createSecond2Comments comments =
    List.map createSecond2CommentsFromComment comments
        |> List.foldl mergeSecond2Comments Dict.empty


createSecond2CommentsFromComment : String -> Second2Comments
createSecond2CommentsFromComment comment =
    Regex.find timestampRegex comment
        |> List.map .match
        |> List.map timestampToSeconds
        |> List.map (\second -> ( second, [ comment ] ))
        |> Dict.fromList


mergeSecond2Comments : Second2Comments -> Second2Comments -> Second2Comments
mergeSecond2Comments s2c1 s2c2 =
    Dict.merge
        (\k comments1 -> Dict.insert k comments1)
        (\k comments1 comments2 -> Dict.insert k <| List.append comments1 comments2)
        (\k comments2 -> Dict.insert k comments2)
        s2c1
        s2c2
        Dict.empty


timestampToSeconds : String -> Seconds
timestampToSeconds timestamp =
    case String.split ":" timestamp of
        hours :: minutes :: seconds :: _ ->
            Maybe.map3
                hmsToSeconds
                (String.toInt hours)
                (String.toInt minutes)
                (String.toInt seconds)
                |> Maybe.withDefault 0

        minutes :: seconds :: _ ->
            Maybe.map3
                hmsToSeconds
                (Just 0)
                (String.toInt minutes)
                (String.toInt seconds)
                |> Maybe.withDefault 0

        _ ->
            0


hmsToSeconds : Hours -> Minutes -> Seconds -> Seconds
hmsToSeconds hours minutes seconds =
    hours * 3600 + minutes * 60 + seconds
