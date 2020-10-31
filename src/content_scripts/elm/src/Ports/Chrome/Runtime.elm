port module Ports.Chrome.Runtime exposing (HasNext, onMessage, sendComplete, sendIsReady, sendMaxCount, sendPage, sendViewProps)

import Json.Encode as E exposing (Value)
import JsonModel.CommentsResponse.Common exposing (MaxCount)
import JsonModel.Message as M
import JsonModel.Second2Comments as S2C exposing (Second2Comments)


type Outgoing
    = Page Second2Comments MaxCount
    | Complete HasNext
    | MaxCount MaxCount
    | IsReady
    | ViewProps M.ViewProps


type alias HasNext =
    Bool


sendPage : Second2Comments -> MaxCount -> Cmd msg
sendPage s2c fetchedCount =
    Page s2c fetchedCount
        |> encode
        |> sendResponse


sendComplete : HasNext -> Cmd msg
sendComplete hasNext =
    Complete hasNext
        |> encode
        |> sendResponse


sendMaxCount : MaxCount -> Cmd msg
sendMaxCount count =
    MaxCount count
        |> encode
        |> sendResponse


sendIsReady : Cmd msg
sendIsReady =
    IsReady
        |> encode
        |> sendResponse


sendViewProps : M.ViewProps -> Cmd msg
sendViewProps viewProps =
    ViewProps viewProps
        |> encode
        |> sendResponse


encode : Outgoing -> Value
encode outgoing =
    case outgoing of
        Page s2c fetchedCount ->
            E.object
                [ ( "type", E.string "page" )
                , ( "data"
                  , E.object
                        [ ( "page", S2C.encode s2c )
                        , ( "fetchedCount", E.int fetchedCount )
                        ]
                  )
                ]

        Complete hasNext ->
            E.object
                [ ( "type", E.string "complete" )
                , ( "data"
                  , E.object
                        [ ( "hasNext", E.bool hasNext )
                        ]
                  )
                ]

        MaxCount count ->
            E.object
                [ ( "type", E.string "max-count" )
                , ( "data", E.int count )
                ]

        IsReady ->
            E.object
                [ ( "type", E.string "is-ready" ) ]

        ViewProps viewProps ->
            E.object
                [ ( "type", E.string "view-props" )
                , ( "data"
                  , E.object
                        [ ( "scroll", E.float viewProps.scroll )
                        , ( "sideMenuScroll", E.float viewProps.sideMenuScroll )
                        , ( "selectedSeconds", E.string viewProps.selectedSeconds )
                        ]
                  )
                ]



-- Subscriptions (from JS)


port onMessage : (Value -> msg) -> Sub msg



-- Commands (to JS)


port sendResponse : Value -> Cmd msg
