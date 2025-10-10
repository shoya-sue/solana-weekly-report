import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { getTokenInfo, getTokenSymbol, formatTokenAmount } from './tokenList.js';
import { generateTransactionChart, generateVolumeChart, generateTypePieChart } from './chartGenerator.js';

dotenv.config();

class SolanaWalletReporter {
  constructor() {
    this.rpcEndpoint = process.env.SOLANA_RPC_ENDPOINT || 'https://api.mainnet-beta.solana.com';
    this.walletAddresses = this.parseWalletAddresses();
    this.daysToFetch = parseInt(process.env.DAYS_TO_FETCH || '7');
    this.maxTransactions = process.env.MAX_TRANSACTIONS ? parseInt(process.env.MAX_TRANSACTIONS) : null;
    this.connection = new Connection(this.rpcEndpoint, 'confirmed');
  }

  parseWalletAddresses() {
    const addresses = process.env.WALLET_ADDRESSES || process.env.WALLET_ADDRESS || '';
    if (!addresses) {
      return [];
    }
    
    return addresses.split(',').map(addr => addr.trim()).filter(addr => addr);
  }

  analyzeTransaction(tx, walletAddress) {
    const result = {
      type: 'Unknown',
      details: '',
      programs: [],
      balanceChange: 0,
      tokenTransfers: []
    };

    try {
      // Get programs involved
      const programIds = tx.transaction.message.instructions.map(ix => 
        ix.programId ? ix.programId.toString() : ix.program
      );
      result.programs = [...new Set(programIds)];

      // Analyze balance changes
      if (tx.meta?.preBalances && tx.meta?.postBalances) {
        const accountKeys = tx.transaction.message.accountKeys || 
                           tx.transaction.message.staticAccountKeys || [];
        
        const walletIndex = accountKeys.findIndex(key => 
          (key.pubkey ? key.pubkey.toString() : key.toString()) === walletAddress
        );
        
        if (walletIndex >= 0) {
          const preBalance = tx.meta.preBalances[walletIndex] || 0;
          const postBalance = tx.meta.postBalances[walletIndex] || 0;
          result.balanceChange = (postBalance - preBalance) / LAMPORTS_PER_SOL;
        }
      }

      // Analyze instructions
      const instructions = tx.transaction.message.instructions;
      
      for (const ix of instructions) {
        const programId = ix.programId ? ix.programId.toString() : ix.program;
        
        // System Program - SOL transfers
        if (programId === '11111111111111111111111111111111' || programId === 'System') {
          if (ix.parsed?.type === 'transfer') {
            result.type = 'SOL Transfer';
            const amount = ix.parsed.info.lamports / LAMPORTS_PER_SOL;
            const from = ix.parsed.info.source;
            const to = ix.parsed.info.destination;
            
            if (from === walletAddress) {
              result.details = `Sent ${amount.toFixed(4)} SOL to ${to.slice(0,4)}...${to.slice(-4)}`;
            } else if (to === walletAddress) {
              result.details = `Received ${amount.toFixed(4)} SOL from ${from.slice(0,4)}...${from.slice(-4)}`;
            }
          } else if (ix.parsed?.type === 'createAccount') {
            result.type = 'Account Creation';
          }
        }
        
        // Token Program - Enhanced with token names
        else if (programId === 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' || programId === 'Token') {
          if (ix.parsed?.type === 'transfer' || ix.parsed?.type === 'transferChecked') {
            result.type = 'Token Transfer';
            const info = ix.parsed.info;
            const mint = info.mint;
            const tokenSymbol = mint ? getTokenSymbol(mint) : 'Unknown';
            const amount = info.amount || info.tokenAmount?.uiAmount || 0;
            
            result.tokenTransfers.push({
              amount,
              mint: mint || 'Unknown Token',
              symbol: tokenSymbol
            });
            
            // Update details with token name
            if (info.source === walletAddress) {
              result.details = `Sent ${tokenSymbol}`;
            } else if (info.destination === walletAddress) {
              result.details = `Received ${tokenSymbol}`;
            } else {
              result.details = `${tokenSymbol} Transfer`;
            }
          } else if (ix.parsed?.type === 'mintTo') {
            result.type = 'Token Mint';
            const mint = ix.parsed.info?.mint;
            if (mint) {
              result.details = `Minted ${getTokenSymbol(mint)}`;
            }
          } else if (ix.parsed?.type === 'burn') {
            result.type = 'Token Burn';
            const mint = ix.parsed.info?.mint;
            if (mint) {
              result.details = `Burned ${getTokenSymbol(mint)}`;
            }
          }
        }
        
        // Associated Token Account Program
        else if (programId === 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL') {
          result.type = 'Token Account Operation';
        }
        
        // Common DEX programs
        else if (programId.includes('JUP') || programId === 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4') {
          result.type = 'Jupiter Swap';
          result.details = 'Token swap via Jupiter';
        }
        else if (programId.includes('whirL') || programId === 'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc') {
          result.type = 'Orca Swap';
          result.details = 'Token swap via Orca';
        }
        else if (programId.includes('9W959') || programId === '9W959P8X8XbV7jkJbDf4DCXws5jwbHZDKGNPAkbqYxP4') {
          result.type = 'Raydium Swap';
          result.details = 'Token swap via Raydium';
        }
        
        // NFT Programs
        else if (programId === 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s') {
          result.type = 'NFT Operation';
        }
        
        // Staking programs
        else if (programId === 'Stake11111111111111111111111111111111111111') {
          result.type = 'Staking Operation';
        }
      }

      // Parse token transfers in inner instructions
      if (tx.meta?.innerInstructions) {
        for (const inner of tx.meta.innerInstructions) {
          for (const ix of inner.instructions) {
            if (ix.parsed?.type === 'transfer' && ix.program === 'spl-token') {
              const mint = ix.parsed.info?.mint;
              if (mint && !result.details.includes('Token')) {
                const tokenSymbol = getTokenSymbol(mint);
                result.type = 'Token Activity';
                result.details = `${tokenSymbol} activity`;
              }
            }
          }
        }
      }

      // If still unknown but has balance change
      if (result.type === 'Unknown' && result.balanceChange !== 0) {
        result.type = result.balanceChange > 0 ? 'Received SOL' : 'Sent SOL';
        result.details = `Balance change: ${result.balanceChange > 0 ? '+' : ''}${result.balanceChange.toFixed(4)} SOL`;
      }

    } catch (error) {
      console.error('Error analyzing transaction:', error.message);
    }

    return result;
  }

