module JsonModel.YouTubeConfig exposing (YouTubeConfig, decode)

import Common.Error as Error exposing (Error)
import Json.Decode as D exposing (Decoder, Value)
import Json.Decode.Pipeline as DP


type alias YouTubeConfig =
    { videoId : VideoId
    , idToken : String
    , innertubeContextClientVersion : String
    , pageBuildLabel : String
    , pageCl : Int
    , xsrfToken : String
    }


type alias VideoId =
    String


decode : Value -> Result Error YouTubeConfig
decode value =
    D.decodeValue decoder value
        |> Result.mapError Error.decodeError


decoder : Decoder YouTubeConfig
decoder =
    D.succeed YouTubeConfig
        |> DP.required "videoId" D.string
        |> DP.required "ID_TOKEN" D.string
        |> DP.required "INNERTUBE_CONTEXT_CLIENT_VERSION" D.string
        |> DP.required "PAGE_BUILD_LABEL" D.string
        |> DP.required "PAGE_CL" D.int
        |> DP.required "XSRF_TOKEN" D.string
