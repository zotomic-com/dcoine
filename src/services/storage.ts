import {
  AdminSettings,
  AnnouncementItem,
  AnnouncementSettings,
  AppNotification,
  BlockchainNetwork,
  CommissionRule,
  DAppItem,
  MiningSession,
  NewsArticle,
  P2POrder,
  P2PTrade,
  PlatformCommissionConfig,
  Referee,
  SwapConfig,
  TokenItem,
  TransactionRecord,
  UserProfile,
  UserWallet,
} from '../types';
import { generateAddress, generateMnemonic, generatePrivateKey, generateReferralCode } from '../utils/crypto';

export const NETWORKS: BlockchainNetwork[] = [
  {
    id: 'dcoine',
    name: 'Dcoine Mainnet',
    symbol: 'DCOIN',
    rpcUrl: 'https://rpc.dcoine.network',
    chainId: 9988,
    explorerUrl: 'https://explorer.dcoine.network',
    iconBg: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    rpcUrl: 'https://eth.llamarpc.com',
    chainId: 1,
    explorerUrl: 'https://etherscan.io',
    iconBg: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40',
    badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
  },
  {
    id: 'bsc',
    name: 'BNB Smart Chain',
    symbol: 'BNB',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    chainId: 56,
    explorerUrl: 'https://bscscan.com',
    iconBg: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    badgeColor: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  },
  {
    id: 'solana',
    name: 'Solana',
    symbol: 'SOL',
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    chainId: 101,
    explorerUrl: 'https://solscan.io',
    iconBg: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  },
  {
    id: 'polygon',
    name: 'Polygon PoS',
    symbol: 'POL',
    rpcUrl: 'https://polygon-rpc.com',
    chainId: 137,
    explorerUrl: 'https://polygonscan.com',
    iconBg: 'bg-violet-500/20 text-violet-400 border-violet-500/40',
    badgeColor: 'text-violet-400 bg-violet-500/10 border-violet-500/30',
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum One',
    symbol: 'ARB',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    chainId: 42161,
    explorerUrl: 'https://arbiscan.io',
    iconBg: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  },
  {
    id: 'base',
    name: 'Base',
    symbol: 'ETH',
    rpcUrl: 'https://mainnet.base.org',
    chainId: 8453,
    explorerUrl: 'https://basescan.org',
    iconBg: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  },
];

const INITIAL_TOKENS: TokenItem[] = [
  {
    id: 'dcoin',
    symbol: 'DCOIN',
    name: 'Dcoine Native',
    network: 'dcoine',
    contractAddress: '0x99dc01e74f1791a8291a27e7d90f7790b83e4a01',
    decimals: 18,
    balance: 245.5,
    priceUsd: 1.48,
    change24h: 12.6,
    iconUrl: '/logo.png',
    lockedBalance: 48.6, // Mined rewards locked in native DC platform wallet
  },
  {
    id: 'eth',
    symbol: 'ETH',
    name: 'Ethereum',
    network: 'ethereum',
    decimals: 18,
    balance: 1.45,
    priceUsd: 3450.2,
    change24h: 2.4,
  },
  {
    id: 'usdt',
    symbol: 'USDT',
    name: 'Tether USD',
    network: 'ethereum',
    contractAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    decimals: 6,
    balance: 850.0,
    priceUsd: 1.0,
    change24h: 0.01,
  },
  {
    id: 'usdc',
    symbol: 'USDC',
    name: 'USD Coin',
    network: 'ethereum',
    contractAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    decimals: 6,
    balance: 320.0,
    priceUsd: 1.0,
    change24h: 0.0,
  },
  {
    id: 'bnb',
    symbol: 'BNB',
    name: 'BNB Chain',
    network: 'bsc',
    decimals: 18,
    balance: 2.8,
    priceUsd: 594.8,
    change24h: -0.6,
  },
  {
    id: 'sol',
    symbol: 'SOL',
    name: 'Solana',
    network: 'solana',
    decimals: 9,
    balance: 14.2,
    priceUsd: 182.4,
    change24h: 6.8,
  },
  {
    id: 'btc',
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    network: 'ethereum',
    contractAddress: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    decimals: 8,
    balance: 0.065,
    priceUsd: 89620.0,
    change24h: 3.5,
  },
];