  async fetchWalletTransactions(walletAddress) {
    console.log(`\nFetching transactions for wallet: ${walletAddress}`);
    
    if (this.daysToFetch === 0) {
      console.log(`Fetching ALL transactions...`);
    } else {
      console.log(`Looking back ${this.daysToFetch} days...`);
    }

    const pubKey = new PublicKey(walletAddress);
    const now = Date.now();
    const pastTime = this.daysToFetch > 0 ? now - (this.daysToFetch * 24 * 60 * 60 * 1000) : 0;

    try {
      const transactions = [];
      let successCount = 0;
      let failureCount = 0;
      let totalFees = 0;
      let lastSignature = null;
      let hasMore = true;
      let totalFetched = 0;

      while (hasMore) {
        const options = {
          limit: 1000,
          before: lastSignature
        };

        console.log(`  Fetching batch ${Math.floor(totalFetched / 1000) + 1}...`);
        const signatures = await this.connection.getSignaturesForAddress(pubKey, options);

        if (signatures.length === 0) {
          hasMore = false;
          break;
        }

        for (const sig of signatures) {
          const blockTime = (sig.blockTime || 0) * 1000;
          
          // Check time filter if applicable
          if (this.daysToFetch > 0 && blockTime < pastTime) {
            hasMore = false;
            break;
          }

          // Check max transactions limit
          if (this.maxTransactions && transactions.length >= this.maxTransactions) {
            hasMore = false;
            break;
          }

          try {
            const tx = await this.connection.getParsedTransaction(
              sig.signature,
              { maxSupportedTransactionVersion: 0 }
            );

            if (tx) {
              const fee = tx.meta?.fee || 0;
              totalFees += fee;

              if (tx.meta?.err) {
                failureCount++;
              } else {
                successCount++;
              }

              // Analyze transaction details
              const analysis = this.analyzeTransaction(tx, walletAddress);

              transactions.push({
                signature: sig.signature,
                blockTime: new Date(blockTime),
                success: !tx.meta?.err,
                fee: fee / 1e9,
                slot: sig.slot,
                type: analysis.type,
                details: analysis.details,
                balanceChange: analysis.balanceChange,
                programs: analysis.programs,
                tokenTransfers: analysis.tokenTransfers
              });

              totalFetched++;
              
              // Progress indicator every 100 transactions
              if (totalFetched % 100 === 0) {
                console.log(`    Processed ${totalFetched} transactions...`);
              }
            }
          } catch (error) {
            console.error(`    Error fetching transaction ${sig.signature}:`, error.message);
          }
        }

        // Prepare for next batch
        if (signatures.length > 0) {
          lastSignature = signatures[signatures.length - 1].signature;
        }

        // Stop if we've hit the 1000 limit and there might be more
        if (signatures.length < 1000) {
          hasMore = false;
        }

        // Check if we've reached max transactions
        if (this.maxTransactions && transactions.length >= this.maxTransactions) {
          hasMore = false;
          console.log(`  Reached maximum transaction limit (${this.maxTransactions})`);
        }
      }

      console.log(`  Total fetched: ${transactions.length} transactions`);

      const fromDate = transactions.length > 0 
        ? transactions[transactions.length - 1].blockTime
        : new Date(pastTime || now);
      
      const toDate = transactions.length > 0 
        ? transactions[0].blockTime
        : new Date(now);

      return {
        walletAddress,
        period: {
          from: fromDate,
          to: toDate
        },
        summary: {
          totalTransactions: transactions.length,
          successCount,
          failureCount,
          totalFeesSOL: totalFees / 1e9
        },
        transactions
      };
    } catch (error) {
      console.error(`Error fetching transactions for ${walletAddress}:`, error);
      throw error;
    }
  }

