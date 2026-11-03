export type NetworkId = 'dcoine' | 'ethereum' | 'bsc' | 'solana' | 'polygon' | 'arbitrum' | 'base';

export interface BlockchainNetwork {
  id: NetworkId;
  name: string;
  symbol: string;
  rpcUrl: string;
  chainId: number;
  explorerUrl: string;
  iconBg: string;
  badgeColor: string;
}

export interface TokenItem {
  id: string;
  symbol: string;
  name: string;
  network: NetworkId;
  contractAddress?: string;
  decimals: number;
  balance: number;
  priceUsd: number;
  change24h: number;
  iconUrl?: string;
  isCustom?: boolean;
  enabledInSwap?: boolean;
  lockedBalance?: number; // Mined DC locked in native platform wallet
}

export interface UserWallet {
  id: string;
  name: string;
  address: string;
  mnemonicPhrase?: string; // 12-word seed
  privateKey?: string;
  network: NetworkId;
  isExternal?: boolean;
  provider?: string;
  createdAt: number;
  isNative?: boolean; // Platform native DC wallet
  lockedBalance?: number; // Mined DC locked permanently in native wallet
}

export interface MiningSession {
  isActive: boolean;
  startTime: number | null; // ms
  endTime: number | null; // ms (24h after start)
  baseRatePerHour: number; // 1/24 = 0.041667 DC/hr (24h = 1 DC)
  boostMultiplier: number; // Multiplier from active referrals
  currentSessionMined: number;
  totalMinedLifetime: number;
  lastClaimTime: number | null;
  consecutiveDays: number;
  referralRatePerActiveRef?: number; // 0.1/24 = 0.004167 DC/hr (10 active refs = 1 DC/24h)
  lockedMinedBalance?: number;
}

export interface Referee {
  id: string;
  name: string;
  email: string;
  joinedAt: number;
  status: 'active' | 'idle';
  dcoinEarnedBonus: number;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  referralCode: string;
  referredBy?: string;
  role: 'user' | 'admin';
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  isMerchant: boolean;
  merchantSecurityPledge: number;
  kycStatus: 'unverified' | 'pending' | 'verified';
  avatarUrl: string;
  country?: string;
  preferredCurrency?: string;
  createdAt: number;
  lockedMinedBalance?: number; // Mined DC locked in native platform wallet
}

export interface P2POrder {
  id: string;
  userId: string;
  type: 'buy' | 'sell';
  merchantName: string;
  merchantRating: number; // 0-100%
  completedOrdersCount: number;
  cryptoSymbol: string;
  fiatCurrency: string;
  price: number;
  minLimit: number;
  maxLimit: number;
  availableAmount: number;
  paymentMethods: string[];
  terms: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  avgReleaseTimeMinutes: number;
  createdAt: number;
}

export interface P2PTrade {
  id: string;
  orderId: string;
  type: 'buy' | 'sell';
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  cryptoSymbol: string;
  cryptoAmount: number;
  fiatCurrency: string;
  fiatAmount: number;
  paymentMethod: string;
  status: 'waiting_payment' | 'paid_escrow_locked' | 'released' | 'disputed' | 'cancelled';
  escrowLockedAt: number;
  expiresAt: number;
  escrowTxHash: string;
  messages: Array<{
    id: string;
    sender: string;
    text: string;
    timestamp: number;
    isSystem?: boolean;
  }>;
}

export interface TransactionRecord {
  id: string;
  type: 'mine' | 'deposit' | 'withdraw' | 'swap' | 'p2p_buy' | 'p2p_sell' | 'referral';
  symbol: string;
  amount: number;
  fiatValue?: number;
  network: NetworkId;
  hash: string;
  from?: string;
  to?: string;
  status: 'completed' | 'pending' | 'failed';
  timestamp: number;
  fee?: number;
}

export interface NewsComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  timestamp: number;
  likes: number;
}

