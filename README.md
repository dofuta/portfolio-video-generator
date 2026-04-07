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

```bash
npm run render -- <projectName> --target mobile
# or
npm run render -- <projectName> --target desktop
```

出力:

- `works/<projectName>/outputs/mobile/*_mobile.mp4`（9:16）
- `works/<projectName>/outputs/desktop/*_desktop.mp4`（16:9）

## パラメータ管理

設定値は `src/config/` に集約されています。

- `presets.js`: CLI選択肢とデフォルト値
- `schema.js`: config生成の基本形
- `validate.js`: config/入力値バリデーション
- `ffmpegProfiles.js`: 画質プロファイルと出力キャンバス定義
