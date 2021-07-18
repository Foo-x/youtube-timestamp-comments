# 2. The Elm Architectureの採用

| Item | Value |
| --- | --- |
| Date | 2021-07-19 |
| Status | 承認 |
| Deciders | Foo-x |


## Context

TypeScriptに移行するにあたり、アーキテクチャを検討する。


## Decision

The Elm Architectureを採用する。なお、PageActionのView部分はReactを使用する。

`chrome.runtime.onMessage`でメッセージを受け取る箇所が1ヶ所なのでTEAの`update`と相性が良いため。


## Consequences

### Positive

- 状態と副作用が管理しやすい


### Negative

特になし。


## Options

- Clean Architecture
    - オーバースペック


## Links

- [The Elm Architecture](https://guide.elm-lang.jp/architecture/)
