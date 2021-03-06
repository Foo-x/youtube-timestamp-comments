module JsonModel.Second2Comments exposing (Hours, Minutes, Second2Comments, Seconds, decoder, mergeSecond2Comments, uniqueComments)

import Dict exposing (Dict)
import Dict.Extra as DictEx
import Json.Decode as D exposing (Decoder, Error)
import List.Extra as ListEx


type alias Second2Comments =
    Dict Seconds (List String)


type alias Hours =
    Int


type alias Minutes =
    Int


type alias Seconds =
    Int


decoder : Decoder Second2Comments
decoder =
    let
        toInt str =
            String.toInt str
                |> Maybe.withDefault 0
    in
    D.dict (D.list D.string)
        |> D.map (DictEx.mapKeys toInt)


mergeSecond2Comments : Second2Comments -> Second2Comments -> Second2Comments
mergeSecond2Comments s2c1 s2c2 =
    Dict.merge
        (\k comments1 -> Dict.insert k comments1)
        (\k comments1 comments2 -> Dict.insert k <| List.append comments1 comments2)
        (\k comments2 -> Dict.insert k comments2)
        s2c1
        s2c2
        Dict.empty


uniqueComments : Second2Comments -> Second2Comments
uniqueComments s2c =
    Dict.toList s2c
        |> List.map zipOneToMany
        |> List.concatMap identity
        |> ListEx.uniqueBy Tuple.second
        |> List.map (\( k, v ) -> ( k, [ v ] ))
        |> DictEx.fromListDedupe (++)


zipOneToMany : ( a, List b ) -> List ( a, b )
zipOneToMany ( element, list ) =
    List.map (Tuple.pair element) list
