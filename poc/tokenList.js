// Popular Solana token metadata
export const TOKEN_LIST = {
  // Native SOL
  'So11111111111111111111111111111111111111112': {
    symbol: 'SOL',
    name: 'Solana',
    decimals: 9
  },
  
  // Stablecoins
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6
  },
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': {
    symbol: 'USDT',
    name: 'Tether',
    decimals: 6
  },
  'USDH1SM1ojwWUga67PGrgFWUHibbjqMvuMaDkRJTgkX': {
    symbol: 'USDH',
    name: 'USDH Hubble Stablecoin',
    decimals: 6
  },
  
  // Wrapped tokens
  'So11111111111111111111111111111111111111112': {
    symbol: 'wSOL',
    name: 'Wrapped SOL',
    decimals: 9
  },
  '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs': {
    symbol: 'wETH',
    name: 'Wrapped Ethereum (Wormhole)',
    decimals: 8
  },
  '3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh': {
    symbol: 'wBTC',
    name: 'Wrapped Bitcoin (Wormhole)',
    decimals: 8
  },
  
  // DeFi tokens
  'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So': {
    symbol: 'mSOL',
    name: 'Marinade Staked SOL',
    decimals: 9
  },
  '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj': {
    symbol: 'stSOL',
    name: 'Lido Staked SOL',
    decimals: 9
  },
  'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn': {
    symbol: 'JitoSOL',
    name: 'Jito Staked SOL',
    decimals: 9
  },
  'bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1': {
    symbol: 'bSOL',
    name: 'BlazeStake Staked SOL',
    decimals: 9
  },
  
  // Meme coins
  'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': {
    symbol: 'BONK',
    name: 'Bonk',
    decimals: 5
  },
  '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr': {
    symbol: 'POPCAT',
    name: 'Popcat',
    decimals: 9
  },
  'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm': {
    symbol: 'WIF',
    name: 'dogwifhat',
    decimals: 6
  },
  'MEW1gQWJ3nEXg2qgERiKu7FAFj79PHvQVREQUzScPP5': {
    symbol: 'MEW',
    name: 'cat in a dogs world',
    decimals: 5
  },
  'CULLsLZjXuwPMb79dwZGPzdbDVVqEzY1QxGpkb2dKNMg': {
    symbol: 'CULL',
    name: 'Cullen',
    decimals: 6
  },
  
  // Gaming tokens
  'ATLAS8pJNqsDSGvjPXbM34fKKRqMktsHQvCRnVvR6nFz': {
    symbol: 'ATLAS',
    name: 'Star Atlas',
    decimals: 8
  },
  'DUSTawucrTsGU8hcqRdHDCbuYhCPADMLM2VcCb8VnFnQ': {
    symbol: 'DUST',
    name: 'DUST Protocol',
    decimals: 9
  },
  
  // DEX tokens
  'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE': {
    symbol: 'ORCA',
    name: 'Orca',
    decimals: 6
  },
  'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt': {
    symbol: 'SRM',
    name: 'Serum',
    decimals: 6
  },
  'EPeUFDgHRxs9xxEPVaL6kfGQvCon7jmAWKVUHuux1Tpz': {
    symbol: 'BAT',
    name: 'Basic Attention Token',
    decimals: 8
  },
  
  // Infrastructure
  'RLBxxFkseAZ4RgJH3Sqn8jXxhmGoz9jWxDNJMh8pL7a': {
    symbol: 'RLB',
    name: 'Rollbit Coin',
    decimals: 2
  },
  'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3': {
    symbol: 'PYTH',
    name: 'Pyth Network',
    decimals: 6
  },
  'jup6z9P5SsNMfucPiJTdsVSJnCudFXkAm8LwNEEwAiP': {
    symbol: 'JUP',
    name: 'Jupiter',
    decimals: 6
  }
};

export function getTokenInfo(mintAddress) {
  return TOKEN_LIST[mintAddress] || null;
}

export function getTokenSymbol(mintAddress) {
  const info = getTokenInfo(mintAddress);
  return info ? info.symbol : mintAddress.slice(0, 4) + '...';
}

export function getTokenName(mintAddress) {
  const info = getTokenInfo(mintAddress);
  return info ? info.name : 'Unknown Token';
}

export function formatTokenAmount(amount, mintAddress) {
  const info = getTokenInfo(mintAddress);
  if (!info) return amount;
  
  const decimals = info.decimals || 9;
  const value = amount / Math.pow(10, decimals);
  return `${value.toFixed(4)} ${info.symbol}`;
}