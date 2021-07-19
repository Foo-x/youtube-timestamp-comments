# 1. chrome.storageに保存

| Item | Value |
| --- | --- |
| Date | 2021-07-19 |
| Status | 承認 |
| Deciders | Foo-x |


## Context

APIキーを毎回ユーザに入力させるのはUXが良くない。1度設定したらどこかに保存して使いまわすようにしたい。


## Decision

chrome.storageで保存する。


## Consequences

### Positive

- 毎回入力しないで済む
- ブラウザを再起動しても保持されている
- 別の端末と同期できる


### Negative

- サプライチェーン攻撃を受けたり、PCを別の人が使ったりするとAPIキーが漏れるリスクがある
    - 最悪の場合でもAPIを上限まで使われる被害しか起きないので許容する
    - そもそもサプライチェーン攻撃の場合は保存しなくても漏れる可能性がある
    - APIキーを取得する手順を作成する際にreferrerや使用範囲の設定を記載することで、漏れたときのリスクを低くする


## Options

- chrome.identityによるOAuth
    - Positive
        - 1度OAuthの設定をすればクリックするだけでトークンが取得できるのでAPIキーのコピペよりは楽
            - OAuthの設定は認証前のデータなので、chrome.storageに保存しても問題ない
        - ストレージに保存しないので攻撃を受けてもトークンが漏れにくい
        - トークンが漏れたとしても有効期限があるので、期限までの被害しか発生しない
    - Negative
        - ブラウザの再起動で再ログインが必要になる
            - トークンは認証後のデータなので、chrome.storageに保存するとAPIキーと同じ問題が起きる
        - OAuthを設定する手順がAPIキーより複雑なので、ユーザが正しく設定できない可能性が高くなる
        - 実装が複雑になる


## Links

- chrome.storageのリファレンス
    - https://developer.chrome.com/docs/extensions/reference/storage/
- chrome.identityのリファレンス
    - https://developer.chrome.com/docs/extensions/reference/identity/
- Issueで検討した際のメモ
    - https://github.com/Foo-x/youtube-timestamp-comments/issues/28#issuecomment-881927418