  async fetchAllTransactions() {
    if (this.walletAddresses.length === 0) {
      throw new Error('WALLET_ADDRESSES is not set in .env file');
    }

    const results = [];
    
    for (const address of this.walletAddresses) {
      try {
        const data = await this.fetchWalletTransactions(address);
        results.push(data);
      } catch (error) {
        console.error(`Failed to fetch data for ${address}:`, error.message);
        results.push({
          walletAddress: address,
          error: error.message,
          period: {
            from: new Date(Date.now() - (this.daysToFetch * 24 * 60 * 60 * 1000)),
            to: new Date()
          },
          summary: {
            totalTransactions: 0,
            successCount: 0,
            failureCount: 0,
            totalFeesSOL: 0
          },
          transactions: []
        });
      }
    }
    
    return results;
  }

  async generateAndSaveCharts(allData) {
    const chartsDir = path.join(process.cwd(), 'reports', 'charts');
    
    try {
      await fs.mkdir(chartsDir, { recursive: true });
    } catch (error) {
      console.error('Error creating charts directory:', error);
    }

    const charts = [];
    
    for (const data of allData) {
      if (!data.error && data.transactions.length > 0) {
        const shortAddress = `${data.walletAddress.substring(0, 8)}`;
        
        // Transaction activity chart
        const activityChart = generateTransactionChart(data.transactions, `Activity - ${shortAddress}`);
        const activityFile = `activity-${shortAddress}.svg`;
        await fs.writeFile(path.join(chartsDir, activityFile), activityChart, 'utf8');
        charts.push(activityFile);
        
        // Volume flow chart
        const volumeChart = generateVolumeChart(data.transactions);
        const volumeFile = `volume-${shortAddress}.svg`;
        await fs.writeFile(path.join(chartsDir, volumeFile), volumeChart, 'utf8');
        charts.push(volumeFile);
        
        // Transaction types pie chart
        const typeCounts = {};
        for (const tx of data.transactions) {
          typeCounts[tx.type] = (typeCounts[tx.type] || 0) + 1;
        }
        const typeChart = generateTypePieChart(typeCounts);
        const typeFile = `types-${shortAddress}.svg`;
        await fs.writeFile(path.join(chartsDir, typeFile), typeChart, 'utf8');
        charts.push(typeFile);
      }
    }
    
    console.log(`  Generated ${charts.length} charts`);
    return charts;
  }

