# portfolio-video-generator

Webサイトのスクリーン録画 `.mov` を、背景色キャンバス上に中央配置し、`mobile` と `desktop` の2種類の `.mp4` を生成するCLIツールです。

## セットアップ

```bash
npm install
```

## 1. work作成

```bash
npm run init:work
```

対話式で以下を設定します。

- プロジェクト名
- 画質（`HIGH` / `MEDIUM` / `LOW`、デフォルト `HIGH`）
- 出力解像度（`1080p` / `720p` / `480p`、デフォルト `1080p`）
- 背景色（プリセットまたは `#RRGGBB` カスタム）
- 占有率（`mobile` と `desktop` を別々に 0〜1 で指定、例: `0.9` / `0.8`）

生成される構成:

```text
works/<projectName>/
  config.json
  inputs/
  outputs/
    mobile/
    desktop/
```

## 2. 入力動画配置

`.mov` ファイルを `works/<projectName>/inputs/` に入れてください（複数可）。
画角は `render` 実行時に各ファイルを自動解析して処理されます。

## 3. レンダリング

`mobile` か `desktop` のどちらか一方を必ず指定します（`-t` または `--target`）。

### 推奨（`--` のあとにプロジェクト名とオプションを渡す）

```bash
npm run render -- <projectName> -t mobile
npm run render -- <projectName> -t desktop
```

長いオプション名でも同じです。

```bash
npm run render -- <projectName> --target mobile
npm run render -- <projectName> --target desktop
```

### 省略形（`-t` を先に書く）

`npm run` は `--` なしだと `-t` を npm 側で解釈するため、**`-t` とターゲットを先に書き、最後にプロジェクト名**とすると、そのまま `render mobile <projectName>` の形で CLI に渡ります（CLI が解釈します）。

```bash
npm run render -t mobile <projectName>
npm run render -t desktop <projectName>
```

### 直接 node で実行する場合

```bash
node ./src/index.js render <projectName> -t mobile
node ./src/index.js render mobile <projectName>
```

2 行目は「先頭が `mobile` / `desktop` で、かつ `-t` を付けない」書き方です（互換用）。

出力先は `--target` に応じて片方だけです。

- `mobile`: `works/<projectName>/outputs/mobile/*_mobile.mp4`（9:16）
- `desktop`: `works/<projectName>/outputs/desktop/*_desktop.mp4`（16:9）

レンダリング中に `Ctrl + C` を押すと、実行中の ffmpeg プロセスを止めて終了します。

## パラメータ管理

設定値は `src/config/` に集約されています。

- `presets.js`: CLI選択肢とデフォルト値
- `schema.js`: config生成の基本形
- `validate.js`: config/入力値バリデーション
- `ffmpegProfiles.js`: 画質プロファイルと出力キャンバス定義