const INITIAL_P2P_ORDERS: P2POrder[] = [
  {
    id: 'ord-101',
    userId: 'merchant-alpha',
    type: 'sell',
    merchantName: 'CryptoExpress_Pro',
    merchantRating: 99.4,
    completedOrdersCount: 2841,
    cryptoSymbol: 'USDT',
    fiatCurrency: 'USD',
    price: 1.01,
    minLimit: 50,
    maxLimit: 3000,
    availableAmount: 18450,
    paymentMethods: ['Bank Transfer', 'Zelle', 'Wise'],
    terms: 'Instant auto-release upon payment receipt. Verified buyers only. No third-party payments.',
    status: 'active',
    avgReleaseTimeMinutes: 2.1,
    createdAt: Date.now() - 3600000 * 5,
  },
  {
    id: 'ord-102',
    userId: 'merchant-beta',
    type: 'sell',
    merchantName: 'DcoineGlobalMerchant',
    merchantRating: 100,
    completedOrdersCount: 1540,
    cryptoSymbol: 'DCOIN',
    fiatCurrency: 'USD',
    price: 1.48,
    minLimit: 20,
    maxLimit: 5000,
    availableAmount: 50000,
    paymentMethods: ['Wise', 'Revolut', 'PayPal'],
    terms: 'Official Dcoine Ecosystem verified merchant. Fast release with 100% escrow protection.',
    status: 'active',
    avgReleaseTimeMinutes: 1.5,
    createdAt: Date.now() - 3600000 * 2,
  },
  {
    id: 'ord-103',
    userId: 'merchant-gamma',
    type: 'buy',
    merchantName: 'FastPay_Trader',
    merchantRating: 98.7,
    completedOrdersCount: 890,
    cryptoSymbol: 'USDT',
    fiatCurrency: 'USD',
    price: 0.99,
    minLimit: 100,
    maxLimit: 2000,
    availableAmount: 8000,
    paymentMethods: ['Bank Transfer', 'Cash App'],
    terms: 'Fast cash payout within 5 minutes. Please release escrow once you confirm bank balance.',
    status: 'active',
    avgReleaseTimeMinutes: 3.2,
    createdAt: Date.now() - 3600000 * 8,
  },
  {
    id: 'ord-104',
    userId: 'merchant-delta',
    type: 'sell',
    merchantName: 'Satoshi_Direct',
    merchantRating: 99.1,
    completedOrdersCount: 4210,
    cryptoSymbol: 'BTC',
    fiatCurrency: 'USD',
    price: 89800,
    minLimit: 200,
    maxLimit: 15000,
    availableAmount: 1.25,
    paymentMethods: ['Bank Wire', 'Wise'],
    terms: 'Institutional grade escrow security. Strictly KYC compliant.',
    status: 'active',
    avgReleaseTimeMinutes: 4.0,
    createdAt: Date.now() - 3600000 * 12,
  },
  {
    id: 'ord-105',
    userId: 'merchant-eur',
    type: 'sell',
    merchantName: 'EuroCrypto_SEPA',
    merchantRating: 99.8,
    completedOrdersCount: 3120,
    cryptoSymbol: 'USDT',
    fiatCurrency: 'EUR',
    price: 0.94,
    minLimit: 50,
    maxLimit: 4000,
    availableAmount: 12000,
    paymentMethods: ['SEPA Instant', 'Revolut'],
    terms: 'SEPA Instant transfers executed within 60 seconds.',
    status: 'active',
    avgReleaseTimeMinutes: 1.8,
    createdAt: Date.now() - 3600000 * 4,
  },
];

