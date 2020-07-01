port module Ports.Chrome.Tabs exposing (sendCacheMessage, sendMessageResponse, sendNextPageMessage, sendSaveScrollMessage, updateTime)

import Json.Encode as E exposing (Value)


type SendMessageType
    = NextPage
    | Cache
    | SaveScroll Float


sendNextPageMessage : Cmd msg
sendNextPageMessage =
    sendMessage <| toSendMessageValue NextPage


sendCacheMessage : Cmd msg
sendCacheMessage =
    sendMessage <| toSendMessageValue Cache


sendSaveScrollMessage : Float -> Cmd msg
sendSaveScrollMessage scroll =
    sendMessage <| toSendMessageValue (SaveScroll scroll)


toSendMessageValue : SendMessageType -> Value
toSendMessageValue sendMessageType =
    case sendMessageType of
        NextPage ->
            E.object [ ( "type", E.string "next-page" ) ]

        Cache ->
            E.object [ ( "type", E.string "cache" ) ]

        SaveScroll scroll ->
            E.object
                [ ( "type", E.string "save-scroll" )
                , ( "data", E.float scroll )
                ]



-- Subscriptions (from JS)


port sendMessageResponse : (Value -> msg) -> Sub msg



-- Commands (to JS)


port sendMessage : Value -> Cmd msg


port updateTime : Int -> Cmd msg