  generateMarkdownReport(allData, charts = []) {
    const weekNumber = this.getWeekNumber(new Date());
    const year = new Date().getFullYear();
    const reportType = this.daysToFetch === 0 ? 'All-Time' : `Weekly`;

    let markdown = `# Solana Wallet ${reportType} Report`;
    if (reportType === 'Weekly') {
      markdown += ` (${year}-W${weekNumber})`;
    }
    markdown += `\n\n`;
    
    if (allData.length > 0 && allData.some(d => d.transactions.length > 0)) {
      const validData = allData.filter(d => !d.error && d.transactions.length > 0);
      if (validData.length > 0) {
        const earliestDate = validData.reduce((min, d) => 
          d.period.from < min ? d.period.from : min, validData[0].period.from);
        const latestDate = validData.reduce((max, d) => 
          d.period.to > max ? d.period.to : max, validData[0].period.to);
        
        markdown += `Period: ${earliestDate.toISOString().split('T')[0]} ~ ${latestDate.toISOString().split('T')[0]}\n\n`;
      }
    }

    markdown += `## Summary\n\n`;
    markdown += `**Monitored Wallets**: ${allData.length}\n`;
    if (this.daysToFetch === 0) {
      markdown += `**Report Type**: All transactions\n`;
    } else {
      markdown += `**Report Type**: Last ${this.daysToFetch} days\n`;
    }
    markdown += `\n`;

    let totalTx = 0;
    let totalSuccess = 0;
    let totalFailed = 0;
    let totalFees = 0;

    for (const data of allData) {
      if (!data.error) {
        totalTx += data.summary.totalTransactions;
        totalSuccess += data.summary.successCount;
        totalFailed += data.summary.failureCount;
        totalFees += data.summary.totalFeesSOL;
      }
    }

    markdown += `### Overall Statistics\n\n`;
    markdown += `- **Total Transactions**: ${totalTx}\n`;
    markdown += `- **Successful**: ${totalSuccess}\n`;
    markdown += `- **Failed**: ${totalFailed}\n`;
    markdown += `- **Total Fees**: ${totalFees.toFixed(6)} SOL\n\n`;

    // Add links to charts if available
    if (charts.length > 0) {
      markdown += `### 📊 Analytics Charts\n\n`;
      markdown += `Charts are available in the \`reports/charts/\` directory:\n`;
      charts.forEach(chart => {
        markdown += `- [${chart}](./charts/${chart})\n`;
      });
      markdown += `\n`;
    }

    markdown += `---\n\n`;

    for (const data of allData) {
      const shortAddress = `${data.walletAddress.substring(0, 4)}...${data.walletAddress.substring(data.walletAddress.length - 4)}`;
      
      markdown += `## Wallet: ${shortAddress}\n`;
      markdown += `Full address: \`${data.walletAddress}\`\n\n`;
      
      if (data.error) {
        markdown += `⚠️ **Error fetching data**: ${data.error}\n\n`;
      } else {
        markdown += `### Summary\n\n`;
        markdown += `- **Total Transactions**: ${data.summary.totalTransactions}\n`;
        markdown += `- **Successful**: ${data.summary.successCount}\n`;
        markdown += `- **Failed**: ${data.summary.failureCount}\n`;
        markdown += `- **Total Fees**: ${data.summary.totalFeesSOL.toFixed(6)} SOL\n`;
        
        if (data.transactions.length > 0) {
          const period = `${data.period.from.toISOString().split('T')[0]} ~ ${data.period.to.toISOString().split('T')[0]}`;
          markdown += `- **Activity Period**: ${period}\n`;
        }
        markdown += `\n`;

        // Transaction type summary
        if (data.transactions.length > 0) {
          const typeCounts = {};
          for (const tx of data.transactions) {
            typeCounts[tx.type] = (typeCounts[tx.type] || 0) + 1;
          }
          
          markdown += `### Transaction Types\n\n`;
          markdown += `| Type | Count |\n`;
          markdown += `|------|-------|\n`;
          
          const sortedTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);
          for (const [type, count] of sortedTypes) {
            markdown += `| ${type} | ${count} |\n`;
          }
          markdown += `\n`;

          // Token activity summary
          const tokenActivity = {};
          for (const tx of data.transactions) {
            if (tx.tokenTransfers && tx.tokenTransfers.length > 0) {
              for (const transfer of tx.tokenTransfers) {
                const symbol = transfer.symbol || 'Unknown';
                if (!tokenActivity[symbol]) {
                  tokenActivity[symbol] = 0;
                }
                tokenActivity[symbol]++;
              }
            }
          }

          if (Object.keys(tokenActivity).length > 0) {
            markdown += `### Token Activity\n\n`;
            markdown += `| Token | Transactions |\n`;
            markdown += `|-------|-------------|\n`;
            
            const sortedTokens = Object.entries(tokenActivity).sort((a, b) => b[1] - a[1]);
            for (const [token, count] of sortedTokens) {
              markdown += `| ${token} | ${count} |\n`;
            }
            markdown += `\n`;
          }
        }

        if (data.transactions.length > 0) {
          markdown += `### Recent Transactions (Last ${Math.min(15, data.transactions.length)})\n\n`;
          markdown += `| Status | Type | Details | Time | Balance Change | Fee (SOL) | Signature |\n`;
          markdown += `|--------|------|---------|------|----------------|-----------|----------|\n`;

          const recentTxs = data.transactions.slice(0, 15);
          for (const tx of recentTxs) {
            const status = tx.success ? '✅' : '❌';
            const shortSig = `${tx.signature.substring(0, 4)}...${tx.signature.substring(tx.signature.length - 4)}`;
            const txLink = `[${shortSig}](https://solscan.io/tx/${tx.signature})`;
            const time = tx.blockTime.toISOString().replace('T', ' ').substring(5, 16);
            const balanceChange = tx.balanceChange !== 0 
              ? `${tx.balanceChange > 0 ? '+' : ''}${tx.balanceChange.toFixed(4)} SOL`
              : '-';
            const details = tx.details ? tx.details.substring(0, 30) + (tx.details.length > 30 ? '...' : '') : '-';
            
            markdown += `| ${status} | ${tx.type} | ${details} | ${time} | ${balanceChange} | ${tx.fee.toFixed(6)} | ${txLink} |\n`;
          }
          markdown += `\n`;
        }
        
        // Chart references for this wallet
        const walletShortName = data.walletAddress.substring(0, 8);
        markdown += `### 📈 Charts for this wallet\n\n`;
        markdown += `- [Activity Chart](./charts/activity-${walletShortName}.svg)\n`;
        markdown += `- [Volume Flow Chart](./charts/volume-${walletShortName}.svg)\n`;
        markdown += `- [Transaction Types](./charts/types-${walletShortName}.svg)\n`;
        markdown += `\n`;
      }
      
      markdown += `---\n\n`;
    }