const INITIAL_NEWS: NewsArticle[] = [
  {
    id: 'news-1',
    title: 'Dcoine Launches Layer-1 Mobile Mining Protocol with Zero Battery Drain',
    excerpt: 'The revolutionary Proof-of-Engagement consensus algorithm allows smartphone users to mine DCOIN in lightweight 24-hour cycles.',
    content: 'Dcoine has officially deployed its next-generation consensus mechanism allowing decentralization enthusiasts worldwide to participate in network validation without expensive GPU rigs or battery exhaustion. By leveraging synchronized cryptographic time-locks and proof-of-engagement, miners lock 24-hour non-custodial sessions and earn daily network emissions along with layered referral boosts.',
    source: 'CoinDesk',
    sourceUrl: 'https://coindesk.com',
    imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80',
    category: 'Dcoine',
    publishedAt: '2 hours ago',
    readTime: '3 min read',
    likes: 342,
    comments: [
      {
        id: 'c-1',
        userId: 'u-crypto99',
        userName: 'Alex_Vance',
        text: 'Started my 24h session this morning! Hashrate boost with referrals is working smoothly.',
        timestamp: Date.now() - 3600000,
        likes: 18,
      },
      {
        id: 'c-2',
        userId: 'u-blockchain',
        userName: 'Elena_Web3',
        text: 'The non-custodial escrow design for P2P is also super clean. Great milestone for Dcoine.',
        timestamp: Date.now() - 1800000,
        likes: 9,
      },
    ],
  },
  {
    id: 'news-2',
    title: 'Bitcoin Surges Towards New All-Time Highs Amid Global Institutional Inflows',
    excerpt: 'Sustained ETF demand and macroeconomic easing push BTC market capitalization above $1.75 Trillion.',
    content: 'Institutional capital continues to pour into sovereign and spot digital asset reserves as global treasuries explore Bitcoin allocations. Analysts point to cross-chain liquidity networks and decentralized stablecoin rails as key catalysts accelerating transaction velocities across major financial centers.',
    source: 'CoinTelegraph',
    sourceUrl: 'https://cointelegraph.com',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    category: 'Bitcoin',
    publishedAt: '4 hours ago',
    readTime: '4 min read',
    likes: 512,
    comments: [
      {
        id: 'c-3',
        userId: 'u-hodl',
        userName: 'SatoshiFanatic',
        text: 'Sound money cannot be stopped. Holding strong!',
        timestamp: Date.now() - 7200000,
        likes: 24,
      },
    ],
  },
  {
    id: 'news-3',
    title: 'Ethereum Layer-2 Fees Drop 90% Following Modular Data Availability Upgrade',
    excerpt: 'Rollups on Arbitrum, Base, and Polygon report record daily active wallets following blob transaction optimizations.',
    content: 'Gas fee compression across Ethereum Layer-2 rollups has democratized micro-transactions for Web3 users. Swapping tokens and bridging assets across decentralized liquidity pools now costs fractions of a cent, opening the gates for mass retail DeFi adoption.',
    source: 'Decrypt',
    sourceUrl: 'https://decrypt.co',
    imageUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?auto=format&fit=crop&w=1200&q=80',
    category: 'Ethereum',
    publishedAt: '6 hours ago',
    readTime: '3 min read',
    likes: 289,
    comments: [],
  },
  {
    id: 'news-4',
    title: 'Cross-Chain Decentralized P2P Escrow Emerges as Prime Alternative to CEXs',
    excerpt: 'Automated smart contract escrow protections eliminate counterparty risk for global fiat-to-crypto traders.',
    content: 'Traders across emerging economies are rapidly migrating to decentralized P2P trading desks. By locking crypto in non-custodial smart escrow contracts until fiat payment verification is confirmed, platforms like Dcoine safeguard both buyer and merchant without requiring third-party fund custody.',
    source: 'The Block',
    sourceUrl: 'https://theblock.co',
    imageUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1200&q=80',
    category: 'DeFi',
    publishedAt: '12 hours ago',
    readTime: '5 min read',
    likes: 419,
    comments: [],
  },
  {
    id: 'news-5',
    title: 'Global Regulators Form Unified Digital Asset Framework Supporting Web3 Innovation',
    excerpt: 'Standardized guidelines emphasize transparency, self-custody rights, and verifiable reserve credentials.',
    content: 'International financial regulators have published a comprehensive framework recognizing non-custodial wallets and decentralized autonomous protocols while establishing strict anti-fraud rules for centralized brokers.',
    source: 'Bloomberg Crypto',
    sourceUrl: 'https://bloomberg.com/crypto',
    imageUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80',
    category: 'Regulation',
    publishedAt: '1 day ago',
    readTime: '4 min read',
    likes: 198,
    comments: [],
  },
];

const INITIAL_DAPPS: DAppItem[] = [
  {
    id: 'dapp-dcoine-stake',
    name: 'Dcoine Liquidity Pool',
    category: 'Staking',
    description: 'Stake DCOIN/USDT pairs and earn up to 24.5% APY yield with auto-compounder.',
    url: 'https://dcoine.network/stake',
    iconBg: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    badge: 'Verified',
    rating: 4.9,
    chain: 'Dcoine Mainnet',
  },
  {
    id: 'dapp-uniswap',
    name: 'Uniswap V3',
    category: 'DEX',
    description: 'Swap tokens across Ethereum, Arbitrum, and Polygon with concentrated liquidity.',
    url: 'https://app.uniswap.org',
    iconBg: 'bg-pink-500/20 text-pink-400 border-pink-500/40',
    badge: 'Popular',
    rating: 4.8,
    chain: 'Multi-Chain',
  },
  {
    id: 'dapp-pancakeswap',
    name: 'PancakeSwap',
    category: 'DEX',
    description: 'Trade, earn, and win crypto on all-in-one decentralized DEX on BNB Chain.',
    url: 'https://pancakeswap.finance',
    iconBg: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
    badge: 'DeFi',
    rating: 4.7,
    chain: 'BNB Chain',
  },
  {
    id: 'dapp-aave',
    name: 'Aave Protocol',
    category: 'DeFi',
    description: 'Decentralized non-custodial liquidity market protocol to earn interest on deposits.',
    url: 'https://app.aave.com',
    iconBg: 'bg-teal-500/20 text-teal-400 border-teal-500/40',
    badge: 'Lending',
    rating: 4.9,
    chain: 'Ethereum',
  },
  {
    id: 'dapp-opensea',
    name: 'OpenSea Marketplace',
    category: 'NFT',
    description: 'Discover, collect, and sell extraordinary Web3 digital collectibles and NFTs.',
    url: 'https://opensea.io',
    iconBg: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    badge: 'NFT',
    rating: 4.6,
    chain: 'Multi-Chain',
  },
];

