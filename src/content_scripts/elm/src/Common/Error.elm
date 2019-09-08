module Common.Error exposing (Error(..), decodeError, httpError)

import Http
import Json.Decode as D


type Error
    = HttpErr Http.Error
    | DecodeErr D.Error


httpError : Http.Error -> Error
httpError err =
    HttpErr err


decodeError : D.Error -> Error
decodeError err =
    DecodeErr err
