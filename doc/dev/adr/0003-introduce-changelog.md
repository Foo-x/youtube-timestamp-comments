# 3. CHANGELOGの導入

| Item     | Value      |
| -------- | ---------- |
| Date     | 2021-08-05 |
| Status   | 承認       |
| Deciders | Foo-x      |


## Context

変更履歴を標準的なフォーマットで管理する。


## Decision

[Keep a Changelog](https://keepachangelog.com/) を導入する。知名度が高いため。


## Consequences

### Positive

- 変更履歴を決められたフォーマットで管理できる。


### Negative

- コストが増える。
    - メリットのほうが大きい想定。


## Options

- [Conventional Changelog](https://github.com/conventional-changelog/conventional-changelog)
    - 自動化できるが、コミットメッセージに制約がある