export class StorageService {
  private static STORAGE_PREFIX = 'dcoine_app_';

  private static getItem<T>(key: string, defaultValue: T): T {
    try {
      const saved = localStorage.getItem(this.STORAGE_PREFIX + key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private static setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(this.STORAGE_PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }

  // User Profile
  public static getUser(): UserProfile {
    const existing = this.getItem<UserProfile | null>('user_profile', null);
    if (existing) return existing;

    const defaultUser: UserProfile = {
      id: 'usr_main_99',
      username: 'CryptoExplorer',
      email: 'user@dcoine.network',
      referralCode: generateReferralCode('DCOIN'),
      role: 'user',
      twoFactorEnabled: false,
      twoFactorSecret: 'JBSWY3DPEHPK3PXP',
      isMerchant: false,
      merchantSecurityPledge: 0,
      kycStatus: 'verified',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      country: 'United States',
      preferredCurrency: 'USD',
      createdAt: Date.now() - 86400000 * 14,
      lockedMinedBalance: 48.6, // Native platform locked mined DC
    };
    this.setItem('user_profile', defaultUser);
    return defaultUser;
  }

  public static saveUser(user: UserProfile): void {
    this.setItem('user_profile', user);
  }

  // Wallets
  public static getWallets(): UserWallet[] {
    const existing = this.getItem<UserWallet[]>('user_wallets', []);
    if (existing.length > 0) return existing;

    const defaultMnemonic = generateMnemonic();
    const defaultAddress = generateAddress();
    const defaultPrivateKey = generatePrivateKey();

    const initialWallets: UserWallet[] = [
      {
        id: 'w-primary',
        name: 'Main Dcoine Vault',
        address: defaultAddress,
        mnemonicPhrase: defaultMnemonic,
        privateKey: defaultPrivateKey,
        network: 'dcoine',
        isNative: true, // Native DC platform wallet
        lockedBalance: 48.6, // Mined DC locked permanently in native wallet
        createdAt: Date.now() - 86400000 * 14,
      },
      {
        id: 'w-trading',
        name: 'Trading & P2P Wallet',
        address: generateAddress(),
        mnemonicPhrase: generateMnemonic(),
        privateKey: generatePrivateKey(),
        network: 'ethereum',
        createdAt: Date.now() - 86400000 * 7,
      },
    ];
    this.setItem('user_wallets', initialWallets);
    return initialWallets;
  }

  public static saveWallets(wallets: UserWallet[]): void {
    this.setItem('user_wallets', wallets);
  }

  // Active Network
  public static getActiveNetwork(): BlockchainNetwork {
    const netId = this.getItem<string>('active_network_id', 'dcoine');
    return NETWORKS.find(n => n.id === netId) || NETWORKS[0];
  }

  public static setActiveNetwork(networkId: string): void {
    this.setItem('active_network_id', networkId);
  }

  // Tokens
  public static getTokens(): TokenItem[] {
    return this.getItem<TokenItem[]>('tokens_list', INITIAL_TOKENS);
  }

  public static saveTokens(tokens: TokenItem[]): void {
    this.setItem('tokens_list', tokens);
  }

  // Mining Session
  public static getMiningSession(): MiningSession {
    const defaultSession: MiningSession = {
      isActive: false,
      startTime: null,
      endTime: null,
      baseRatePerHour: parseFloat((1 / 24).toFixed(6)), // 24h = 1 DC (1/24 = 0.041667 DC/hr)
      boostMultiplier: 1.30, // 3 active referees * 0.1 DC/24h = +0.3 DC/24h
      currentSessionMined: 0,
      totalMinedLifetime: 48.6,
      lastClaimTime: null,
      consecutiveDays: 3,
      referralRatePerActiveRef: parseFloat((0.1 / 24).toFixed(6)), // 10 active refs = 1 DC / 24h (0.1 DC/24h per active ref)
      lockedMinedBalance: 48.6,
    };
    return this.getItem<MiningSession>('mining_session', defaultSession);
  }

  public static saveMiningSession(session: MiningSession): void {
    this.setItem('mining_session', session);
  }

  // Referrals
  public static getReferees(): Referee[] {
    const defaultReferees: Referee[] = [
      {
        id: 'ref-1',
        name: 'Sarah_K',
        email: 'sarah.k@gmail.com',
        joinedAt: Date.now() - 86400000 * 4,
        status: 'active',
        dcoinEarnedBonus: 12.4,
      },
      {
        id: 'ref-2',
        name: 'David_Miller',
        email: 'd.miller@web3.io',
        joinedAt: Date.now() - 86400000 * 8,
        status: 'active',
        dcoinEarnedBonus: 18.2,
      },
      {
        id: 'ref-3',
        name: 'Crypto_Zen',
        email: 'zen.crypto@proton.me',
        joinedAt: Date.now() - 86400000 * 11,
        status: 'active',
        dcoinEarnedBonus: 24.5,
      },
      {
        id: 'ref-4',
        name: 'Lucas_B',
        email: 'lucas.eth@yahoo.com',
        joinedAt: Date.now() - 86400000 * 13,
        status: 'idle',
        dcoinEarnedBonus: 6.8,
      },
    ];
    return this.getItem<Referee[]>('referees_list', defaultReferees);
  }

  public static saveReferees(referees: Referee[]): void {
    this.setItem('referees_list', referees);
  }

  // P2P Orders
  public static getP2POrders(): P2POrder[] {
    return this.getItem<P2POrder[]>('p2p_orders', INITIAL_P2P_ORDERS);
  }

  public static saveP2POrders(orders: P2POrder[]): void {
    this.setItem('p2p_orders', orders);
  }

  // P2P Trades / Escrows
  public static getP2PTrades(): P2PTrade[] {
    return this.getItem<P2PTrade[]>('p2p_trades', []);
  }

  public static saveP2PTrades(trades: P2PTrade[]): void {
    this.setItem('p2p_trades', trades);
  }

  // Transactions
  public static getTransactions(): TransactionRecord[] {
    const defaultTxs: TransactionRecord[] = [
      {
        id: 'tx-01',
        type: 'mine',
        symbol: 'DCOIN',
        amount: 30.0,
        network: 'dcoine',
        hash: '0x9fa4b2e817c6e0018a99cde3194a02be9761e05a8d90',
        status: 'completed',
        timestamp: Date.now() - 86400000 * 1,
      },
      {
        id: 'tx-02',
        type: 'swap',
        symbol: 'USDT',
        amount: 250.0,
        network: 'dcoine',
        hash: '0x7b1c4e912384a9ff001cda87204918ef12847a9e1029',
        status: 'completed',
        timestamp: Date.now() - 86400000 * 2,
        fee: 0.15,
      },
      {
        id: 'tx-03',
        type: 'p2p_buy',
        symbol: 'USDT',
        amount: 100.0,
        fiatValue: 101.0,
        network: 'ethereum',
        hash: '0x33441a98701fe0238194ad8291a0219488bcda819024',
        status: 'completed',
        timestamp: Date.now() - 86400000 * 3,
      },
      {
        id: 'tx-04',
        type: 'referral',
        symbol: 'DCOIN',
        amount: 5.25,
        network: 'dcoine',
        hash: '0x12f45ea9810a4738cb201940129fca98102391023a81',
        status: 'completed',
        timestamp: Date.now() - 86400000 * 4,
      },
    ];
    return this.getItem<TransactionRecord[]>('transactions_history', defaultTxs);
  }

  public static addTransaction(tx: TransactionRecord): void {
    const list = this.getTransactions();
    list.unshift(tx);
    this.setItem('transactions_history', list);
  }

  // News
  public static getNews(): NewsArticle[] {
    return this.getItem<NewsArticle[]>('crypto_news', INITIAL_NEWS);
  }

  public static saveNews(news: NewsArticle[]): void {
    this.setItem('crypto_news', news);
  }

  // DApps
  public static getDApps(): DAppItem[] {
    return this.getItem<DAppItem[]>('dapps_list', INITIAL_DAPPS);
  }

  // Admin Settings
  public static DEFAULT_SWAP_CONFIG: SwapConfig = {
    enabled: true,
    maintenanceMessage: 'DEX Liquidity Swap is temporarily paused for protocol upgrade. Please check back shortly.',
    announcementBanner: '⚡ Zero protocol fee promotion on Dcoine Mainnet swaps!',
    allowCustomTokens: true,
    defaultFromToken: 'DCOIN',
    defaultToToken: 'USDT',
    protocolFeePercent: 0.15,
    feeCollectorAddress: '0x9fa4b2e817c6e0018a99cde3194a02be9761e05a8d90',
    routerName: 'Dcoine Multi-Hop Auto Router',
    routerContractAddress: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    factoryContractAddress: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
    estimatedGasFee: '< $0.05',
    gasLimit: 250000,
    defaultSlippage: 0.5,
    slippagePresets: [0.1, 0.5, 1.0, 2.5],
    minSwapAmountUsd: 1.0,
    maxSwapAmountUsd: 50000.0,
    priceImpactWarningPercent: 5.0,
    supportedNetworks: ['dcoine', 'ethereum', 'bsc', 'solana', 'polygon', 'arbitrum', 'base'],
  };

  public static getAdminSettings(): AdminSettings {
    const defaultSettings: AdminSettings = {
      apiKeys: {
        rpcDcoineEndpoint: 'https://rpc.dcoine.network/v1/mainnet',
        etherscanApiKey: 'ETH_SCAN_7A88B92K119Q',
        coinGeckoApiKey: 'CG-PRO_99824X88A10',
        supabaseProjectUrl: 'https://dcoine-db.supabase.co',
        supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        bscscanApiKey: 'BSC_SCAN_8192X0192',
        customWebhookSecret: 'whsec_99a8b1c4e7f80',
      },
      seo: {
        googleSearchConsoleTag: 'google-site-verification=dcoine_7F819A0192X881',
        googleAnalyticsId: 'G-DCOINE9988',
        googleTagManagerId: 'GTM-DCOINE1',
        facebookPixelId: 'fbq_9918273645',
        googleDomainVerification: 'google-domain-verification=dcoine.network',
        customMetaKeywords: 'crypto mining, dcoine, p2p crypto, non custodial wallet, dex swap, blockchain',
      },
      emails: [
        {
          id: 'email-1',
          subject: 'Welcome to Dcoine Mining 2.0 & Gas Rebates!',
          body: 'Hello Miners,\n\nWe have boosted the network mining pool bonus by 15% for all active sessions. Invite your friends to unlock second-layer rewards.\n\nBest,\nThe Dcoine Ecosystem Team',
          recipientGroup: 'all',
          status: 'sent',
          sentAt: Date.now() - 86400000 * 2,
        },
      ],
      miningConfig: {
        baseRatePerHour: 1.25,
        sessionDurationHours: 24,
        referralBonusPercent: 10,
        minWithdrawalDcoin: 10.0,
      },
      pages: [
        {
          id: 'page-terms',
          slug: 'terms',
          title: 'Terms of Service & Escrow Rules',
          content: 'Dcoine decentralized protocol provides non-custodial smart contracts. Users are solely responsible for safeguarding seed phrases and private keys. All P2P marketplace trades are protected by automated lock contracts until fiat payment is acknowledged.',
          isPublished: true,
          updatedAt: Date.now() - 86400000 * 5,
        },
        {
          id: 'page-privacy',
          slug: 'privacy',
          title: 'Decentralized Privacy Policy',
          content: 'No centralized personal tracking or IP profiling is executed on-chain. Zero-knowledge authentication and encrypted client-side storage guarantee complete self-sovereignty.',
          isPublished: true,
          updatedAt: Date.now() - 86400000 * 5,
        },
      ],
      swapConfig: this.DEFAULT_SWAP_CONFIG,
    };
    const loaded = this.getItem<AdminSettings>('admin_settings', defaultSettings);
    // Ensure swapConfig exists if loaded from older local storage
    if (!loaded.swapConfig) {
      loaded.swapConfig = this.DEFAULT_SWAP_CONFIG;
    }
    return loaded;
  }

  public static saveAdminSettings(settings: AdminSettings): void {
    this.setItem('admin_settings', settings);
  }

  // Swap Config Quick Helpers
  public static getSwapConfig(): SwapConfig {
    return this.getAdminSettings().swapConfig || this.DEFAULT_SWAP_CONFIG;
  }

  public static saveSwapConfig(config: SwapConfig): void {
    const current = this.getAdminSettings();
    current.swapConfig = config;
    this.saveAdminSettings(current);
  }

  // ============================================================================
  // ANNOUNCEMENTS & TICKER BAR
  // ============================================================================
  private static DEFAULT_ANNOUNCEMENTS: AnnouncementItem[] = [
    {
      id: 'ann-1',
      text: '🚀 Mainnet 2.0 Cloud Mining is live! Every active user earns 1 DC every 24h. Referrals boost hashrate by +0.1 DC/24h per active invitee.',
      linkText: 'Start Mining',
      linkUrl: 'mining',
      type: 'reward',
      isActive: true,
      priority: 1,
      createdAt: Date.now() - 86400000,
    },
    {
      id: 'ann-2',
      text: '🛡️ P2P Escrow Marketplace 100% Protected: Zero counterparty risk with audited multi-sig decentralized smart contracts.',
      linkText: 'Explore P2P',
      linkUrl: 'p2p',
      type: 'urgent',
      isActive: true,
      priority: 2,
      createdAt: Date.now() - 86400000 * 2,
    },
    {
      id: 'ann-3',
      text: '⚡ Multi-Chain DEX Swap now supports 7 major blockchains with automated low-slippage routing & liquidity pools.',
      linkText: 'Swap Coins',
      linkUrl: 'swap',
      type: 'event',
      isActive: true,
      priority: 3,
      createdAt: Date.now() - 86400000 * 3,
    },
  ];

  private static DEFAULT_ANNOUNCEMENT_SETTINGS: AnnouncementSettings = {
    isPublished: true, // published by default across all pages
    speedSeconds: 55, // slower, relaxed scroll speed for easy readability
    allowDismiss: true,
  };

  public static getAnnouncements(): AnnouncementItem[] {
    return this.getItem<AnnouncementItem[]>('announcements_list', this.DEFAULT_ANNOUNCEMENTS);
  }

  public static saveAnnouncements(list: AnnouncementItem[]): void {
    this.setItem('announcements_list', list);
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('dcoine_announcements_bus');
        bc.postMessage({ type: 'ANNOUNCEMENTS_UPDATED', payload: list });
        setTimeout(() => bc.close(), 100);
      }
    } catch {}
  }

  public static getAnnouncementSettings(): AnnouncementSettings {
    const settings = this.getItem<AnnouncementSettings>('announcement_settings', this.DEFAULT_ANNOUNCEMENT_SETTINGS);
    // If previously saved with fast speed (e.g. <= 28s), upgrade to slower comfortable 55s
    if (settings && (!settings.speedSeconds || settings.speedSeconds < 40)) {
      settings.speedSeconds = 55;
      this.setItem('announcement_settings', settings);
    }
    return settings;
  }

  public static saveAnnouncementSettings(settings: AnnouncementSettings): void {
    this.setItem('announcement_settings', settings);
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('dcoine_announcements_bus');
        bc.postMessage({ type: 'ANNOUNCEMENT_SETTINGS_UPDATED', payload: settings });
        setTimeout(() => bc.close(), 100);
      }
    } catch {}
  }

  // ============================================================================
  // NOTIFICATIONS (User & Admin)
  // ============================================================================
  private static DEFAULT_NOTIFICATIONS: AppNotification[] = [
    {
      id: 'notif-1',
      recipientRole: 'all',
      title: 'Welcome to Dcoine Ecosystem',
      message: 'Your decentralized multi-chain wallet is ready. Begin 24h cloud mining or explore verified P2P escrow trades.',
      type: 'info',
      linkTab: 'dashboard',
      isRead: false,
      createdAt: Date.now() - 3600000 * 2,
    },
    {
      id: 'notif-2',
      recipientRole: 'user',
      title: 'Mining Session Ready',
      message: 'Your 24-hour mining reward is accumulating! Remember to check your native platform wallet balance.',
      type: 'mining',
      linkTab: 'mining',
      isRead: false,
      createdAt: Date.now() - 3600000 * 4,
    },
    {
      id: 'notif-3',
      recipientRole: 'user',
      title: 'P2P Escrow Protection Active',
      message: 'Zero maker fees and 100% smart contract escrow protection are enabled for all fiat-crypto trades.',
      type: 'trade',
      linkTab: 'p2p',
      isRead: true,
      createdAt: Date.now() - 86400000,
    },
    {
      id: 'notif-4',
      recipientRole: 'admin',
      title: 'Admin Security Health Check',
      message: 'All 7 network RPC endpoints and smart escrow routers are operational. 2FA protection active.',
      type: 'alert',
      linkTab: 'admin',
      isRead: false,
      createdAt: Date.now() - 3600000 * 6,
    },
    {
      id: 'notif-5',
      recipientRole: 'admin',
      title: 'New Merchant Application Submitted',
      message: 'A user requested Verified Merchant Desk status with 500 USDT escrow pledge pending review.',
      type: 'success',
      linkTab: 'admin',
      isRead: false,
      createdAt: Date.now() - 86400000 * 2,
    },
  ];

  public static getNotifications(): AppNotification[] {
    return this.getItem<AppNotification[]>('notifications_list', this.DEFAULT_NOTIFICATIONS);
  }

  public static saveNotifications(list: AppNotification[]): void {
    this.setItem('notifications_list', list);
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('dcoine_notifications_bus');
        bc.postMessage({ type: 'NOTIFICATIONS_UPDATED', payload: list });
        setTimeout(() => bc.close(), 100);
      }
    } catch {}
  }

  public static addNotification(notif: Omit<AppNotification, 'id' | 'createdAt'>): void {
    const list = this.getNotifications();
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: Date.now(),
    };
    this.saveNotifications([newNotif, ...list]);
  }

  // ============================================================================
  // PLATFORM COMMISSION & FEE ENGINE (P2P, Swap, Buy, Sell)
  // ============================================================================
  private static DEFAULT_COMMISSION_CONFIG: PlatformCommissionConfig = {
    isPublished: true, // Master toggle: publish or hide commission rates across pages
    p2pBuyRatePercent: 0.10, // 0.10% buy commission for P2P escrow
    p2pSellRatePercent: 0.20, // 0.20% sell commission for P2P escrow
    swapBuyRatePercent: 0.15, // 0.15% buy/pay commission for DEX swap
    swapSellRatePercent: 0.15, // 0.15% sell/receive commission for DEX swap
    treasuryWalletAddress: '0x71C0F4A972b2c45163D8a0B5d4Ce45Fa91f24A22',
    discountTokenSymbol: 'DCOIN',
    discountPercent: 25, // 25% discount if fees paid in native DCOIN
    rules: [
      {
        id: 'rule-std-global',
        name: 'Standard User Tier (Global)',
        category: 'all',
        buyRatePercent: 0.10,
        sellRatePercent: 0.20,
        minFeeUsd: 0.05,
        fixedFeeUsd: 0.00,
        description: 'Standard platform commission for retail trades and decentralized swaps across all chains.',
        isActive: true,
        isDefault: true,
        createdAt: Date.now() - 86400000 * 10,
      },
      {
        id: 'rule-merchant-p2p',
        name: 'Verified Merchant Tier (P2P)',
        category: 'p2p',
        buyRatePercent: 0.05,
        sellRatePercent: 0.10,
        minFeeUsd: 0.02,
        fixedFeeUsd: 0.00,
        description: 'Preferred low commission for verified merchants maintaining 500+ USDT escrow security pledge.',
        isActive: true,
        isDefault: false,
        createdAt: Date.now() - 86400000 * 8,
      },
      {
        id: 'rule-vip-swap',
        name: 'VIP Liquidity Provider (Swap)',
        category: 'swap',
        buyRatePercent: 0.08,
        sellRatePercent: 0.08,
        minFeeUsd: 0.01,
        fixedFeeUsd: 0.00,
        description: 'Discounted multi-hop swap rate for accounts holding 1,000+ native DCOIN balance.',
        isActive: true,
        isDefault: false,
        createdAt: Date.now() - 86400000 * 5,
      },
      {
        id: 'rule-zero-promo',
        name: 'Zero-Fee Promotional Campaign',
        category: 'all',
        buyRatePercent: 0.00,
        sellRatePercent: 0.00,
        minFeeUsd: 0.00,
        fixedFeeUsd: 0.00,
        description: 'Zero commission promotional campaign tier for community launch events.',
        isActive: false,
        isDefault: false,
        createdAt: Date.now() - 86400000 * 2,
      },
    ],
  };

  public static getCommissionConfig(): PlatformCommissionConfig {
    return this.getItem<PlatformCommissionConfig>('commission_config', this.DEFAULT_COMMISSION_CONFIG);
  }

  public static saveCommissionConfig(config: PlatformCommissionConfig): void {
    this.setItem('commission_config', config);
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('dcoine_commissions_bus');
        bc.postMessage({ type: 'COMMISSIONS_UPDATED', payload: config });
        setTimeout(() => bc.close(), 100);
      }
    } catch {}
  }
}