export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  source: string;
  sourceUrl: string;
  imageUrl: string;
  category: 'Bitcoin' | 'Ethereum' | 'DeFi' | 'Dcoine' | 'Regulation' | 'Markets' | 'Layer 2' | string;
  publishedAt: string;
  readTime: string;
  likes: number;
  comments: NewsComment[];
}

export interface DAppItem {
  id: string;
  name: string;
  category: 'DEX' | 'DeFi' | 'NFT' | 'Staking' | 'Bridge' | 'Gaming';
  description: string;
  url: string;
  iconBg: string;
  badge: string;
  rating: number;
  chain: string;
}

export interface SwapConfig {
  enabled: boolean;
  maintenanceMessage: string;
  announcementBanner: string;
  allowCustomTokens: boolean;
  defaultFromToken: string;
  defaultToToken: string;
  protocolFeePercent: number;
  feeCollectorAddress: string;
  routerName: string;
  routerContractAddress: string;
  factoryContractAddress: string;
  estimatedGasFee: string;
  gasLimit: number;
  defaultSlippage: number;
  slippagePresets: number[];
  minSwapAmountUsd: number;
  maxSwapAmountUsd: number;
  priceImpactWarningPercent: number;
  supportedNetworks: NetworkId[];
}

export interface AdminSettings {
  apiKeys: {
    rpcDcoineEndpoint: string;
    etherscanApiKey: string;
    coinGeckoApiKey: string;
    supabaseProjectUrl: string;
    supabaseAnonKey: string;
    bscscanApiKey: string;
    customWebhookSecret: string;
  };
  seo: {
    googleSearchConsoleTag: string;
    googleAnalyticsId: string;
    googleTagManagerId: string;
    facebookPixelId: string;
    googleDomainVerification: string;
    customMetaKeywords: string;
  };
  emails: Array<{
    id: string;
    subject: string;
    body: string;
    recipientGroup: 'all' | 'miners' | 'merchants';
    scheduledFor?: string;
    status: 'sent' | 'scheduled' | 'draft';
    sentAt?: number;
  }>;
  miningConfig: {
    baseRatePerHour: number;
    sessionDurationHours: number;
    referralBonusPercent: number;
    minWithdrawalDcoin: number;
  };
  pages: Array<{
    id: string;
    slug: string;
    title: string;
    content: string;
    isPublished: boolean;
    updatedAt: number;
  }>;
  swapConfig: SwapConfig;
  commissionConfig?: PlatformCommissionConfig;
}

export interface CommissionRule {
  id: string;
  name: string;
  category: 'all' | 'p2p' | 'swap';
  buyRatePercent: number;
  sellRatePercent: number;
  minFeeUsd: number;
  fixedFeeUsd: number;
  description: string;
  isActive: boolean;
  isDefault?: boolean;
  createdAt: number;
}

export interface PlatformCommissionConfig {
  isPublished: boolean; // Master toggle to publish or hide commission rates across pages
  p2pBuyRatePercent: number;
  p2pSellRatePercent: number;
  swapBuyRatePercent: number;
  swapSellRatePercent: number;
  treasuryWalletAddress: string;
  discountTokenSymbol: string;
  discountPercent: number;
  rules: CommissionRule[];
}

export interface AnnouncementItem {
  id: string;
  text: string;
  linkText?: string;
  linkUrl?: string;
  type: 'info' | 'urgent' | 'event' | 'reward' | 'update';
  isActive: boolean;
  priority: number;
  createdAt: number;
}

export interface AnnouncementSettings {
  isPublished: boolean; // Toggle to publish or hide ticker bar across all pages
  speedSeconds: number; // e.g. 25
  allowDismiss: boolean;
}

export interface AppNotification {
  id: string;
  recipientRole: 'all' | 'user' | 'admin';
  userId?: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert' | 'trade' | 'mining';
  linkTab?: string;
  isRead: boolean;
  createdAt: number;
}

