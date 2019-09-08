port module Ports.YouTube exposing (setUpYouTubeConfig)

import Json.Decode exposing (Value)



-- Subscriptions (from JS)


port setUpYouTubeConfig : (Value -> msg) -> Sub msg
