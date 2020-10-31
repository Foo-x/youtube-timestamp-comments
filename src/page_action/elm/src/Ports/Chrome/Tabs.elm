port module Ports.Chrome.Tabs exposing (sendCacheMessage, sendMessageResponse, sendNextPageMessage, sendSaveViewPropsMessage, updateTime)

import Json.Encode as E exposing (Value)
import JsonModel.Message exposing (ViewPropsValue)


type SendMessageType
    = NextPage
    | Cache ViewPropsValue
    | SaveViewProps ViewPropsValue


sendNextPageMessage : Cmd msg
sendNextPageMessage =
    sendMessage <| toSendMessageValue NextPage


sendCacheMessage : ViewPropsValue -> Cmd msg
sendCacheMessage viewPropsValue =
    sendMessage <| toSendMessageValue (Cache viewPropsValue)


sendSaveViewPropsMessage : ViewPropsValue -> Cmd msg
sendSaveViewPropsMessage viewPropsValue =
    sendMessage <| toSendMessageValue (SaveViewProps viewPropsValue)


toSendMessageValue : SendMessageType -> Value
toSendMessageValue sendMessageType =
    case sendMessageType of
        NextPage ->
            E.object [ ( "type", E.string "next-page" ) ]

        Cache viewPropsValue ->
            E.object
                [ ( "type", E.string "cache" )
                , ( "data"
                  , E.object
                        [ ( "scroll", E.float viewPropsValue.scroll )
                        , ( "sideMenuScroll", E.float viewPropsValue.sideMenuScroll )
                        , ( "selectedSeconds", E.string viewPropsValue.selectedSeconds )
                        ]
                  )
                ]

        SaveViewProps viewPropsValue ->
            E.object
                [ ( "type", E.string "save-view-props" )
                , ( "data"
                  , E.object
                        [ ( "scroll", E.float viewPropsValue.scroll )
                        , ( "sideMenuScroll", E.float viewPropsValue.sideMenuScroll )
                        , ( "selectedSeconds", E.string viewPropsValue.selectedSeconds )
                        ]
                  )
                ]



-- Subscriptions (from JS)


port sendMessageResponse : (Value -> msg) -> Sub msg



-- Commands (to JS)


port sendMessage : Value -> Cmd msg


port updateTime : Int -> Cmd msg
