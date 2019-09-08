module Main exposing (main)

import Api.YouTube as YouTubeApi exposing (PageValue)
import Common.Error exposing (Error)
import Dict
import Json.Decode as D
import JsonModel.CommentsResponse.Comments as CommentsJson exposing (Comments)
import JsonModel.CommentsResponse.Common exposing (Continuation, FetchedCount, Itct, MaxCount)
import JsonModel.CommentsResponse.Page as PageJson
import JsonModel.CommentsResponse.Replies as RepliesJson exposing (Replies)
import JsonModel.Message as Message exposing (Incoming)
import JsonModel.Second2Comments as S2C exposing (Second2Comments)
import JsonModel.YouTubeConfig as YouTubeConfig exposing (YouTubeConfig)
import Maybe.Extra as MaybeEx
import Ports.Chrome.Runtime as Runtime exposing (HasNext)
import Ports.YouTube as YouTube
import Task



-- MODEL


type Model
    = Initial
    | YtConfigLoaded YouTubeConfig
    | FirstContinuationLoaded YouTubeConfig Continuation Itct
    | PageLoaded Continuation LoadedModel
    | LastPageLoaded LoadedModel


type alias LoadedModel =
    { second2Comments : Second2Comments
    , fetchedCount : FetchedCount
    , maxCount : MaxCount
    , ytConfig : YouTubeConfig
    , itct : Itct
    , remainingReplyCounts : Int
    }


init : () -> ( Model, Cmd Msg )
init _ =
    ( Initial, Cmd.none )



-- UPDATE


type Msg
    = OnMessage D.Value
    | SendFirstPage (Result Error Comments)
    | SendNextPage (Result Error Comments)
    | SendReplies (Result Error Replies)
    | SetUpYouTubeConfig D.Value
    | SetUpContinuation (Result Error PageValue)


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case ( msg, model ) of
        ( OnMessage incoming, _ ) ->
            Message.decode incoming
                |> Result.map (handleMessage model)
                |> Result.withDefault ( model, Cmd.none )

        ( SendFirstPage result, FirstContinuationLoaded ytConfig _ itct ) ->
            let
                maxCount =
                    result
                        |> Result.andThen CommentsJson.decodeMaxCount
                        |> Result.withDefault 0

                maxCountCmd =
                    Runtime.sendMaxCount maxCount
            in
            sendPage result (LoadedModel Dict.empty 0 maxCount ytConfig itct 0)
                |> addCmd maxCountCmd

        ( SendNextPage result, PageLoaded _ props ) ->
            sendPage result props

        ( SendReplies result, PageLoaded nextContinuation props ) ->
            sendReplies result props True
                |> (\( loadedModel, cmd ) -> ( PageLoaded nextContinuation loadedModel, cmd ))

        ( SendReplies result, LastPageLoaded props ) ->
            sendReplies result props False
                |> (\( loadedModel, cmd ) -> ( LastPageLoaded loadedModel, cmd ))

        ( SetUpYouTubeConfig ytConfig, _ ) ->
            YouTubeConfig.decode ytConfig
                |> Result.map (\config -> ( YtConfigLoaded config, loadFirstContinuation config ))
                |> Result.withDefault ( Initial, Cmd.none )

        ( SetUpContinuation result, YtConfigLoaded ytConfig ) ->
            let
                maybeContinuation =
                    result
                        |> Result.andThen PageJson.decodeContinuation
                        |> Result.toMaybe

                maybeItct =
                    result
                        |> Result.andThen PageJson.decodeItct
                        |> Result.toMaybe
            in
            case ( maybeContinuation, maybeItct ) of
                ( Just continuation, Just itct ) ->
                    ( FirstContinuationLoaded ytConfig continuation itct, Runtime.sendIsReady )

                _ ->
                    ( model, Cmd.none )

        _ ->
            ( model, Cmd.none )


handleMessage : Model -> Incoming -> ( Model, Cmd Msg )
handleMessage model incoming =
    case ( incoming, model ) of
        ( Message.Initialize, _ ) ->
            ( Initial, Cmd.none )

        ( Message.Cache, FirstContinuationLoaded ytConfig continuation itct ) ->
            YouTubeApi.fetchComments continuation itct ytConfig
                |> Task.attempt SendFirstPage
                |> Tuple.pair model

        ( Message.Cache, PageLoaded _ props ) ->
            let
                cmds =
                    [ Runtime.sendMaxCount props.maxCount
                    , Runtime.sendPage props.second2Comments props.fetchedCount
                    , Runtime.sendComplete True
                    ]
            in
            ( model, Cmd.batch cmds )

        ( Message.Cache, LastPageLoaded props ) ->
            let
                cmds =
                    [ Runtime.sendMaxCount props.maxCount
                    , Runtime.sendPage props.second2Comments props.fetchedCount
                    , Runtime.sendComplete False
                    ]
            in
            ( model, Cmd.batch cmds )

        ( Message.NextPage, PageLoaded nextContinuation { ytConfig, itct } ) ->
            YouTubeApi.fetchComments nextContinuation itct ytConfig
                |> Task.attempt SendNextPage
                |> Tuple.pair model

        _ ->
            ( model, Cmd.none )