    markdown += `*Report generated at: ${new Date().toISOString()}*\n`;
    markdown += `*Enhanced with token recognition and charts*\n`;

    return markdown;
  }

  getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  async saveReport(markdownContent) {
    const reportsDir = path.join(process.cwd(), 'reports');
    
    try {
      await fs.mkdir(reportsDir, { recursive: true });
    } catch (error) {
      console.error('Error creating reports directory:', error);
    }

    let filename;
    if (this.daysToFetch === 0) {
      filename = `solana-wallet-all-time-${new Date().toISOString().split('T')[0]}.md`;
    } else {
      const weekNumber = this.getWeekNumber(new Date());
      const year = new Date().getFullYear();
      filename = `solana-wallet-${year}-W${weekNumber}-enhanced.md`;
    }
    
    const filepath = path.join(reportsDir, filename);

    await fs.writeFile(filepath, markdownContent, 'utf8');
    console.log(`Report saved to: ${filepath}`);
    
    return filepath;
  }

  async run() {
    try {
      console.log('Starting Solana Wallet Reporter (Enhanced Edition)...');
      console.log(`Monitoring ${this.walletAddresses.length} wallet(s)`);
      
      if (this.daysToFetch === 0) {
        console.log('Fetching ALL transactions (this may take a while)...\n');
      } else {
        console.log(`Fetching transactions from last ${this.daysToFetch} days\n`);
      }
      
      const allData = await this.fetchAllTransactions();
      
      console.log('\nGenerating charts...');
      const charts = await this.generateAndSaveCharts(allData);
      
      console.log('Generating report...');
      const markdown = this.generateMarkdownReport(allData, charts);
      const filepath = await this.saveReport(markdown);
      
      console.log('\n✅ Enhanced report generation complete!');
      
      const totalTx = allData.reduce((sum, d) => sum + (d.summary?.totalTransactions || 0), 0);
      console.log(`📊 Processed ${totalTx} total transactions across ${this.walletAddresses.length} wallets`);
      console.log(`📈 Generated ${charts.length} visualization charts`);
      console.log(`📁 Report saved to: ${filepath}`);
      
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  }
}

const reporter = new SolanaWalletReporter();
reporter.run();