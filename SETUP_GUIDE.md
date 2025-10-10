# Solana Wallet Weekly Report - Setup Guide

## GitHub Secrets設定

GitHubリポジトリの **Settings → Secrets and variables → Actions** で以下のSecretsを設定してください。

### 必須設定

| Secret名 | 説明 | 例 |
|----------|------|-----|
| `WALLET_ADDRESSES` | 監視するSolanaウォレットアドレス（カンマ区切り） | `address1,address2,address3` |
| `GIT_USER_NAME` | GitHubのユーザー名 | `shoya-sue` |
| `GIT_USER_EMAIL` | GitHubに登録しているメールアドレス | `your-email@example.com` |

### オプション設定

| Secret名 | 説明 | デフォルト |
|----------|------|------------|
| `SOLANA_RPC_ENDPOINT` | カスタムRPCエンドポイント | `https://api.mainnet-beta.solana.com` |

## 設定手順

### 1. GitHub Secretsの設定

1. GitHubリポジトリを開く
2. **Settings** タブをクリック
3. 左メニューの **Secrets and variables** → **Actions** を選択
4. **New repository secret** ボタンをクリック
5. 以下の情報を入力：
   - **Name**: `WALLET_ADDRESSES`
   - **Value**: 監視したいウォレットアドレス（カンマ区切り）
6. **Add secret** をクリック
7. 同様に `GIT_USER_NAME` と `GIT_USER_EMAIL` も追加

### 2. GitHub Actionsの権限設定

1. **Settings** → **Actions** → **General**
2. **Workflow permissions** セクションで **Read and write permissions** を選択
3. **Save** をクリック

### 3. GitHub Pagesの設定

1. **Settings** → **Pages**
2. **Source** で **Deploy from a branch** を選択
3. **Branch** で **main** を選択
4. **Folder** で **/docs** を選択
5. **Save** をクリック

## 動作確認

### 手動実行
1. **Actions** タブを開く
2. 左メニューから実行したいワークフローを選択：
   - `Generate Weekly Solana Report` - 基本版
   - `Generate Weekly Solana Report with GitHub Pages` - 拡張版（推奨）
3. **Run workflow** ボタンをクリック
4. **Run workflow** を再度クリックして実行

### 自動実行
- 毎週土曜日 00:00 UTC に自動実行されます
- 日本時間では土曜日 09:00 JST

## 生成されるファイル

```
solana-weekly-report/
├── poc/
│   └── reports/                    # Markdownレポート
│       ├── solana-wallet-YYYY-WW.md
│       └── charts/                 # SVGチャート
│           ├── activity-*.svg
│           ├── volume-*.svg
│           └── types-*.svg
└── docs/                          # GitHub Pages用HTML
    ├── index.html                 # ダッシュボード
    ├── solana-wallet-*.html       # HTMLレポート
    └── charts/                    # チャートコピー
```

## GitHub Pagesでの確認

設定完了後、以下のURLでレポートを確認できます：

```
https://[YOUR_GITHUB_USERNAME].github.io/solana-weekly-report/
```

例: `https://shoya-sue.github.io/solana-weekly-report/`

## トラブルシューティング

### Actionsが失敗する場合
- Secretsが正しく設定されているか確認
- ウォレットアドレスが有効か確認
- RPCエンドポイントが応答しているか確認

### コミットが表示されない場合
- `GIT_USER_NAME`と`GIT_USER_EMAIL`が正しく設定されているか確認
- GitHubに登録されているメールアドレスと一致しているか確認

### GitHub Pagesが表示されない場合
- Pages設定で`/docs`フォルダが選択されているか確認
- `docs/index.html`が生成されているか確認
- デプロイに数分かかる場合があるので待つ

## カスタマイズ

### 監視頻度の変更
`.github/workflows/weekly-report-enhanced.yml`の`cron`設定を変更：

```yaml
schedule:
  - cron: '0 0 * * 6'  # 毎週土曜日（現在の設定）
  # - cron: '0 0 * * 1'  # 毎週月曜日
  # - cron: '0 0 * * *'  # 毎日
  # - cron: '0 0 1 * *'  # 毎月1日
```

### レポート期間の変更
環境変数`DAYS_TO_FETCH`を変更：
- `7`: 過去7日間（デフォルト）
- `30`: 過去30日間
- `0`: 全期間

## サポート

問題が発生した場合は、GitHubのIssuesで報告してください。