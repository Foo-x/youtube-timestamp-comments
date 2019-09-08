module Api.YouTube exposing (PageValue, fetchComments, fetchPage)

import Api.Common as CommonApi
import Common.Error as Error exposing (Error)
import HttpBuilder.Task as HB
import Json.Decode as D
import JsonModel.CommentsResponse.Common exposing (Continuation, Itct)
import JsonModel.YouTubeConfig exposing (YouTubeConfig)
import Task exposing (Task)
import Url.Builder as UB



-- COMMENTS


fetchComments : Continuation -> Itct -> YouTubeConfig -> Task Error D.Value
fetchComments continuation itct ytConfig =
    UB.crossOrigin
        "https://www.youtube.com"
        [ "comment_service_ajax" ]
        [ UB.string "ctoken" continuation, UB.string "continuation" continuation, UB.string "itct" itct, UB.int "action_get_comments" 1, UB.int "pbj" 1 ]
        |> HB.post
        |> HB.withHeaders
            [ ( "x-youtube-identity-token", ytConfig.idToken )
            , ( "x-youtube-client-version", ytConfig.innertubeContextClientVersion )
            , ( "x-youtube-page-label", ytConfig.pageBuildLabel )
            , ( "x-youtube-page-cl", String.fromInt ytConfig.pageCl )
            , ( "x-youtube-variants-checksum", ytConfig.variantsChecksum )
            , ( "x-youtube-client-name", "1" )
            , ( "x-youtube-utc-offset", "540" )
            ]
        |> HB.withMultipartStringBody
            [ ( "session_token", ytConfig.xsrfToken ) ]
        |> HB.withResolver (CommonApi.jsonResolver D.value)
        |> HB.toTask
        |> Task.mapError Error.httpError



-- PAGE


type alias PageValue =
    D.Value


fetchPage : YouTubeConfig -> Task Error PageValue
fetchPage ytConfig =
    UB.crossOrigin
        "https://www.youtube.com"
        [ "watch" ]
        [ UB.string "v" ytConfig.videoId, UB.int "pbj" 1 ]
        |> HB.get
        |> HB.withHeaders
            [ ( "x-youtube-identity-token", ytConfig.idToken )
            , ( "x-youtube-client-version", ytConfig.innertubeContextClientVersion )
            , ( "x-youtube-page-label", ytConfig.pageBuildLabel )
            , ( "x-youtube-page-cl", String.fromInt ytConfig.pageCl )
            , ( "x-youtube-variants-checksum", ytConfig.variantsChecksum )
            , ( "x-youtube-client-name", "1" )
            , ( "x-youtube-utc-offset", "540" )
            ]
        |> HB.withMultipartStringBody
            [ ( "session_token", ytConfig.xsrfToken ) ]
        |> HB.withResolver (CommonApi.jsonResolver D.value)
        |> HB.toTask
        |> Task.mapError Error.httpError
