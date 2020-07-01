port module Ports.Browser.Events exposing (onScroll, scroll)

-- Subscriptions (from JS)


port onScroll : (Float -> msg) -> Sub msg



-- Commands (to JS)


port scroll : Float -> Cmd msg
