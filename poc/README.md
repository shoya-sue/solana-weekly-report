# Solana Wallet Weekly Reporter - PoC

## Overview
This is a Proof of Concept for automatically generating weekly transaction reports for Solana wallets.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and set your values:

```bash
cp .env.example .env
```

Edit `.env`:
```
SOLANA_RPC_ENDPOINT=https://api.mainnet-beta.solana.com
WALLET_ADDRESSES=YOUR_WALLET_ADDRESS_HERE
DAYS_TO_FETCH=7
```

### Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `SOLANA_RPC_ENDPOINT` | Solana RPC endpoint URL | `https://api.mainnet-beta.solana.com` |
| `WALLET_ADDRESSES` | Wallet addresses to monitor (comma separated) | Required |
| `DAYS_TO_FETCH` | Number of days to look back (0 = all transactions) | `7` |
| `MAX_TRANSACTIONS` | Maximum transactions to fetch per wallet | No limit |

**Note**: You can monitor multiple wallets by separating addresses with commas:
```
WALLET_ADDRESSES=address1,address2,address3
```

## Usage

### Manual Execution
```bash
npm start
```

The script will:
1. Fetch transactions from the specified wallet(s)
2. Generate a Markdown report with transaction summary
3. Save the report to `reports/` directory

### Fetching All Transactions
To fetch all transactions (not just the last 7 days):
```bash
DAYS_TO_FETCH=0 npm start
```

### Limiting Transactions
To limit the number of transactions fetched per wallet:
```bash
MAX_TRANSACTIONS=5000 npm start
```

## Output Example

Reports are saved in the `reports/` directory with the format:
- Filename: `solana-wallet-2025-W41.md`
- Content: Transaction summary, fees, and recent transaction list

## Directory Structure
```
poc/
├── index.js           # Main script
├── package.json       # Dependencies
├── .env              # Environment configuration (create from .env.example)
├── .env.example      # Environment template
├── .gitignore        # Git ignore rules
├── README.md         # This file
└── reports/          # Generated reports (created automatically)
    └── solana-wallet-YYYY-WW.md
```

## Notes
- Supports pagination to fetch more than 1000 transactions
- Can fetch all historical transactions (set `DAYS_TO_FETCH=0`)
- Failed transactions are tracked separately
- Transaction fees are calculated in SOL
- Progress is shown during fetching (every 100 transactions)

## Next Steps
- Add GitHub Actions for automated weekly execution
- Implement token transfer tracking
- Add more detailed analytics
- Support multiple wallet addresses