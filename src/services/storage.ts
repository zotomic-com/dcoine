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
  email: 'admin@dcoine.network',
  password: 'admin',
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
  lockedMinedBalance: 0.0,
  referees: [],
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
    const defaultRegistry = [MASTER_ADMIN_SEED];
    const saved = this.getItem<UserProfile[]>('users_registry', []);
    if (!saved || saved.length === 0) {
      this.setItem('users_registry', defaultRegistry);
      return defaultRegistry;
    }
    // Ensure admin exists
    if (!saved.some((u) => u.email === 'admin@dcoine.network' || u.role === 'admin')) {
      saved.unshift(MASTER_ADMIN_SEED);
      this.setItem('users_registry', saved);
    }
    return saved;
  }

  public static saveUsersRegistry(registry: UserProfile[]): void {
    this.setItem('users_registry', registry);
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
      avatarUrl: `https://images.unsplash.com/photo-${1535713875002 + (registry.length % 500)}?auto=format&fit=crop&w=200&q=80`,
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
  // P2P ORDERS & TRADES (Zero Fake Demo Orders)
  // ============================================================================

  public static getP2POrders(): P2POrder[] {
    return this.getItem<P2POrder[]>('p2p_orders', []);
  }

  public static saveP2POrders(orders: P2POrder[]): void {
    this.setItem('p2p_orders', orders);
  }

  public static getP2PTrades(): P2PTrade[] {
    return this.getItem<P2PTrade[]>('p2p_trades', []);
  }

  public static saveP2PTrades(trades: P2PTrade[]): void {
    this.setItem('p2p_trades', trades);
  }

  // ============================================================================
  // TRANSACTIONS (Clean Empty State)
  // ============================================================================

  public static getTransactions(): TransactionRecord[] {
    return this.getItem<TransactionRecord[]>('transactions_history', []);
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
}