sendPage : Result Error Comments -> LoadedModel -> ( Model, Cmd Msg )
sendPage result { second2Comments, maxCount, fetchedCount, ytConfig, itct } =
    let
        textsResult =
            result
                |> Result.andThen CommentsJson.decodeCommentTexts

        s2c =
            textsResult
                |> Result.map S2C.createSecond2Comments
                |> Result.withDefault Dict.empty
                |> S2C.mergeSecond2Comments second2Comments

        newFetchedCount =
            textsResult
                |> Result.map List.length
                |> Result.withDefault 0
                |> (+) fetchedCount

        pageCmd =
            Runtime.sendPage s2c newFetchedCount

        nextContinuation =
            result
                |> Result.andThen CommentsJson.decodeNextContinuation
                |> Result.withDefault Nothing

        replyContinuations =
            result
                |> Result.andThen CommentsJson.decodeReplyContinuations
                |> Result.withDefault []

        remainingReplyCounts =
            List.length replyContinuations

        sendReplyCmds =
            if not (List.isEmpty replyContinuations) then
                replyContinuations
                    |> List.map (\c -> YouTubeApi.fetchComments c itct ytConfig)
                    |> List.map (Task.attempt SendReplies)

            else
                Runtime.sendComplete (MaybeEx.isJust nextContinuation)
                    |> List.singleton

        loadedModel =
            { second2Comments = s2c
            , fetchedCount = newFetchedCount
            , maxCount = maxCount
            , remainingReplyCounts = remainingReplyCounts
            , ytConfig = ytConfig
            , itct = itct
            }

        nextModel =
            case nextContinuation of
                Just continuation ->
                    PageLoaded continuation loadedModel

                Nothing ->
                    LastPageLoaded loadedModel
    in
    ( nextModel
    , Cmd.batch <| [ pageCmd ] ++ sendReplyCmds
    )


sendReplies : Result Error Replies -> LoadedModel -> HasNext -> ( LoadedModel, Cmd Msg )
sendReplies result model hasNext =
    let
        textsResult =
            result
                |> Result.andThen RepliesJson.decodeReplyTexts

        s2c =
            textsResult
                |> Result.map S2C.createSecond2Comments
                |> Result.withDefault Dict.empty
                |> S2C.mergeSecond2Comments model.second2Comments

        fetchedCount =
            textsResult
                |> Result.map List.length
                |> Result.withDefault 0
                |> (+) model.fetchedCount

        pageCmd =
            Runtime.sendPage s2c fetchedCount

        nextReplyContinuation =
            result
                |> Result.andThen RepliesJson.decodeNextReplyContinuation
                |> Result.withDefault Nothing

        createLoadedModel remainingReplyCounts =
            { second2Comments = s2c
            , fetchedCount = fetchedCount
            , maxCount = model.maxCount
            , ytConfig = model.ytConfig
            , remainingReplyCounts = remainingReplyCounts
            , itct = model.itct
            }
    in
    case nextReplyContinuation of
        Just replyContinuation ->
            let
                nextRepliesCmd =
                    YouTubeApi.fetchComments replyContinuation model.itct model.ytConfig
                        |> Task.attempt SendReplies
            in
            ( createLoadedModel model.remainingReplyCounts
            , Cmd.batch [ pageCmd, nextRepliesCmd ]
            )

        Nothing ->
            let
                completeCmd =
                    if model.remainingReplyCounts - 1 == 0 then
                        Runtime.sendComplete hasNext

                    else
                        Cmd.none
            in
            ( createLoadedModel (model.remainingReplyCounts - 1)
            , Cmd.batch [ pageCmd, completeCmd ]
            )


loadFirstContinuation : YouTubeConfig -> Cmd Msg
loadFirstContinuation ytConfig =
    YouTubeApi.fetchPage ytConfig
        |> Task.attempt SetUpContinuation


addCmd : Cmd Msg -> ( Model, Cmd Msg ) -> ( Model, Cmd Msg )
addCmd cmd ( prevModel, prevCmd ) =
    ( prevModel, Cmd.batch [ prevCmd, cmd ] )



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.batch
        [ Runtime.onMessage OnMessage
        , YouTube.setUpYouTubeConfig SetUpYouTubeConfig
        ]



-- MAIN


main : Program () Model Msg
main =
    Platform.worker
        { init = init
        , update = update
        , subscriptions = subscriptions
        }
