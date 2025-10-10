# 🌐 Solana Wallet Weekly Reporter

[![GitHub Actions](https://github.com/shoya-sue/solana-weekly-report/workflows/Generate%20Weekly%20Solana%20Report%20with%20GitHub%20Pages/badge.svg)](https://github.com/shoya-sue/solana-weekly-report/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Solanaウォレットのトランザクション履歴を自動収集し、週次レポートとして可視化・保存するツール。GitHub Actionsで完全自動化され、GitHub Pagesで美しいダッシュボードを公開。

## 🎯 概要

**Solana Wallet Weekly Reporter**は、指定したSolanaウォレットのオンチェーン活動を定期的に記録・分析し、以下を実現します：

- 📊 **自動レポート生成** - 毎週土曜日に自動実行
- 📈 **ビジュアル分析** - トランザクション推移、SOLフロー、取引タイプをチャート化
- 🌐 **Web公開** - GitHub Pagesでダッシュボード自動公開
- 📝 **バージョン管理** - GitHubでトランザクション履歴を永続保存

## ✨ 主な機能

### 🔹 基本機能
| 機能 | 説明 |
|------|------|
| **マルチウォレット対応** | 複数ウォレットを同時監視 |
| **全トランザクション取得** | ページング対応で1000件以上も取得可能 |
| **トランザクション詳細解析** | SOL送金、トークン送受信、DEXスワップ、NFT取引等を自動判別 |
| **トークン名解決** | 30種類以上の主要トークンを自動認識（USDC, BONK, WIF等） |
| **チャート生成** | SVG形式で3種類のチャート自動生成 |
| **HTMLダッシュボード** | インタラクティブなWebレポート |

### 📊 生成されるチャート
- **Activity Chart** - 日次トランザクション数（成功/失敗）
- **Volume Flow Chart** - SOL入出金フロー推移
- **Transaction Types Pie** - 取引タイプの内訳

### 🎨 レポート形式
- Markdown形式（GitHub上で直接閲覧可能）
- HTML形式（GitHub Pagesで公開）
- SVGチャート（ベクター形式で高品質）

## 🚀 クイックスタート

### 1. リポジトリのフォーク/クローン

```bash
git clone https://github.com/shoya-sue/solana-weekly-report.git
cd solana-weekly-report
```

### 2. 依存関係のインストール

```bash
cd poc
npm install
```

### 3. 環境設定

`.env.example`を`.env`にコピーして編集：

```bash
cp .env.example .env
```

```env
# 監視するウォレットアドレス（カンマ区切り）
WALLET_ADDRESSES=address1,address2,address3

# オプション：カスタムRPCエンドポイント
SOLANA_RPC_ENDPOINT=https://api.mainnet-beta.solana.com

# レポート期間（0で全期間）
DAYS_TO_FETCH=7
```

### 4. ローカル実行

```bash
# 拡張版レポート生成（推奨）
npm run start:enhanced

# HTMLダッシュボード生成
npm run deploy

# 全て実行
npm run build
```

## ⚙️ GitHub設定

### 必須Secrets設定

**Settings → Secrets and variables → Actions**で設定：

| Secret名 | 説明 | 例 |
|----------|------|-----|
| `WALLET_ADDRESSES` | 監視するウォレットアドレス | `address1,address2` |
| `GIT_USER_NAME` | GitHubユーザー名 | `shoya-sue` |
| `GIT_USER_EMAIL` | GitHubメールアドレス | `your-email@example.com` |

### GitHub Pages設定

1. **Settings → Pages**
2. Source: **Deploy from a branch**
3. Branch: **main** / Folder: **/docs**
4. Save

設定後、以下のURLでアクセス可能：
```
https://[YOUR_USERNAME].github.io/solana-weekly-report/
```

## 📁 ディレクトリ構成

```
solana-weekly-report/
├── .github/
│   └── workflows/
│       ├── weekly-report.yml           # 基本版Actions
│       └── weekly-report-enhanced.yml  # 拡張版Actions（推奨）
├── poc/                                # メインコード
│   ├── index.js                       # 基本版スクリプト
│   ├── index-enhanced.js              # 拡張版スクリプト
│   ├── tokenList.js                   # トークンメタデータ
│   ├── chartGenerator.js              # チャート生成
│   ├── htmlGenerator.js               # HTML変換
│   ├── deployToPages.js               # Pagesデプロイ
│   └── reports/                       # 生成レポート
│       ├── *.md                       # Markdownレポート
│       └── charts/                    # SVGチャート
├── docs/                              # GitHub Pages公開用
│   ├── index.html                     # ダッシュボード
│   ├── *.html                         # HTMLレポート
│   └── charts/                        # チャートコピー
├── develop_docs/                      # 企画書
└── README.md                          # このファイル
```

## 🔄 自動実行スケジュール

- **毎週土曜日 00:00 UTC（日本時間 09:00 JST）**
- 手動実行も可能（Actions → Run workflow）

## 📊 出力サンプル

### Markdownレポート例

```markdown
# Solana Wallet Weekly Report (2025-W41)

Period: 2025-10-03 ~ 2025-10-10

## Summary
**Monitored Wallets**: 2
**Total Transactions**: 78

### Transaction Types
| Type | Count |
|------|-------|
| SOL Transfer | 45 |
| Token Transfer | 20 |
| DEX Swap | 13 |
```

### ダッシュボード
- 複数レポートを一覧表示
- 各レポートの統計情報
- ワンクリックでレポート詳細へ

## 🛠️ カスタマイズ

### 監視頻度の変更

`.github/workflows/weekly-report-enhanced.yml`を編集：

```yaml
schedule:
  - cron: '0 0 * * 6'  # 毎週土曜日
  # - cron: '0 0 * * *'  # 毎日
  # - cron: '0 0 1 * *'  # 毎月1日
```

### トークンの追加

`poc/tokenList.js`に新しいトークンを追加：

```javascript
'TOKEN_MINT_ADDRESS': {
  symbol: 'SYMBOL',
  name: 'Token Name',
  decimals: 9
}
```

## 🔍 トラブルシューティング

### Actionsが失敗する場合
- Secretsが正しく設定されているか確認
- ウォレットアドレスが有効か確認
- RPCエンドポイントが応答しているか確認

### GitHub Pagesが表示されない
- Pages設定で`/docs`フォルダが選択されているか確認
- デプロイに数分かかる場合がある

## 📈 今後の拡張予定

- [ ] リアルタイムモニタリング
- [ ] Slack/Discord通知連携
- [ ] トークン価格情報の取得
- [ ] 複数チェーン対応
- [ ] カスタムアラート機能

## 🤝 コントリビューション

プルリクエストやIssueは大歓迎です！
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 ライセンス

MIT License - 詳細は[LICENSE](LICENSE)を参照

## 🙏 謝辞

- [Solana Web3.js](https://github.com/solana-labs/solana-web3.js)
- [GitHub Actions](https://github.com/features/actions)
- [GitHub Pages](https://pages.github.com/)

## 📞 サポート

問題が発生した場合：
- [Issues](https://github.com/shoya-sue/solana-weekly-report/issues)でバグ報告
- [Discussions](https://github.com/shoya-sue/solana-weekly-report/discussions)で質問・提案

---

<div align="center">

**Built with ❤️ for the Solana Community**

[Demo](https://shoya-sue.github.io/solana-weekly-report/) | [Documentation](./SETUP_GUIDE.md) | [Report Issue](https://github.com/shoya-sue/solana-weekly-report/issues)

</div>