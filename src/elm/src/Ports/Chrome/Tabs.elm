port module Ports.Chrome.Tabs exposing (sendCacheMessage, sendMessageResponse, sendNextPageMessage, updateTime)

import Json.Encode as E exposing (Value)


type SendMessageType
    = NextPage
    | Cache


sendNextPageMessage : Cmd msg
sendNextPageMessage =
    sendMessage <| toSendMessageValue NextPage


sendCacheMessage : Cmd msg
sendCacheMessage =
    sendMessage <| toSendMessageValue Cache


toSendMessageValue : SendMessageType -> Value
toSendMessageValue sendMessageType =
    case sendMessageType of
        NextPage ->
            E.object [ ( "type", E.string "next-page" ) ]

        Cache ->
            E.object [ ( "type", E.string "cache" ) ]



-- Subscriptions (from JS)


port sendMessageResponse : (Value -> msg) -> Sub msg



-- Commands (to JS)


port sendMessage : Value -> Cmd msg


port updateTime : Int -> Cmd msg
