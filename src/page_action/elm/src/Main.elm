module Main exposing (main)

import Browser
import Dict
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Json.Decode as D
import JsonModel.Message as Message exposing (Incoming)
import JsonModel.Second2Comments as S2C exposing (Hours, Minutes, Second2Comments, Seconds)
import Ports.Browser.Events as BE
import Ports.Chrome.Tabs as Tabs
import Regex exposing (Regex)
import Task



-- MODEL


type alias Model =
    { sec2Comments : Second2Comments
    , fetchedCount : Int
    , maxCount : Int
    , selectedSeconds : SelectedSeconds
    , remainingPages : Int
    , hasNext : Bool
    }


type SelectedSeconds
    = All
    | Unit Int


init : () -> ( Model, Cmd Msg )
init _ =
    ( { sec2Comments = Dict.empty
      , fetchedCount = 0
      , maxCount = 0
      , selectedSeconds = All
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
    | ChangeSelectedSeconds SelectedSeconds
    | SaveScroll Float


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

        ChangeSelectedSeconds selectedSeconds ->
            ( { model | selectedSeconds = selectedSeconds }, Cmd.none )

        SaveScroll scrollValue ->
            ( model, Tabs.sendSaveScrollMessage scrollValue )


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

        Message.Scroll scrollValue ->
            ( model, BE.scroll scrollValue )



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.batch
        [ Tabs.sendMessageResponse ReceiveMessage, BE.onScroll SaveScroll ]



-- VIEW


view : Model -> Html Msg
view model =
    let
        pageActionClass =
            if Dict.size model.sec2Comments /= 0 then
                "page-action-with-comments"

            else
                "page-action-without-comments"
    in
    div
        [ class pageActionClass ]
        [ div
            [ class "header" ]
            [ navbar model
            , progress model
            ]
        , div
            [ class "columns is-mobile is-gapless content-container" ]
            [ sideMenu model
            , content model
            ]
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


sideMenu : Model -> Html Msg
sideMenu { sec2Comments, selectedSeconds } =
    let
        menuList =
            if Dict.size sec2Comments == 0 then
                []

            else
                allElement selectedSeconds
                    :: (Dict.keys sec2Comments
                            |> List.map (secondsElement selectedSeconds)
                       )
    in
    aside
        [ class "menu column is-4" ]
        [ ul
            [ class "menu-list side-menu-list" ]
            menuList
        ]


allElement : SelectedSeconds -> Html Msg
allElement selectedSeconds =
    let
        isActiveStr =
            case selectedSeconds of
                All ->
                    "is-active"

                Unit _ ->
                    ""
    in
    li
        []
        [ a
            [ class isActiveStr
            , onClick <| ChangeSelectedSeconds All
            ]
            [ text "ALL" ]
        ]


secondsElement : SelectedSeconds -> Seconds -> Html Msg
secondsElement selectedSeconds seconds =
    let
        isActiveStr =
            case selectedSeconds of
                All ->
                    ""

                Unit actualSeconds ->
                    if actualSeconds == seconds then
                        "is-active"

                    else
                        ""
    in
    li
        []
        [ a
            [ class isActiveStr
            , onClick <| ChangeSelectedSeconds (Unit seconds)
            ]
            [ text <| toTimeStr seconds ]
        ]


content : Model -> Html Msg
content { sec2Comments, selectedSeconds } =
    let
        cards =
            case selectedSeconds of
                All ->
                    S2C.uniqueComments sec2Comments
                        |> Dict.toList
                        |> List.map toCommentCards

                Unit seconds ->
                    [ ( seconds
                      , Dict.get seconds sec2Comments |> Maybe.withDefault []
                      )
                    ]
                        |> List.map toCommentCards
    in
    div
        [ class "column" ]
        cards


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
