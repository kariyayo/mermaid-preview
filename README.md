# Mermaid Preview

ターミナルから起動してブラウザでMermaid記法をリアルタイムプレビューできる軽量ツール。
Bun ランタイム + 外部 npm パッケージなしで構築。

## ファイル構成

| ファイル | 役割 |
|---|---|
| `package.json` | プロジェクト設定 + bin エントリ |
| `tsconfig.json` | TypeScript 設定 |
| `src/cli.ts` | CLI エントリポイント（引数解析・stdin対応・サーバー起動・ブラウザ自動起動） |
| `src/server.ts` | Bun.serve() による HTTPサーバー（静的ファイル配信 + API） |
| `src/public/index.html` | 左右 split view のメインページ |
| `src/public/app.js` | mermaid.js 連携・リアルタイム描画・ダークモード対応 |
| `src/public/style.css` | CSS Grid レイアウト・レスポンシブ対応 |
| `src/public/manifest.json` | PWA マニフェスト |
| `src/public/sw.js` | Service Worker（CDNキャッシュ・オフライン対応） |

## 使い方

```bash
# ファイル指定で起動
bun run src/cli.ts test.md

# stdin で渡す
cat test.md | bun run src/cli.ts

# 空エディタで起動
bun run src/cli.ts

# ブラウザ読み込み後にプロセスを自動終了（ポートを占有しない）
bun run src/cli.ts --once test.md

# グローバルインストール
bun link
mermaid-preview diagram.md
```

## 主な機能

- **リアルタイムプレビュー**: 入力 300ms 後に自動描画（debounce）
- **Mermaid記法自動抽出**: `` ```mermaid `` フェンスブロックにも、生のMermaid記法にも対応
- **ダークモード**: OS設定に自動追従
- **ドラッグリサイズ**: エディタとプレビューの境界をドラッグで調整可能
- **レスポンシブ**: 狭い画面では上下分割に自動切替
- **PWA**: ブラウザからデスクトップアプリとしてインストール可能
- **外部依存なし**: Bun 組み込み機能のみ使用（mermaid.js は CDN から読み込み）
