module Main exposing (main)

import Browser
import Dict exposing (Dict)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Json.Decode as D
import JsonModel.Message as Message exposing (Incoming)
import JsonModel.Second2Comments exposing (Hours, Minutes, Second2Comments, Seconds)
import Ports.Chrome.Tabs as Tabs
import Process
import Regex exposing (Regex)
import Task



-- MODEL


type alias Model =
    { sec2Comments : Second2Comments
    , fetchedCount : Int
    , maxCount : Int
    , remainingPages : Int
    , hasNext : Bool
    }


init : () -> ( Model, Cmd Msg )
init _ =
    ( { sec2Comments = Dict.empty
      , fetchedCount = 0
      , maxCount = 0
      , remainingPages = 0
      , hasNext = False
      }
    , Cmd.batch
        [ Task.perform identity <| Task.succeed Cache ]
    )


timestampRegex : Regex
timestampRegex =
    Regex.fromString "(?:\\d{1,2}:)?\\d{1,2}:\\d{2}" |> Maybe.withDefault Regex.never



-- UPDATE


type Msg
    = NoOp
    | UpdateTime Int
    | Cache
    | NextPage
    | NextThreePages
    | ReceiveMessage D.Value


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        NoOp ->
            ( model, Cmd.none )

        UpdateTime seconds ->
            ( model, Tabs.updateTime seconds )

        Cache ->
            ( { model | remainingPages = 1 }, Tabs.sendCacheMessage )

        NextPage ->
            ( { model | remainingPages = 1 }, Tabs.sendNextPageMessage )

        NextThreePages ->
            ( { model | remainingPages = 3 }, Tabs.sendNextPageMessage )

        ReceiveMessage value ->
            Message.decode value
                |> Result.map (receiveMessage model)
                |> Result.withDefault ( model, Cmd.none )


receiveMessage : Model -> Incoming -> ( Model, Cmd Msg )
receiveMessage model incoming =
    case incoming of
        Message.Page sec2Comments fetchedCount ->
            ( { model
                | sec2Comments = sec2Comments
                , fetchedCount = fetchedCount
              }
            , Cmd.none
            )

        Message.Complete hasNext ->
            let
                nextPageCmd =
                    if model.remainingPages == 1 then
                        Cmd.none

                    else
                        Tabs.sendNextPageMessage

                remainingPages =
                    if not hasNext then
                        0

                    else
                        model.remainingPages - 1
            in
            ( { model | remainingPages = remainingPages, hasNext = hasNext }, nextPageCmd )

        Message.MaxCount count ->
            ( { model | maxCount = count }, Cmd.none )

        Message.IsReady ->
            ( { model | remainingPages = 1 }, Tabs.sendCacheMessage )



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.batch
        [ Tabs.sendMessageResponse ReceiveMessage ]



-- VIEW


view : Model -> Html Msg
view model =
    div
        []
        [ div
            [ class "header" ]
            [ navbar model
            , progress model
            ]
        , content model
        ]


navbar : Model -> Html Msg
navbar { fetchedCount, maxCount, remainingPages, hasNext } =
    let
        fetchNextButtonClass =
            if remainingPages == 0 && hasNext then
                class "navbar-item"

            else
                class "navbar-item disabled"
    in
    nav
        [ class "navbar" ]
        [ div
            [ class "navbar-menu is-active is-flex" ]
            [ div
                [ class "navbar-start flex-grow-1" ]
                [ div
                    [ class "navbar-item" ]
                    [ text <| String.fromInt fetchedCount ++ " / " ++ String.fromInt maxCount ]
                ]
            , div
                [ class "navbar-end" ]
                [ a
                    [ fetchNextButtonClass
                    , onClick NextPage
                    ]
                    [ span
                        [ class "icon"
                        ]
                        [ i
                            [ class "fas fa-angle-right fa-lg" ]
                            []
                        ]
                    ]
                , a
                    [ fetchNextButtonClass
                    , onClick NextThreePages
                    ]
                    [ span
                        [ class "icon"
                        ]
                        [ i
                            [ class "fas fa-angle-double-right fa-lg" ]
                            []
                        ]
                    ]
                ]
            ]
        ]


progress : Model -> Html Msg
progress { remainingPages } =
    if remainingPages == 0 then
        div [ class "progress-stopped" ] []

    else
        div
            []
            [ node
                "progress"
                [ class "progress is-info" ]
                []
            ]


content : Model -> Html Msg
content { sec2Comments } =
    div
        [ class "content" ]
        (Dict.toList sec2Comments
            |> List.map toCommentCards
        )


toCommentCards : ( Seconds, List String ) -> Html Msg
toCommentCards ( seconds, comments ) =
    div
        [ class "card" ]
        [ header
            [ class "card-header has-background-light" ]
            [ p
                [ class "card-header-title" ]
                [ toTimeLink seconds ]
            ]
        , div
            [ class "card-content" ]
            (comments
                |> List.map replaceTimeLink
                |> List.intersperse (div [ class "is-divider" ] [])
            )
        ]


replaceTimeLink : String -> Html Msg
replaceTimeLink comment =
    let
        sliceIndices =
            Regex.find timestampRegex comment
                |> List.map (\match -> [ match.index, match.index + String.length match.match ])
                |> List.concat
                |> (\indices -> indices ++ [ String.length comment ])

        sliceIndexPairs =
            List.map2 Tuple.pair (0 :: sliceIndices) sliceIndices

        toHtml str =
            if Regex.contains timestampRegex str then
                toTimeLink (timestampToSeconds str)

            else
                String.split "\n" str
                    |> List.map text
                    |> List.intersperse (br [] [])
                    |> span []
    in
    div
        []
        (sliceIndexPairs
            |> List.map (\( from, to ) -> String.slice from to comment)
            |> List.map toHtml
        )


toTimeLink : Seconds -> Html Msg
toTimeLink seconds =
    a [ onClick <| UpdateTime seconds ] [ text <| toTimeStr seconds ]


toTimeStr : Seconds -> String
toTimeStr seconds =
    if seconds >= 3600 then
        let
            hours =
                seconds
                    // 3600
                    |> String.fromInt

            minutes =
                seconds
                    |> modBy 3600
                    |> (\x -> x // 60)
                    |> String.fromInt
                    |> String.padLeft 2 '0'

            actualSecond =
                seconds
                    |> modBy 60
                    |> String.fromInt
                    |> String.padLeft 2 '0'
        in
        [ hours, minutes, actualSecond ]
            |> String.join ":"

    else
        let
            minutes =
                seconds
                    // 60
                    |> String.fromInt

            actualSecond =
                seconds
                    |> modBy 60
                    |> String.fromInt
                    |> String.padLeft 2 '0'
        in
        [ minutes, actualSecond ]
            |> String.join ":"


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



-- MAIN


main : Program () Model Msg
main =
    Browser.element
        { init = init
        , update = update
        , subscriptions = subscriptions
        , view = view
        }
