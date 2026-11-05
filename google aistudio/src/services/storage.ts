import {
  AdminProfileSettings,
  AdminSettings,
  AnnouncementItem,
  AnnouncementSettings,
  AppNotification,
  BlockchainNetwork,
  CommissionRule,
  DAppItem,
  FullSiteSettings,
  IntegrationSettings,
  MiningSession,
  NewsArticle,
  P2POrder,
  P2PTrade,
  PlatformCommissionConfig,
  Referee,
  RevenueRecord,
  SwapConfig,
  TokenItem,
  TransactionRecord,
  UserProfile,
  UserWallet,
  Employee,
  EmployeeActivityLog,
  FAQItem,
  CMSHeroContent,
  CMSPage,
  CMSPageBlock,
  CMSPageSEO,
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

// Production initial tokens with 0 balance (no fake demo holdings)
const INITIAL_TOKENS: TokenItem[] = [
  {
    id: 'dcoin',
    symbol: 'DCOIN',
    name: 'Dcoine Native',
    network: 'dcoine',
    contractAddress: '0x99dc01e74f1791a8291a27e7d90f7790b83e4a01',
    decimals: 18,
    balance: 0.0,
    priceUsd: 1.48,
    change24h: 12.6,
    iconUrl: '/logo.png',
    lockedBalance: 0.0,
  },
  {
    id: 'eth',
    symbol: 'ETH',
    name: 'Ethereum',
    network: 'ethereum',
    decimals: 18,
    balance: 0.0,
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
    balance: 0.0,
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
    balance: 0.0,
    priceUsd: 1.0,
    change24h: 0.0,
  },
  {
    id: 'bnb',
    symbol: 'BNB',
    name: 'BNB Chain',
    network: 'bsc',
    decimals: 18,
    balance: 0.0,
    priceUsd: 594.8,
    change24h: -0.6,
  },
  {
    id: 'sol',
    symbol: 'SOL',
    name: 'Solana',
    network: 'solana',
    decimals: 9,
    balance: 0.0,
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
    balance: 0.0,
    priceUsd: 89620.0,
    change24h: 3.5,
  },
];

// Production initial news without fake comments
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
    comments: [],
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
    comments: [],
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

// Production Master Admin Seed
const MASTER_ADMIN_SEED: UserProfile = {
  id: 'usr_admin_root',
  username: 'Admin',
  email: 'dcoiner.com@gmail.com',
  password: 'Admin@dcoiner.com',
  referralCode: 'DCOIN-ROOT',
  role: 'admin',
  twoFactorEnabled: true,
  twoFactorSecret: 'JBSWY3DPEHPK3PXP',
  isMerchant: true,
  merchantSecurityPledge: 5000,
  kycStatus: 'verified',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  country: 'United States',
  preferredCurrency: 'USD',
  createdAt: 1700000000000,
  lockedMinedBalance: 1540.0,
  referees: [],
  phone: '+1 (415) 890-2341',
  status: 'active',
  isLoggedIn: true,
  lastLogin: Date.now() - 1800000,
  walletBalance: 25000,
};

const INITIAL_SEED_USERS: UserProfile[] = [
  {
    id: 'usr_alex_v',
    username: 'Alex Vance',
    email: 'alex.vance@cryptomail.org',
    password: 'Password123!',
    referralCode: 'DCOIN-ALEX',
    role: 'user',
    twoFactorEnabled: true,
    isMerchant: false,
    merchantSecurityPledge: 0,
    kycStatus: 'verified',
    avatarUrl: '',
    country: 'United States',
    preferredCurrency: 'USD',
    createdAt: Date.now() - 18 * 86400000,
    lockedMinedBalance: 120.5,
    phone: '+1 (312) 555-0199',
    status: 'active',
    isLoggedIn: true,
    lastLogin: Date.now() - 15 * 60 * 1000,
    walletBalance: 4250,
  },
  {
    id: 'usr_elena_r',
    username: 'Elena Rostova',
    email: 'elena.rostova@berlinfintech.de',
    password: 'Password123!',
    referralCode: 'DCOIN-ELENA',
    role: 'merchant',
    twoFactorEnabled: true,
    isMerchant: true,
    merchantSecurityPledge: 2500,
    kycStatus: 'verified',
    avatarUrl: '',
    country: 'Germany',
    preferredCurrency: 'EUR',
    createdAt: Date.now() - 45 * 86400000,
    lockedMinedBalance: 340.0,
    phone: '+49 152 9018234',
    status: 'active',
    isLoggedIn: true,
    lastLogin: Date.now() - 5 * 60 * 1000,
    walletBalance: 18400,
  },
  {
    id: 'usr_chen_w',
    username: 'Chen Wei',
    email: 'chen.wei@sgdigital.io',
    password: 'Password123!',
    referralCode: 'DCOIN-CHEN',
    role: 'user',
    twoFactorEnabled: false,
    isMerchant: false,
    merchantSecurityPledge: 0,
    kycStatus: 'pending',
    avatarUrl: '',
    country: 'Singapore',
    preferredCurrency: 'USD',
    createdAt: Date.now() - 6 * 3600000, // Today signup!
    lockedMinedBalance: 12.0,
    phone: '+65 9123 4567',
    status: 'active',
    isLoggedIn: true,
    lastLogin: Date.now() - 45 * 60 * 1000,
    walletBalance: 350,
  },
  {
    id: 'usr_sofia_m',
    username: 'Sofia Morales',
    email: 'sofia.m@madridcrypto.es',
    password: 'Password123!',
    referralCode: 'DCOIN-SOFIA',
    role: 'merchant',
    twoFactorEnabled: true,
    isMerchant: true,
    merchantSecurityPledge: 1000,
    kycStatus: 'verified',
    avatarUrl: '',
    country: 'Spain',
    preferredCurrency: 'EUR',
    createdAt: Date.now() - 30 * 86400000,
    lockedMinedBalance: 88.5,
    phone: '+34 612 345678',
    status: 'active',
    isLoggedIn: false,
    lastLogin: Date.now() - 4 * 3600000,
    walletBalance: 9800,
  },
  {
    id: 'usr_marcus_t',
    username: 'Marcus Thorne',
    email: 'm.thorne@londonmining.co.uk',
    password: 'Password123!',
    referralCode: 'DCOIN-MARCUS',
    role: 'user',
    twoFactorEnabled: false,
    isMerchant: false,
    merchantSecurityPledge: 0,
    kycStatus: 'verified',
    avatarUrl: '',
    country: 'United Kingdom',
    preferredCurrency: 'GBP',
    createdAt: Date.now() - 60 * 86400000,
    lockedMinedBalance: 490.0,
    phone: '+44 7700 900123',
    status: 'active',
    isLoggedIn: false,
    lastLogin: Date.now() - 2 * 3600000,
    walletBalance: 1250,
  },
  {
    id: 'usr_priya_p',
    username: 'Priya Patel',
    email: 'priya.patel@mumbaitech.in',
    password: 'Password123!',
    referralCode: 'DCOIN-PRIYA',
    role: 'user',
    twoFactorEnabled: true,
    isMerchant: false,
    merchantSecurityPledge: 0,
    kycStatus: 'verified',
    avatarUrl: '',
    country: 'India',
    preferredCurrency: 'INR',
    createdAt: Date.now() - 14 * 3600000, // Today signup!
    lockedMinedBalance: 5.5,
    phone: '+91 98201 12345',
    status: 'active',
    isLoggedIn: false,
    lastLogin: Date.now() - 12 * 3600000,
    walletBalance: 780,
  },
  {
    id: 'usr_liam_o',
    username: 'Liam O Connor',
    email: 'liam.oc@dublinledger.ie',
    password: 'Password123!',
    referralCode: 'DCOIN-LIAM',
    role: 'user',
    twoFactorEnabled: false,
    isMerchant: false,
    merchantSecurityPledge: 0,
    kycStatus: 'pending',
    avatarUrl: '',
    country: 'Ireland',
    preferredCurrency: 'EUR',
    createdAt: Date.now() - 3 * 86400000,
    lockedMinedBalance: 45.0,
    phone: '+353 87 2345678',
    status: 'active',
    isLoggedIn: false,
    lastLogin: Date.now() - 8 * 3600000,
    walletBalance: 2100,
  },
  {
    id: 'usr_amara_o',
    username: 'Amara Okafor',
    email: 'amara.okafor@lagosnode.ng',
    password: 'Password123!',
    referralCode: 'DCOIN-AMARA',
    role: 'user',
    twoFactorEnabled: true,
    isMerchant: false,
    merchantSecurityPledge: 0,
    kycStatus: 'verified',
    avatarUrl: '',
    country: 'Nigeria',
    preferredCurrency: 'USD',
    createdAt: Date.now() - 22 * 3600000, // Yesterday signup!
    lockedMinedBalance: 28.0,
    phone: '+234 803 1234567',
    status: 'active',
    isLoggedIn: false,
    lastLogin: Date.now() - 18 * 3600000,
    walletBalance: 450,
  },
  {
    id: 'usr_kenji_s',
    username: 'Kenji Sato',
    email: 'kenji.sato@tokyoblock.jp',
    password: 'Password123!',
    referralCode: 'DCOIN-KENJI',
    role: 'user',
    twoFactorEnabled: false,
    isMerchant: false,
    merchantSecurityPledge: 0,
    kycStatus: 'unverified',
    avatarUrl: '',
    country: 'Japan',
    preferredCurrency: 'JPY',
    createdAt: Date.now() - 10 * 86400000,
    lockedMinedBalance: 0,
    phone: '+81 90 1234 5678',
    status: 'suspended',
    isLoggedIn: false,
    lastLogin: Date.now() - 72 * 3600000,
    walletBalance: 120,
  },
  {
    id: 'usr_david_m',
    username: 'David Miller',
    email: 'd.miller@torontomine.ca',
    password: 'Password123!',
    referralCode: 'DCOIN-DAVID',
    role: 'user',
    twoFactorEnabled: true,
    isMerchant: false,
    merchantSecurityPledge: 0,
    kycStatus: 'verified',
    avatarUrl: '',
    country: 'Canada',
    preferredCurrency: 'USD',
    createdAt: Date.now() - 90 * 86400000,
    lockedMinedBalance: 610.0,
    phone: '+1 (416) 555-7890',
    status: 'active',
    isLoggedIn: false,
    lastLogin: Date.now() - 6 * 3600000,
    walletBalance: 3890,
  },
];

const DEFAULT_P2P_ORDERS_SEED: P2POrder[] = [
  {
    id: 'ord_p2p_01',
    userId: 'usr_elena_r',
    type: 'sell',
    merchantName: 'Elena Rostova',
    merchantEmail: 'elena.rostova@berlinfintech.de',
    merchantPhone: '+49 152 9018234',
    merchantRating: 99.4,
    completedOrdersCount: 420,
    cryptoSymbol: 'USDT',
    fiatCurrency: 'EUR',
    price: 0.92,
    minLimit: 100,
    maxLimit: 5000,
    availableAmount: 5430,
    paymentMethods: ['SEPA Instant', 'Revolut', 'Wise'],
    terms: 'Instant SEPA transfer only. Payment will be released within 3 minutes of confirmation. Please include order ID in reference.',
    status: 'active',
    avgReleaseTimeMinutes: 2.8,
    createdAt: Date.now() - 4 * 3600000,
    location: 'Berlin, Germany',
    country: 'Germany',
    ipAddress: '84.115.22.10',
    buyerName: 'Liam O Connor',
    buyerEmail: 'liam.oc@dublinledger.ie',
    buyerPhone: '+353 87 2345678',
    sellerName: 'Elena Rostova',
    sellerEmail: 'elena.rostova@berlinfintech.de',
    sellerPhone: '+49 152 9018234',
  },
  {
    id: 'ord_p2p_02',
    userId: 'usr_alex_v',
    type: 'buy',
    merchantName: 'Alex Vance',
    merchantEmail: 'alex.vance@cryptomail.org',
    merchantPhone: '+1 (312) 555-0199',
    merchantRating: 98.7,
    completedOrdersCount: 285,
    cryptoSymbol: 'BTC',
    fiatCurrency: 'USD',
    price: 68450,
    minLimit: 250,
    maxLimit: 15000,
    availableAmount: 0.85,
    paymentMethods: ['Bank Wire', 'Zelle', 'Cash App'],
    terms: 'Verified US accounts only. Fast escrow lock. No third party transfers accepted.',
    status: 'active',
    avgReleaseTimeMinutes: 4.2,
    createdAt: Date.now() - 12 * 3600000,
    location: 'Chicago, USA',
    country: 'United States',
    ipAddress: '198.51.100.42',
    buyerName: 'Alex Vance',
    buyerEmail: 'alex.vance@cryptomail.org',
    buyerPhone: '+1 (312) 555-0199',
    sellerName: 'Sofia Morales',
    sellerEmail: 'sofia.m@madridcrypto.es',
    sellerPhone: '+34 612 345678',
  },
  {
    id: 'ord_p2p_03',
    userId: 'usr_sofia_m',
    type: 'buy',
    merchantName: 'Sofia Morales',
    merchantEmail: 'sofia.m@madridcrypto.es',
    merchantPhone: '+34 612 345678',
    merchantRating: 100,
    completedOrdersCount: 168,
    cryptoSymbol: 'USDT',
    fiatCurrency: 'USD',
    price: 1.002,
    minLimit: 50,
    maxLimit: 3200,
    availableAmount: 3200,
    paymentMethods: ['PayPal', 'Wise', 'Bizum'],
    terms: 'Escrow auto-funds immediately. Quick releases for 100% verified KYC buyers.',
    status: 'active',
    avgReleaseTimeMinutes: 1.9,
    createdAt: Date.now() - 2 * 3600000,
    location: 'Madrid, Spain',
    country: 'Spain',
    ipAddress: '172.56.21.99',
    buyerName: 'Chen Wei',
    buyerEmail: 'chen.wei@sgdigital.io',
    buyerPhone: '+65 9123 4567',
    sellerName: 'Sofia Morales',
    sellerEmail: 'sofia.m@madridcrypto.es',
    sellerPhone: '+34 612 345678',
  },
  {
    id: 'ord_p2p_04',
    userId: 'usr_marcus_t',
    type: 'sell',
    merchantName: 'Marcus Thorne',
    merchantEmail: 'm.thorne@londonmining.co.uk',
    merchantPhone: '+44 7700 900123',
    merchantRating: 97.5,
    completedOrdersCount: 94,
    cryptoSymbol: 'DCOIN',
    fiatCurrency: 'GBP',
    price: 0.15,
    minLimit: 20,
    maxLimit: 2500,
    availableAmount: 16500,
    paymentMethods: ['UK Faster Payments', 'Revolut'],
    terms: 'Freshly mined DCOIN tokens straight from protocol pool. 0% escrow fee on UK transfers.',
    status: 'active',
    avgReleaseTimeMinutes: 3.5,
    createdAt: Date.now() - 8 * 86400000,
    location: 'London, UK',
    country: 'United Kingdom',
    ipAddress: '81.187.30.12',
    buyerName: 'David Miller',
    buyerEmail: 'd.miller@torontomine.ca',
    buyerPhone: '+1 (416) 555-7890',
    sellerName: 'Marcus Thorne',
    sellerEmail: 'm.thorne@londonmining.co.uk',
    sellerPhone: '+44 7700 900123',
  },
  {
    id: 'ord_p2p_05',
    userId: 'usr_priya_p',
    type: 'buy',
    merchantName: 'Priya Patel',
    merchantEmail: 'priya.patel@mumbaitech.in',
    merchantPhone: '+91 98201 12345',
    merchantRating: 99.0,
    completedOrdersCount: 62,
    cryptoSymbol: 'DCOIN',
    fiatCurrency: 'INR',
    price: 12.8,
    minLimit: 500,
    maxLimit: 120000,
    availableAmount: 9500,
    paymentMethods: ['UPI', 'IMPS', 'Paytm'],
    terms: 'Instant UPI payments 24/7. Please provide payment screenshot in trade chat for instant escrow release.',
    status: 'completed',
    avgReleaseTimeMinutes: 2.1,
    createdAt: Date.now() - 14 * 86400000,
    location: 'Mumbai, India',
    country: 'India',
    ipAddress: '103.21.244.2',
    buyerName: 'Priya Patel',
    buyerEmail: 'priya.patel@mumbaitech.in',
    buyerPhone: '+91 98201 12345',
    sellerName: 'Amara Okafor',
    sellerEmail: 'amara.okafor@lagosnode.ng',
    sellerPhone: '+234 803 1234567',
  },
  {
    id: 'ord_p2p_06',
    userId: 'usr_kenji_s',
    type: 'sell',
    merchantName: 'Kenji Sato',
    merchantEmail: 'kenji.sato@tokyoblock.jp',
    merchantPhone: '+81 90 1234 5678',
    merchantRating: 84.0,
    completedOrdersCount: 22,
    cryptoSymbol: 'BTC',
    fiatCurrency: 'JPY',
    price: 10450000,
    minLimit: 50000,
    maxLimit: 2000000,
    availableAmount: 0.35,
    paymentMethods: ['Line Pay', 'Bank Wire'],
    terms: 'Trade on pause pending identity review.',
    status: 'paused',
    avgReleaseTimeMinutes: 15.0,
    createdAt: Date.now() - 6 * 86400000,
    location: 'Tokyo, Japan',
    country: 'Japan',
    ipAddress: '133.242.18.5',
    sellerName: 'Kenji Sato',
    sellerEmail: 'kenji.sato@tokyoblock.jp',
    sellerPhone: '+81 90 1234 5678',
  },
];

const DEFAULT_TRANSACTIONS_SEED: TransactionRecord[] = [
  {
    id: 'tx_01',
    type: 'swap',
    symbol: 'DCOIN',
    amount: 14500,
    fiatValue: 2175.0,
    network: 'ethereum',
    hash: '0x8f2a1b94d8c7e012fa49321b069d3e819a77c31b99a0d2e4f55b12876543110a',
    from: '0x321aB04928e1FaB88E12A3492De919488aB01249',
    to: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    fromUserName: 'Alex Vance',
    fromUserEmail: 'alex.vance@cryptomail.org',
    toUserName: 'Dcoine DEX AutoRouter',
    toUserEmail: 'router@dcoine.network',
    status: 'completed',
    timestamp: Date.now() - 18 * 60 * 1000,
    fee: 4.85,
    blockNumber: 19842104,
    gasUsed: '124,520 (21 Gwei)',
  },
  {
    id: 'tx_02',
    type: 'deposit',
    symbol: 'USDT',
    amount: 5000,
    fiatValue: 5000.0,
    network: 'bsc',
    hash: '0x1b4c99ef44d1829038ba71629d81726a99281099238810293881029482910283',
    from: '0x55d398326f99059fF775485246999027B3197955',
    to: '0x9fa4b2e817c6e0018a99cde3194a02be9761e05a8d90',
    fromUserName: 'Elena Rostova',
    fromUserEmail: 'elena.rostova@berlinfintech.de',
    toUserName: 'Dcoine Treasury Vault',
    toUserEmail: 'treasury@dcoine.network',
    status: 'completed',
    timestamp: Date.now() - 42 * 60 * 1000,
    fee: 0.28,
    blockNumber: 38921840,
    gasUsed: '48,190 (3 Gwei)',
  },
  {
    id: 'tx_03',
    type: 'p2p_buy',
    symbol: 'USDT',
    amount: 850,
    fiatValue: 850.0,
    network: 'polygon',
    hash: '0x4d9177a012938481726354819283746192837461827364519283746182930192',
    from: '0x88921FaB01928374619283746192837461928374',
    to: '0x1293847561928374619283746192837461928374',
    fromUserName: 'Sofia Morales',
    fromUserEmail: 'sofia.m@madridcrypto.es',
    toUserName: 'Chen Wei',
    toUserEmail: 'chen.wei@sgdigital.io',
    status: 'completed',
    timestamp: Date.now() - 95 * 60 * 1000,
    fee: 0.12,
    blockNumber: 56910294,
    gasUsed: '72,400 (35 Gwei)',
  },
  {
    id: 'tx_04',
    type: 'mine',
    symbol: 'DCOIN',
    amount: 24.5,
    fiatValue: 3.67,
    network: 'dcoine',
    hash: '0x992ae04218273645192837461829301928374619283746182930192837461928',
    from: '0x000000000000000000000000000000000000dC01',
    to: '0x99812FaB01928374619283746192837461928374',
    fromUserName: 'Dcoine Cloud Mining Pool',
    fromUserEmail: 'miner-daemon@dcoine.network',
    toUserName: 'Marcus Thorne',
    toUserEmail: 'm.thorne@londonmining.co.uk',
    status: 'completed',
    timestamp: Date.now() - 3 * 3600000,
    fee: 0.001,
    blockNumber: 429104,
    gasUsed: '21,000 (1 Gwei)',
  },
  {
    id: 'tx_05',
    type: 'swap',
    symbol: 'BTC',
    amount: 0.25,
    fiatValue: 17112.5,
    network: 'bitcoin',
    hash: 'a81255f192837461928374619283746192837461928374619283746192837461',
    from: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
    to: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    fromUserName: 'Liam O Connor',
    fromUserEmail: 'liam.oc@dublinledger.ie',
    toUserName: 'Liquidity Router BTC Pool',
    toUserEmail: 'pool-btc@dcoine.network',
    status: 'completed',
    timestamp: Date.now() - 5 * 3600000,
    fee: 6.40,
    blockNumber: 852190,
    gasUsed: '240 vBytes (18 sat/vB)',
  },
  {
    id: 'tx_06',
    type: 'withdraw',
    symbol: 'SOL',
    amount: 18.5,
    fiatValue: 3145.0,
    network: 'solana',
    hash: '5KtQ99zx19283746192837461928374619283746192837461928374619283746',
    from: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    to: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
    fromUserName: 'Dcoine Hot Custody Wallet',
    fromUserEmail: 'security@dcoine.network',
    toUserName: 'Priya Patel',
    toUserEmail: 'priya.patel@mumbaitech.in',
    status: 'completed',
    timestamp: Date.now() - 8 * 3600000,
    fee: 0.002,
    blockNumber: 268194012,
    gasUsed: '5,000 Compute Units',
  },
  {
    id: 'tx_07',
    type: 'p2p_sell',
    symbol: 'USDT',
    amount: 2400,
    fiatValue: 2400.0,
    network: 'bsc',
    hash: '0x77c2110a19283746192837461928374619283746192837461928374619283746',
    from: '0x44812FaB01928374619283746192837461928374',
    to: '0x66812FaB01928374619283746192837461928374',
    fromUserName: 'David Miller',
    fromUserEmail: 'd.miller@torontomine.ca',
    toUserName: 'Amara Okafor',
    toUserEmail: 'amara.okafor@lagosnode.ng',
    status: 'pending',
    timestamp: Date.now() - 15 * 60 * 1000,
    fee: 0.35,
    blockNumber: 38922150,
    gasUsed: '64,000 (3 Gwei)',
  },
  {
    id: 'tx_08',
    type: 'swap',
    symbol: 'ETH',
    amount: 1.2,
    fiatValue: 3960.0,
    network: 'arbitrum',
    hash: '0x221f88bc19283746192837461928374619283746192837461928374619283746',
    from: '0x11812FaB01928374619283746192837461928374',
    to: '0x99812FaB01928374619283746192837461928374',
    fromUserName: 'Kenji Sato',
    fromUserEmail: 'kenji.sato@tokyoblock.jp',
    toUserName: 'Arbitrum Bridge Liquidity',
    toUserEmail: 'bridge@dcoine.network',
    status: 'failed',
    timestamp: Date.now() - 24 * 3600000,
    fee: 1.85,
    blockNumber: 210948210,
    gasUsed: '89,200 (0.1 Gwei)',
  },
];

const DEFAULT_REVENUE_RECORDS: RevenueRecord[] = [
  {
    id: 'rev_01',
    type: 'p2p_sell',
    title: 'P2P Escrow Sell Fee (Trade #TRD-8821)',
    grossAmount: 5000.0,
    platformFeeAmount: 25.0,
    feeRatePercent: 0.50,
    currency: 'USD',
    timestamp: Date.now() - 4 * 3600000,
    status: 'credited',
    sourceDetails: {
      tradeId: 'TRD-8821',
      userOrMerchant: 'Elena Rostova',
      network: 'BSC',
    },
  },
  {
    id: 'rev_02',
    type: 'swap_sell',
    title: 'DEX Liquidity Swap Fee (Tx #0x8f2a...c31b)',
    grossAmount: 14500.0,
    platformFeeAmount: 36.25,
    feeRatePercent: 0.25,
    currency: 'USD',
    timestamp: Date.now() - 18 * 60 * 1000,
    status: 'credited',
    sourceDetails: {
      txHash: '0x8f2a...c31b',
      userOrMerchant: 'Alex Vance',
      network: 'Ethereum',
    },
  },
  {
    id: 'rev_03',
    type: 'swap_sell',
    title: 'DEX BTC Multi-Hop Swap Fee',
    grossAmount: 17112.5,
    platformFeeAmount: 42.78,
    feeRatePercent: 0.25,
    currency: 'USD',
    timestamp: Date.now() - 5 * 3600000,
    status: 'credited',
    sourceDetails: {
      txHash: 'a812...55f1',
      userOrMerchant: 'Liam O Connor',
      network: 'Bitcoin',
    },
  },
  {
    id: 'rev_04',
    type: 'p2p_sell',
    title: 'P2P Escrow Sell Fee (Trade #TRD-7612)',
    grossAmount: 3200.0,
    platformFeeAmount: 16.0,
    feeRatePercent: 0.50,
    currency: 'USD',
    timestamp: Date.now() - 2 * 3600000,
    status: 'credited',
    sourceDetails: {
      tradeId: 'TRD-7612',
      userOrMerchant: 'Sofia Morales',
      network: 'Polygon',
    },
  },
  {
    id: 'rev_05',
    type: 'ad_revenue',
    title: 'Google AdSense Daily Impression Monetization',
    grossAmount: 94.50,
    platformFeeAmount: 94.50,
    feeRatePercent: 100,
    currency: 'USD',
    timestamp: Date.now() - 12 * 3600000,
    status: 'settled',
    sourceDetails: {
      adNetwork: 'Google AdSense',
      impressionCount: 42190,
    },
  },
  {
    id: 'rev_06',
    type: 'ad_revenue',
    title: 'Direct Crypto Banner Sponsorship (Header Slot)',
    grossAmount: 250.0,
    platformFeeAmount: 250.0,
    feeRatePercent: 100,
    currency: 'USD',
    timestamp: Date.now() - 36 * 3600000,
    status: 'settled',
    sourceDetails: {
      adNetwork: 'Direct Web3 Sponsor (LedgerX)',
      impressionCount: 88500,
    },
  },
];

const DEFAULT_SITE_SETTINGS: FullSiteSettings = {
  siteName: 'Dcoine Network',
  siteUrl: 'https://dcoine.network',
  supportEmail: 'support@dcoine.network',
  supportTelegram: '@dcoine_official',
  supportPhone: '+1 (888) 326-4631',
  maintenanceMode: false,
  maintenanceNotice: 'Dcoine network scheduled maintenance. Core blockchain services remain fully operational.',
  baseMiningRate: 1.25,
  sessionDurationHours: 24,
  minWithdrawalDcoin: 10.0,
  referralMiningBonusPercent: 10,
  minDepositUsd: 10.0,
  maxDepositUsd: 100000.0,
  minWithdrawalUsd: 20.0,
  dailyWithdrawalLimitUsd: 50000.0,
  gasMultiplier: 1.15,
  swapFeePercent: 0.25,
  p2pSellFeePercent: 0.50,
  treasuryWalletAddress: '0x9fa4b2e817c6e0018a99cde3194a02be9761e05a8d90',
  enforce2FaWithdrawals: true,
  enforceKycP2P: true,
  autoFreezeSuspicious: true,
};

const DEFAULT_INTEGRATION_SETTINGS: IntegrationSettings = {
  geminiApiKey: 'AIzaSyDcoine_SampleLiveIntegrationKey_99182',
  rpcDcoineEndpoint: 'https://rpc.dcoine.network/v1/mainnet',
  etherscanApiKey: 'ETH_SCAN_7A88B92K119Q',
  bscscanApiKey: 'BSC_SCAN_8192X0192',
  polygonRpc: 'https://polygon-rpc.com',
  solanaRpc: 'https://api.mainnet-beta.solana.com',
  coinGeckoApiKey: 'CG-PRO_99824X88A10',
  webhookUrl: 'https://api.dcoine.network/v1/webhooks/blockchain-events',
  webhookSecret: 'whsec_99a8b1c4e7f80dcoine2026',
  metaTitle: 'Dcoine - Decentralized Coin Ecosystem & Cloud Mining',
  metaDescription: 'Next-generation decentralized blockchain ecosystem featuring 24h cloud mining, multi-chain non-custodial wallet management, P2P escrow trading, and DEX swap.',
  metaKeywords: 'crypto, dcoine, cloud mining, p2p escrow, dex swap, decentralized wallet, web3',
  ogImageUrl: 'https://dcoine.network/logo.png',
  twitterHandle: '@DcoineNetwork',
  canonicalUrl: 'https://dcoine.network',
  robotsTxt: 'User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: https://dcoine.network/sitemap.xml',
  googleAnalyticsId: 'G-DCOINE9988',
  metaPixelId: 'fbq_9918273645',
  tikTokPixelId: 'tt_dcoine_pixel_77',
  googleTagManagerId: 'GTM-DCOINE1',
  adSensePublisherId: 'pub-8192849182948192',
  enableHeaderBanner: true,
  enableSidebarBanner: true,
  enableMiningBanner: true,
  simulatedAdsRevenueUsd: 1420.50,
};

const DEFAULT_ADMIN_PROFILE: AdminProfileSettings = {
  name: 'Chief Administrator',
  username: 'Admin',
  email: 'dcoiner.com@gmail.com',
  phone: '+1 (415) 890-2341',
  country: 'United States',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  roleTitle: 'Super Administrator',
  twoFactorEnabled: true,
  twoFactorSecret: 'JBSWY3DPEHPK3PXP',
};

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

  // ============================================================================
  // USER ACCOUNTS REGISTRY & AUTHENTICATION
  // ============================================================================

  /**
   * Get all persistent registered user accounts in system
   */
  public static getUsersRegistry(): UserProfile[] {
    const defaultRegistry = [MASTER_ADMIN_SEED, ...INITIAL_SEED_USERS];
    const saved = this.getItem<UserProfile[]>('users_registry', []);
    if (!saved || saved.length <= 1) {
      this.setItem('users_registry', defaultRegistry);
      return defaultRegistry;
    }
    // Ensure admin exists
    if (!saved.some((u) => u.email === 'dcoiner.com@gmail.com' || u.role === 'admin')) {
      saved.unshift(MASTER_ADMIN_SEED);
      this.setItem('users_registry', saved);
    }
    return saved;
  }

  public static saveUsersRegistry(registry: UserProfile[]): void {
    this.setItem('users_registry', registry);
  }

  public static addUser(user: UserProfile): void {
    const list = this.getUsersRegistry();
    list.unshift(user);
    this.saveUsersRegistry(list);
  }

  public static updateUser(updated: UserProfile): void {
    const list = this.getUsersRegistry();
    const idx = list.findIndex((u) => u.id === updated.id);
    if (idx !== -1) {
      list[idx] = updated;
      this.saveUsersRegistry(list);
    }
    const current = this.getUser();
    if (current && current.id === updated.id) {
      this.saveUser(updated);
    }
  }

  public static deleteUser(userId: string): boolean {
    const list = this.getUsersRegistry();
    const target = list.find((u) => u.id === userId);
    if (target?.role === 'admin') {
      return false; // protect root admin
    }
    const filtered = list.filter((u) => u.id !== userId);
    this.saveUsersRegistry(filtered);
    return true;
  }

  /**
   * Active User Session: null when logged out (guest)
   */
  public static getUser(): UserProfile | null {
    return this.getItem<UserProfile | null>('active_user', null);
  }

  public static saveUser(user: UserProfile | null): void {
    this.setItem('active_user', user);
    if (user) {
      // Also sync user profile into registry
      const registry = this.getUsersRegistry();
      const updatedRegistry = registry.map((u) => (u.id === user.id ? user : u));
      if (!updatedRegistry.some((u) => u.id === user.id)) {
        updatedRegistry.push(user);
      }
      this.saveUsersRegistry(updatedRegistry);
    }
  }

  /**
   * Register a new user account with MANDATORY referral attribution
   */
  public static registerUser(payload: {
    username: string;
    email: string;
    password?: string;
    referralCode: string;
  }): { success: boolean; user?: UserProfile; error?: string } {
    const registry = this.getUsersRegistry();
    const cleanEmail = payload.email.trim().toLowerCase();
    const cleanUsername = payload.username.trim();
    const cleanRefCode = payload.referralCode.trim().toUpperCase();

    // Check if user already exists
    if (registry.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'An account with this email address already exists. Please sign in.' };
    }
    if (registry.some((u) => u.username.toLowerCase() === cleanUsername.toLowerCase())) {
      return { success: false, error: 'Username is already taken. Please choose another username.' };
    }

    // MANDATORY REFERRAL CHECK: Look up referrer in registry
    let referrerUser: UserProfile | null = null;
    if (cleanRefCode) {
      referrerUser = registry.find((u) => u.referralCode.toUpperCase() === cleanRefCode) || null;
    }

    if (!referrerUser && cleanRefCode !== 'DCOIN-MAIN') {
      return {
        success: false,
        error: `Referral code "${cleanRefCode}" is invalid. Please provide a valid inviter's referral code to join the mining pool.`,
      };
    }

    // Generate unique referral code for this new user
    let newReferralCode = generateReferralCode('DCOIN');
    while (registry.some((u) => u.referralCode === newReferralCode)) {
      newReferralCode = generateReferralCode('DCOIN');
    }

    const newUser: UserProfile = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      username: cleanUsername,
      email: cleanEmail,
      password: payload.password?.trim() || 'password',
      referralCode: newReferralCode,
      referredBy: referrerUser ? referrerUser.referralCode : cleanRefCode,
      role: 'user',
      twoFactorEnabled: false,
      twoFactorSecret: 'JBSWY3DPEHPK3PXP',
      isMerchant: false,
      merchantSecurityPledge: 0,
      kycStatus: 'verified',
      avatarUrl: '',
      country: 'United States',
      preferredCurrency: 'USD',
      createdAt: Date.now(),
      lockedMinedBalance: 0.0,
      referees: [],
    };

    // If referrer was found, credit the referral directly into referrer's account!
    if (referrerUser) {
      const newRefereeEntry: Referee = {
        id: `ref-${newUser.id}`,
        name: newUser.username,
        email: newUser.email,
        joinedAt: Date.now(),
        status: 'active',
        dcoinEarnedBonus: 0.0,
      };

      const referrerReferees = referrerUser.referees || [];
      referrerUser.referees = [newRefereeEntry, ...referrerReferees];

      // Add a system notification for the referrer
      this.addNotification({
        recipientRole: 'user',
        userId: referrerUser.id,
        title: 'New Referee Joined Your Mining Pool!',
        message: `${newUser.username} registered using your referral code ${referrerUser.referralCode}. Your 24h mining hashrate bonus increased!`,
        type: 'success',
        linkTab: 'mining',
        isRead: false,
      });

      // Update referrer in registry
      const updatedRegistry = registry.map((u) => (u.id === referrerUser!.id ? referrerUser! : u));
      updatedRegistry.push(newUser);
      this.saveUsersRegistry(updatedRegistry);
    } else {
      registry.push(newUser);
      this.saveUsersRegistry(registry);
    }

    // Set active user session
    this.saveUser(newUser);

    // Initialize fresh native wallet for this user with 0 balance
    const userWallet: UserWallet = {
      id: `w-${newUser.id}`,
      name: `${newUser.username}'s Dcoine Vault`,
      address: generateAddress(),
      mnemonicPhrase: generateMnemonic(),
      privateKey: generatePrivateKey(),
      network: 'dcoine',
      isNative: true,
      lockedBalance: 0.0,
      createdAt: Date.now(),
    };
    this.saveWallets([userWallet]);

    // Initialize fresh 0-balance mining session
    this.saveMiningSession({
      isActive: false,
      startTime: null,
      endTime: null,
      baseRatePerHour: parseFloat((1 / 24).toFixed(6)),
      boostMultiplier: 1.0,
      currentSessionMined: 0,
      totalMinedLifetime: 0,
      lastClaimTime: null,
      consecutiveDays: 0,
      referralRatePerActiveRef: parseFloat((0.1 / 24).toFixed(6)),
      lockedMinedBalance: 0,
    });

    return { success: true, user: newUser };
  }

  /**
   * Log in an existing user or admin
   */
  public static loginUser(
    emailOrUsername: string,
    password?: string
  ): { success: boolean; user?: UserProfile; error?: string } {
    const registry = this.getUsersRegistry();
    const query = emailOrUsername.trim().toLowerCase();

    const matchedUser = registry.find(
      (u) => u.email.toLowerCase() === query || u.username.toLowerCase() === query
    );

    if (!matchedUser) {
      return { success: false, error: 'No account found with this username or email.' };
    }

    if (password && matchedUser.password && matchedUser.password !== password.trim()) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    this.saveUser(matchedUser);

    // Broadcast session update
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('dcoine_session_bus');
        bc.postMessage({ type: 'USER_LOGGED_IN', user: matchedUser });
        setTimeout(() => bc.close(), 100);
      }
    } catch {}

    return { success: true, user: matchedUser };
  }

  /**
   * Log out active user and reset session
   */
  public static logoutUser(): void {
    localStorage.removeItem(this.STORAGE_PREFIX + 'active_user');
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('dcoine_session_bus');
        bc.postMessage({ type: 'USER_LOGGED_OUT' });
        setTimeout(() => bc.close(), 100);
      }
    } catch {}
  }

  // ============================================================================
  // WALLETS (Zero Demo Balances)
  // ============================================================================

  public static getWallets(): UserWallet[] {
    const existing = this.getItem<UserWallet[]>('user_wallets', []);
    if (existing.length > 0) return existing;

    const defaultAddress = generateAddress();
    const defaultMnemonic = generateMnemonic();
    const defaultPrivateKey = generatePrivateKey();

    const initialWallets: UserWallet[] = [
      {
        id: 'w-primary',
        name: 'Main Dcoine Vault',
        address: defaultAddress,
        mnemonicPhrase: defaultMnemonic,
        privateKey: defaultPrivateKey,
        network: 'dcoine',
        isNative: true,
        lockedBalance: 0.0,
        createdAt: Date.now(),
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
    return NETWORKS.find((n) => n.id === netId) || NETWORKS[0];
  }

  public static setActiveNetwork(networkId: string): void {
    this.setItem('active_network_id', networkId);
  }

  // Tokens (All initial balances 0)
  public static getTokens(): TokenItem[] {
    return this.getItem<TokenItem[]>('tokens_list', INITIAL_TOKENS);
  }

  public static saveTokens(tokens: TokenItem[]): void {
    this.setItem('tokens_list', tokens);
  }

  // ============================================================================
  // MINING SESSION (Zero Demo Mined Lifetime)
  // ============================================================================

  public static getMiningSession(): MiningSession {
    const defaultSession: MiningSession = {
      isActive: false,
      startTime: null,
      endTime: null,
      baseRatePerHour: parseFloat((1 / 24).toFixed(6)), // 24h = 1 DC
      boostMultiplier: 1.0,
      currentSessionMined: 0,
      totalMinedLifetime: 0.0,
      lastClaimTime: null,
      consecutiveDays: 0,
      referralRatePerActiveRef: parseFloat((0.1 / 24).toFixed(6)),
      lockedMinedBalance: 0.0,
    };
    return this.getItem<MiningSession>('mining_session', defaultSession);
  }

  public static saveMiningSession(session: MiningSession): void {
    this.setItem('mining_session', session);
  }

  // ============================================================================
  // REFERRALS (Linked to active user)
  // ============================================================================

  public static getReferees(): Referee[] {
    const user = this.getUser();
    if (!user) return [];
    // Read from user in registry
    const registry = this.getUsersRegistry();
    const liveUser = registry.find((u) => u.id === user.id);
    return liveUser?.referees || user.referees || [];
  }

  public static saveReferees(referees: Referee[]): void {
    const user = this.getUser();
    if (user) {
      user.referees = referees;
      this.saveUser(user);
    }
  }

  // ============================================================================
  // P2P ORDERS & TRADES
  // ============================================================================

  public static getP2POrders(): P2POrder[] {
    const list = this.getItem<P2POrder[]>('p2p_orders', []);
    if (!list || list.length === 0) {
      this.setItem('p2p_orders', DEFAULT_P2P_ORDERS_SEED);
      return DEFAULT_P2P_ORDERS_SEED;
    }
    return list;
  }

  public static saveP2POrders(orders: P2POrder[]): void {
    this.setItem('p2p_orders', orders);
  }

  public static addP2POrder(order: P2POrder): void {
    const list = this.getP2POrders();
    list.unshift(order);
    this.saveP2POrders(list);
  }

  public static updateP2POrder(updated: P2POrder): void {
    const list = this.getP2POrders();
    const idx = list.findIndex((o) => o.id === updated.id);
    if (idx !== -1) {
      list[idx] = updated;
      this.saveP2POrders(list);
    }
  }

  public static deleteP2POrder(orderId: string): void {
    const list = this.getP2POrders();
    const filtered = list.filter((o) => o.id !== orderId);
    this.saveP2POrders(filtered);
  }

  public static getP2PTrades(): P2PTrade[] {
    return this.getItem<P2PTrade[]>('p2p_trades', []);
  }

  public static saveP2PTrades(trades: P2PTrade[]): void {
    this.setItem('p2p_trades', trades);
  }

  // ============================================================================
  // TRANSACTIONS
  // ============================================================================

  public static getTransactions(): TransactionRecord[] {
    const list = this.getItem<TransactionRecord[]>('transactions_history', []);
    if (!list || list.length === 0) {
      this.setItem('transactions_history', DEFAULT_TRANSACTIONS_SEED);
      return DEFAULT_TRANSACTIONS_SEED;
    }
    return list;
  }

  public static saveTransactions(txs: TransactionRecord[]): void {
    this.setItem('transactions_history', txs);
  }

  public static addTransaction(tx: TransactionRecord): void {
    const list = this.getTransactions();
    list.unshift(tx);
    this.setItem('transactions_history', list);
  }

  // ============================================================================
  // REVENUE & EARNINGS
  // ============================================================================

  public static getRevenueRecords(): RevenueRecord[] {
    const list = this.getItem<RevenueRecord[]>('revenue_records', []);
    if (!list || list.length === 0) {
      this.setItem('revenue_records', DEFAULT_REVENUE_RECORDS);
      return DEFAULT_REVENUE_RECORDS;
    }
    return list;
  }

  public static saveRevenueRecords(records: RevenueRecord[]): void {
    this.setItem('revenue_records', records);
  }

  public static addRevenueRecord(record: RevenueRecord): void {
    const list = this.getRevenueRecords();
    list.unshift(record);
    this.saveRevenueRecords(list);
  }

  // ============================================================================
  // FULL SITE SETTINGS & INTEGRATIONS & ADMIN PROFILE
  // ============================================================================

  public static getSiteSettings(): FullSiteSettings {
    return this.getItem<FullSiteSettings>('full_site_settings', DEFAULT_SITE_SETTINGS);
  }

  public static saveSiteSettings(settings: FullSiteSettings): void {
    this.setItem('full_site_settings', settings);
  }

  public static getIntegrationSettings(): IntegrationSettings {
    return this.getItem<IntegrationSettings>('integration_settings', DEFAULT_INTEGRATION_SETTINGS);
  }

  public static saveIntegrationSettings(settings: IntegrationSettings): void {
    this.setItem('integration_settings', settings);
  }

  public static DEFAULT_ADMIN_AVATAR_PRESETS: string[] = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
  ];

  public static getAdminAvatarPresets(): string[] {
    return this.getItem<string[]>('admin_avatar_presets', this.DEFAULT_ADMIN_AVATAR_PRESETS);
  }

  public static saveAdminAvatarPresets(presets: string[]): void {
    this.setItem('admin_avatar_presets', presets);
  }

  public static getAdminProfileSettings(): AdminProfileSettings {
    return this.getItem<AdminProfileSettings>('admin_profile_settings', DEFAULT_ADMIN_PROFILE);
  }

  public static saveAdminProfileSettings(profile: AdminProfileSettings): void {
    this.setItem('admin_profile_settings', profile);
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
    if (!loaded.swapConfig) {
      loaded.swapConfig = this.DEFAULT_SWAP_CONFIG;
    }
    return loaded;
  }

  public static saveAdminSettings(settings: AdminSettings): void {
    this.setItem('admin_settings', settings);
  }

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
    isPublished: true,
    speedSeconds: 55,
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
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
    };
    this.saveNotifications([newNotif, ...list]);
  }

  // ============================================================================
  // PLATFORM COMMISSION & FEE ENGINE (P2P, Swap, Buy, Sell)
  // ============================================================================

  private static DEFAULT_COMMISSION_CONFIG: PlatformCommissionConfig = {
    isPublished: true,
    p2pBuyRatePercent: 0.1,
    p2pSellRatePercent: 0.2,
    swapBuyRatePercent: 0.15,
    swapSellRatePercent: 0.15,
    treasuryWalletAddress: '0x71C0F4A972b2c45163D8a0B5d4Ce45Fa91f24A22',
    discountTokenSymbol: 'DCOIN',
    discountPercent: 25,
    rules: [
      {
        id: 'rule-std-global',
        name: 'Standard User Tier (Global)',
        category: 'all',
        buyRatePercent: 0.1,
        sellRatePercent: 0.2,
        minFeeUsd: 0.05,
        fixedFeeUsd: 0.0,
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
        sellRatePercent: 0.1,
        minFeeUsd: 0.02,
        fixedFeeUsd: 0.0,
        description: 'Preferred low commission for verified merchants maintaining 500+ USDT escrow security pledge.',
        isActive: true,
        isDefault: false,
        createdAt: Date.now() - 86400000 * 8,
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

  // ============================================================================
  // CMS CONTENT MANAGEMENT SYSTEM (Hero, FAQs, Articles, Pages)
  // ============================================================================

  private static DEFAULT_HERO_CONTENT: CMSHeroContent = {
    headline: 'Decentralized Non-Custodial Multi-Chain Ecosystem &',
    highlightWord: '24h Cloud Mining',
    subheadline: 'Trade crypto securely with zero counterparty risk through audited P2P escrow, swap cross-chain tokens instantly, and mine DC tokens with high-yield boost.',
    primaryCtaText: 'Start Mining DC Now',
    secondaryCtaText: 'Explore P2P Escrow',
    badgeText: 'Dcoine Mainnet 2.0 Live & Audited',
    promoBannerText: '⚡ Zero protocol fee promotion on Dcoine Mainnet swaps + 15% Hashrate Boost this week!',
    isBannerActive: true,
    stats: [
      { label: 'Active Miners', value: '148,200+' },
      { label: '24h P2P Volume', value: '$12.4M' },
      { label: 'Supported Chains', value: '7 Chains' },
      { label: 'Escrow Success Rate', value: '99.98%' },
    ],
  };

  public static getHeroContent(): CMSHeroContent {
    return this.getItem<CMSHeroContent>('cms_hero_content', this.DEFAULT_HERO_CONTENT);
  }

  public static saveHeroContent(hero: CMSHeroContent): void {
    this.setItem('cms_hero_content', hero);
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('dcoine_cms_bus');
        bc.postMessage({ type: 'HERO_UPDATED', payload: hero });
        setTimeout(() => bc.close(), 100);
      }
    } catch {}
  }

  private static DEFAULT_FAQS: FAQItem[] = [
    {
      id: 'faq-1',
      question: 'How does Dcoine 24h Cloud Mining work?',
      answer: 'Users can activate one cloud mining cycle every 24 hours with zero hardware wear. Mining rewards accumulate in real time based on the active network hashrate and referral multipliers. Claimed DC tokens are credited directly to your non-custodial platform wallet.',
      category: 'mining',
      order: 1,
      isPublished: true,
      updatedAt: Date.now() - 86400000 * 3,
    },
    {
      id: 'faq-2',
      question: 'How does the P2P Escrow smart contract protect buyers and sellers?',
      answer: 'When a trade is initiated, the seller crypto is instantly locked into an audited decentralized escrow smart contract. The seller cannot withdraw or run away with the funds. Once the buyer pays fiat and the seller confirms receipt, the escrow contract releases the crypto automatically.',
      category: 'p2p',
      order: 2,
      isPublished: true,
      updatedAt: Date.now() - 86400000 * 4,
    },
    {
      id: 'faq-3',
      question: 'Are my private keys and seed phrases custodial?',
      answer: 'No. Dcoine is 100% non-custodial. Your 12-word recovery seed and private keys are encrypted locally on your device with AES-256. Neither Dcoine administrators nor staff ever have access to your keys.',
      category: 'security',
      order: 3,
      isPublished: true,
      updatedAt: Date.now() - 86400000 * 5,
    },
    {
      id: 'faq-4',
      question: 'What are the DEX Swap fees and supported chains?',
      answer: 'Dcoine Auto-Router supports 7 major blockchains (Dcoine Mainnet, Ethereum, BNB Smart Chain, Solana, Polygon, Arbitrum, Base). Swaps feature deep aggregated liquidity with 0.15% standard protocol fee and automated multi-hop routing.',
      category: 'wallet',
      order: 4,
      isPublished: true,
      updatedAt: Date.now() - 86400000 * 6,
    },
  ];

  public static getFAQs(): FAQItem[] {
    return this.getItem<FAQItem[]>('cms_faqs', this.DEFAULT_FAQS);
  }

  public static saveFAQs(faqs: FAQItem[]): void {
    this.setItem('cms_faqs', faqs);
  }

  public static addFAQ(faq: Omit<FAQItem, 'id' | 'updatedAt'>): FAQItem {
    const list = this.getFAQs();
    const newFaq: FAQItem = {
      ...faq,
      id: `faq-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      updatedAt: Date.now(),
    };
    this.saveFAQs([newFaq, ...list]);
    return newFaq;
  }

  public static updateFAQ(faq: FAQItem): void {
    const list = this.getFAQs();
    const index = list.findIndex((f) => f.id === faq.id);
    if (index !== -1) {
      list[index] = { ...faq, updatedAt: Date.now() };
      this.saveFAQs([...list]);
    }
  }

  public static deleteFAQ(id: string): void {
    const list = this.getFAQs().filter((f) => f.id !== id);
    this.saveFAQs(list);
  }

  public static addNewsArticle(article: Omit<NewsArticle, 'id'>): NewsArticle {
    const list = this.getNews();
    const newArticle: NewsArticle = {
      ...article,
      id: `news-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    this.saveNews([newArticle, ...list]);
    return newArticle;
  }

  public static updateNewsArticle(article: NewsArticle): void {
    const list = this.getNews();
    const idx = list.findIndex((a) => a.id === article.id);
    if (idx !== -1) {
      list[idx] = article;
      this.saveNews([...list]);
    }
  }

  public static deleteNewsArticle(id: string): void {
    const list = this.getNews().filter((a) => a.id !== id);
    this.saveNews(list);
  }

  public static updatePage(pageId: string, title: string, content: string, isPublished: boolean): void {
    const settings = this.getAdminSettings();
    if (!settings.pages) settings.pages = [];
    const idx = settings.pages.findIndex((p) => p.id === pageId || p.slug === pageId);
    if (idx !== -1) {
      settings.pages[idx] = {
        ...settings.pages[idx],
        title,
        content,
        isPublished,
        updatedAt: Date.now(),
      };
    } else {
      settings.pages.push({
        id: pageId,
        slug: pageId,
        title,
        content,
        isPublished,
        updatedAt: Date.now(),
      });
    }
    this.saveAdminSettings(settings);
  }

  // ============================================================================
  // CMS PAGES & BUILDER (Blocks, Text, Image, Video, Layout, Colors, SEO)
  // ============================================================================

  private static DEFAULT_CMS_PAGES: CMSPage[] = [
    {
      id: 'page-terms',
      slug: 'terms',
      title: 'Terms of Service & Escrow Rules',
      subtitle: 'Decentralized Smart Contract Terms & P2P Trading Regulations',
      isPublished: true,
      isSystemPage: true,
      createdAt: Date.now() - 86400000 * 30,
      updatedAt: Date.now() - 86400000 * 2,
      author: 'Legal & Compliance Desk',
      blocks: [
        {
          id: 'b-terms-1',
          type: 'hero',
          heading: 'Decentralized Protocol Terms & Non-Custodial Agreement',
          subheading: 'Please review our smart contract arbitration rules, escrow release conditions, and security safeguards.',
          alignment: 'center',
          containerWidth: 'medium',
          paddingY: 'relaxed',
          bgTheme: 'midnight_gradient',
          accentColor: 'amber',
          hasBorder: true,
        },
        {
          id: 'b-terms-2',
          type: 'text',
          heading: '1. Non-Custodial Protocol Operations',
          text: 'Dcoine operates as a sovereign non-custodial decentralized platform. Users maintain full cryptographic ownership of their private keys and 12-word seed phrases. Dcoine administrators, staff, and smart contract operators cannot access user balances, seize native wallets, or initiate unauthorized transactions on behalf of any participant.',
          alignment: 'left',
          containerWidth: 'medium',
          paddingY: 'normal',
          bgTheme: 'slate_card',
          accentColor: 'amber',
          hasBorder: false,
        },
        {
          id: 'b-terms-3',
          type: 'text',
          heading: '2. P2P Escrow Guarantee & Dispute Arbitration',
          text: 'All fiat-to-crypto trades conducted via the Dcoine P2P Marketplace are protected by automated lock contracts. Crypto assets remain securely locked in the decentralized escrow until the seller confirms fiat receipt. In the event of conflicting claims, verified moderators arbitrate based on signed banking payment advice.',
          alignment: 'left',
          containerWidth: 'medium',
          paddingY: 'normal',
          bgTheme: 'slate_dark',
          accentColor: 'amber',
          hasBorder: true,
        },
      ],
      seo: {
        metaTitle: 'Terms of Service & Escrow Rules | Dcoine Network',
        metaDescription: 'Official terms of service, non-custodial wallet responsibilities, and decentralized P2P escrow arbitration protocol rules for Dcoine users.',
        tags: ['terms', 'escrow rules', 'non-custodial', 'arbitration', 'crypto trading'],
        ogTitle: 'Terms of Service & Escrow Rules – Dcoine Protocol',
        ogDescription: 'Read the official smart contract terms and escrow rules governing the Dcoine decentralized ecosystem.',
        ogImageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80',
        canonicalUrl: 'https://dcoine.network/terms',
        robotsDirective: 'index, follow',
        schemaType: 'WebPage',
      },
    },
    {
      id: 'page-privacy',
      slug: 'privacy',
      title: 'Decentralized Privacy Policy',
      subtitle: 'Zero-Knowledge Privacy, Local Client Encryption & Data Protection',
      isPublished: true,
      isSystemPage: true,
      createdAt: Date.now() - 86400000 * 30,
      updatedAt: Date.now() - 86400000 * 2,
      author: 'Data Privacy Officer',
      blocks: [
        {
          id: 'b-priv-1',
          type: 'hero',
          heading: 'Zero-Knowledge Self-Sovereign Privacy Policy',
          subheading: 'We believe privacy is a fundamental human right. Learn how your cryptographic keys and identities remain protected.',
          alignment: 'center',
          containerWidth: 'medium',
          paddingY: 'relaxed',
          bgTheme: 'midnight_gradient',
          accentColor: 'blue',
          hasBorder: true,
        },
        {
          id: 'b-priv-2',
          type: 'text',
          heading: '1. Local Client-Side AES-256 Storage',
          text: 'All private keys, mnemonics, and personal credentials are encrypted on the client device before touching any persistent storage. No centralized surveillance or behavioral tracking is executed against on-chain transactions.',
          alignment: 'left',
          containerWidth: 'medium',
          paddingY: 'normal',
          bgTheme: 'slate_card',
          accentColor: 'blue',
          hasBorder: false,
        },
      ],
      seo: {
        metaTitle: 'Decentralized Privacy Policy | Dcoine Network',
        metaDescription: 'Learn how Dcoine safeguards your sovereignty with zero-knowledge authentication, client-side AES encryption, and decentralized privacy.',
        tags: ['privacy policy', 'zero-knowledge', 'AES-256', 'crypto security', 'data sovereignty'],
        ogTitle: 'Decentralized Privacy Policy – Dcoine',
        ogDescription: 'Zero tracking. Client-side encryption. Transparent on-chain privacy.',
        ogImageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1200&q=80',
        canonicalUrl: 'https://dcoine.network/privacy',
        robotsDirective: 'index, follow',
        schemaType: 'WebPage',
      },
    },
    {
      id: 'page-about',
      slug: 'about',
      title: 'About Dcoine Ecosystem & Mission',
      subtitle: 'Democratizing Global Web3 Access via 24h Cloud Mining & P2P Freedom',
      isPublished: true,
      isSystemPage: false,
      createdAt: Date.now() - 86400000 * 20,
      updatedAt: Date.now() - 86400000 * 1,
      author: 'Core Contributors',
      blocks: [
        {
          id: 'b-about-1',
          type: 'hero',
          heading: 'The Sovereign Financial Layer for Everyone',
          subheading: 'Built to empower individuals worldwide with decentralized cloud mining, fee-less P2P trades, and cross-chain liquidity.',
          alignment: 'center',
          containerWidth: 'wide',
          paddingY: 'spacious',
          bgTheme: 'amber_subtle',
          accentColor: 'amber',
          hasBorder: true,
        },
        {
          id: 'b-about-2',
          type: 'image',
          heading: 'Global Multi-Chain Decentralized Architecture',
          imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80',
          imageAlt: 'Dcoine Multi-Chain Protocol Illustration',
          imageCaption: 'Seamlessly bridging Dcoine Mainnet, Ethereum, BNB Smart Chain, Solana, Polygon, Arbitrum & Base.',
          alignment: 'center',
          containerWidth: 'medium',
          paddingY: 'normal',
          bgTheme: 'slate_card',
          accentColor: 'amber',
          hasBorder: true,
        },
        {
          id: 'b-about-3',
          type: 'video',
          heading: 'Video Overview: How Dcoine 24h Cloud Mining Works',
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          alignment: 'center',
          containerWidth: 'medium',
          paddingY: 'normal',
          bgTheme: 'slate_dark',
          accentColor: 'amber',
          hasBorder: true,
        },
        {
          id: 'b-about-4',
          type: 'cta',
          heading: 'Ready to Start Mining & Trading?',
          subheading: 'Join over 148,000 active global miners and start accumulating DCOIN with zero hardware costs.',
          ctaText: 'Launch Cloud Mining',
          ctaUrl: 'mining',
          alignment: 'center',
          containerWidth: 'medium',
          paddingY: 'relaxed',
          bgTheme: 'midnight_gradient',
          accentColor: 'amber',
          hasBorder: true,
        },
      ],
      seo: {
        metaTitle: 'About Dcoine Ecosystem & Mission | Web3 Cloud Mining',
        metaDescription: 'Discover Dcoine mission: democratizing decentralized finance with 24h proof-of-engagement cloud mining, multi-chain non-custodial vaults, and P2P escrow.',
        tags: ['about dcoine', 'cloud mining', 'web3', 'p2p trading', 'crypto mission', 'blockchain'],
        ogTitle: 'About Dcoine – The Sovereign Financial Layer',
        ogDescription: 'Democratizing decentralized cloud mining and P2P trading across 7 blockchains.',
        ogImageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80',
        canonicalUrl: 'https://dcoine.network/about',
        robotsDirective: 'index, follow',
        schemaType: 'AboutPage',
      },
    },
  ];

  public static getCMSPages(): CMSPage[] {
    return this.getItem<CMSPage[]>('cms_custom_pages', this.DEFAULT_CMS_PAGES);
  }

  public static saveCMSPages(pages: CMSPage[]): void {
    this.setItem('cms_custom_pages', pages);
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('dcoine_cms_pages_bus');
        bc.postMessage({ type: 'PAGES_UPDATED', payload: pages });
        setTimeout(() => bc.close(), 100);
      }
    } catch {}
  }

  public static getCMSPageBySlug(slug: string): CMSPage | undefined {
    const list = this.getCMSPages();
    return list.find((p) => p.slug === slug || p.id === slug);
  }

  public static addCMSPage(page: Omit<CMSPage, 'id' | 'createdAt' | 'updatedAt'>): CMSPage {
    const list = this.getCMSPages();
    const newPage: CMSPage = {
      ...page,
      id: `page-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [newPage, ...list];
    this.saveCMSPages(updated);
    return newPage;
  }

  public static updateCMSPage(page: CMSPage): void {
    const list = this.getCMSPages();
    const idx = list.findIndex((p) => p.id === page.id);
    if (idx !== -1) {
      list[idx] = { ...page, updatedAt: Date.now() };
      this.saveCMSPages([...list]);
    }
  }

  public static deleteCMSPage(id: string): void {
    const list = this.getCMSPages().filter((p) => p.id !== id);
    this.saveCMSPages(list);
  }

  // ============================================================================
  // STAFF & TEAM MANAGEMENT (Managers & Moderators + Activity Logs)
  // ============================================================================

  private static DEFAULT_EMPLOYEES: Employee[] = [
    {
      id: 'emp-001',
      name: 'Marcus Vance',
      email: 'marcus.vance@dcoine.network',
      phone: '+1 (555) 234-8901',
      role: 'manager',
      department: 'P2P Escrow & Fraud Prevention',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      status: 'active',
      permissions: ['kyc_approval', 'p2p_disputes', 'user_moderation', 'refund_escalation', 'transaction_audit'],
      assignedTicketsCount: 14,
      actionsCount: 382,
      lastActive: Date.now() - 1000 * 60 * 12,
      joinedAt: Date.now() - 86400000 * 180,
      notes: 'Senior compliance lead handling tier-3 merchant verification and cross-border escrow resolutions.',
    },
    {
      id: 'emp-002',
      name: 'Elena Rostova',
      email: 'elena.rostova@dcoine.network',
      phone: '+44 20 7946 0912',
      role: 'moderator',
      department: 'KYC Compliance & Verification',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      status: 'active',
      permissions: ['kyc_approval', 'user_moderation'],
      assignedTicketsCount: 9,
      actionsCount: 614,
      lastActive: Date.now() - 1000 * 60 * 4,
      joinedAt: Date.now() - 86400000 * 120,
      notes: 'Specialist in European AML passport vetting and biometric matching audits.',
    },
    {
      id: 'emp-003',
      name: 'Kenji Takahashi',
      email: 'kenji.t@dcoine.network',
      phone: '+81 3 5555 0143',
      role: 'manager',
      department: 'Content, CMS & Community',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      status: 'active',
      permissions: ['cms_publishing', 'announcements_management', 'news_editorial', 'community_broadcast'],
      assignedTicketsCount: 5,
      actionsCount: 247,
      lastActive: Date.now() - 1000 * 60 * 45,
      joinedAt: Date.now() - 86400000 * 90,
      notes: 'Manages official announcements, market research blogs, and homepage campaigns.',
    },
    {
      id: 'emp-004',
      name: 'Sophia Al-Mansoor',
      email: 'sophia.m@dcoine.network',
      phone: '+971 4 312 8900',
      role: 'moderator',
      department: 'P2P Escrow & Disputes',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
      status: 'active',
      permissions: ['p2p_disputes', 'suspicious_flagging'],
      assignedTicketsCount: 18,
      actionsCount: 429,
      lastActive: Date.now() - 1000 * 60 * 18,
      joinedAt: Date.now() - 86400000 * 60,
      notes: 'Handles high-volume Middle East & Asian fiat banking transfer receipts verification.',
    },
    {
      id: 'emp-005',
      name: "David O'Connor",
      email: 'david.oc@dcoine.network',
      phone: '+1 (555) 489-3321',
      role: 'moderator',
      department: 'Risk & Transaction Audit',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
      status: 'suspended',
      permissions: ['transaction_audit'],
      assignedTicketsCount: 0,
      actionsCount: 118,
      lastActive: Date.now() - 86400000 * 7,
      joinedAt: Date.now() - 86400000 * 200,
      notes: 'Temporary access restriction pending internal security review rotation.',
    },
  ];

  public static getEmployees(): Employee[] {
    return this.getItem<Employee[]>('admin_employees_list', this.DEFAULT_EMPLOYEES);
  }

  public static saveEmployees(list: Employee[]): void {
    this.setItem('admin_employees_list', list);
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('dcoine_employees_bus');
        bc.postMessage({ type: 'EMPLOYEES_UPDATED', payload: list });
        setTimeout(() => bc.close(), 100);
      }
    } catch {}
  }

  public static addEmployee(
    emp: Omit<Employee, 'id' | 'assignedTicketsCount' | 'actionsCount' | 'lastActive' | 'joinedAt'>
  ): Employee {
    const list = this.getEmployees();
    const newEmployee: Employee = {
      ...emp,
      id: `emp-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      assignedTicketsCount: 0,
      actionsCount: 1,
      lastActive: Date.now(),
      joinedAt: Date.now(),
    };
    const updated = [newEmployee, ...list];
    this.saveEmployees(updated);

    // Record creation activity
    this.addEmployeeActivity({
      employeeId: newEmployee.id,
      employeeName: newEmployee.name,
      employeeRole: newEmployee.role,
      actionType: 'login',
      actionTitle: `Employee Account Created`,
      targetDetails: `Assigned role ${newEmployee.role.toUpperCase()} in ${newEmployee.department}`,
      ipAddress: '127.0.0.1 (System)',
      status: 'success',
      notes: 'Initial account credentials provisioned by Root Admin.',
    });

    return newEmployee;
  }

  public static updateEmployee(emp: Employee): void {
    const list = this.getEmployees();
    const idx = list.findIndex((e) => e.id === emp.id);
    if (idx !== -1) {
      list[idx] = { ...emp, lastActive: Date.now() };
      this.saveEmployees([...list]);
    }
  }

  public static deleteEmployee(id: string): void {
    const list = this.getEmployees().filter((e) => e.id !== id);
    this.saveEmployees(list);
  }

  private static DEFAULT_ACTIVITY_LOGS: EmployeeActivityLog[] = [
    {
      id: 'act-001',
      employeeId: 'emp-001',
      employeeName: 'Marcus Vance',
      employeeRole: 'manager',
      actionType: 'p2p_escrow_released',
      actionTitle: 'Released P2P Escrow',
      targetDetails: 'Order #P2P-10492 ($3,500 USDT) - Payment receipt confirmed by bank wire',
      ipAddress: '192.168.1.104',
      timestamp: Date.now() - 1000 * 60 * 15,
      status: 'success',
      notes: 'Seller confirmed fiat receipt after bank delay was resolved.',
    },
    {
      id: 'act-002',
      employeeId: 'emp-002',
      employeeName: 'Elena Rostova',
      employeeRole: 'moderator',
      actionType: 'kyc_approved',
      actionTitle: 'Approved KYC Level 2',
      targetDetails: 'User @oliver_queen (ID: u-88124) - Passport and live face biometric verified',
      ipAddress: '185.220.101.5',
      timestamp: Date.now() - 1000 * 60 * 32,
      status: 'success',
    },
    {
      id: 'act-003',
      employeeId: 'emp-003',
      employeeName: 'Kenji Takahashi',
      employeeRole: 'manager',
      actionType: 'cms_article_published',
      actionTitle: 'Published News Article',
      targetDetails: 'Article: "Bitcoin Surges Past $90K as Institutional Inflows Hit Record High"',
      ipAddress: '118.103.24.99',
      timestamp: Date.now() - 1000 * 60 * 55,
      status: 'success',
    },
    {
      id: 'act-004',
      employeeId: 'emp-004',
      employeeName: 'Sophia Al-Mansoor',
      employeeRole: 'moderator',
      actionType: 'dispute_resolved',
      actionTitle: 'Resolved Escrow Dispute',
      targetDetails: 'Dispute #DISP-9921 - Ruled in favor of Buyer (@dcoin_whale) with signed SWIFT advice',
      ipAddress: '94.200.45.12',
      timestamp: Date.now() - 1000 * 60 * 120,
      status: 'success',
    },
    {
      id: 'act-005',
      employeeId: 'emp-002',
      employeeName: 'Elena Rostova',
      employeeRole: 'moderator',
      actionType: 'kyc_rejected',
      actionTitle: 'Rejected Fraudulent KYC',
      targetDetails: 'User @crypto_ghost - Altered utility bill detected during automated optical check',
      ipAddress: '185.220.101.5',
      timestamp: Date.now() - 1000 * 60 * 180,
      status: 'flagged',
      notes: 'Fraud attempt flagged to Risk and IP blacklisted.',
    },
    {
      id: 'act-006',
      employeeId: 'emp-001',
      employeeName: 'Marcus Vance',
      employeeRole: 'manager',
      actionType: 'user_banned',
      actionTitle: 'Permanently Banned Malicious Account',
      targetDetails: 'User @scam_arbiter - Repeated chargeback attempts on P2P marketplace',
      ipAddress: '192.168.1.104',
      timestamp: Date.now() - 1000 * 60 * 240,
      status: 'success',
    },
    {
      id: 'act-007',
      employeeId: 'emp-003',
      employeeName: 'Kenji Takahashi',
      employeeRole: 'manager',
      actionType: 'ticker_updated',
      actionTitle: 'Updated Header Announcement Ticker',
      targetDetails: 'Added "🚀 Mainnet 2.0 Cloud Mining is live! Earn DC tokens every 24h"',
      ipAddress: '118.103.24.99',
      timestamp: Date.now() - 1000 * 60 * 360,
      status: 'success',
    },
  ];

  public static getEmployeeActivityLogs(employeeId?: string): EmployeeActivityLog[] {
    const list = this.getItem<EmployeeActivityLog[]>('admin_employee_activity_logs', this.DEFAULT_ACTIVITY_LOGS);
    if (employeeId) {
      return list.filter((a) => a.employeeId === employeeId);
    }
    return list;
  }

  public static saveEmployeeActivityLogs(logs: EmployeeActivityLog[]): void {
    this.setItem('admin_employee_activity_logs', logs);
  }

  public static addEmployeeActivity(log: Omit<EmployeeActivityLog, 'id' | 'timestamp'>): void {
    const list = this.getEmployeeActivityLogs();
    const newLog: EmployeeActivityLog = {
      ...log,
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
    };
    this.saveEmployeeActivityLogs([newLog, ...list]);
  }
}
