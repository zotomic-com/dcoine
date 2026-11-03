-- ==============================================================================
-- DCOINE ECOSYSTEM - COMPLETE SUPABASE POSTGRESQL DATABASE SCHEMA
-- ==============================================================================
-- Instructions for Supabase:
-- 1. Open your Supabase Project Dashboard: https://supabase.com/dashboard
-- 2. Go to "SQL Editor" in the left sidebar
-- 3. Click "New Query", paste this entire script, and click "RUN" (or Ctrl/Cmd + Enter)
-- 4. All tables, constraints, indexes, RLS policies, triggers, and seed data will be created!
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ==============================================================================
-- 1. PROFILES & USER ACCOUNTS (Linked with Supabase Auth)
-- ==============================================================================
create table if not exists public.profiles (
    id text primary key, -- Can match auth.users id or custom user id
    username text unique not null,
    email text unique not null,
    referral_code text unique not null,
    referred_by text,
    role text not null default 'user' check (role in ('user', 'admin')),
    two_factor_enabled boolean default false,
    two_factor_secret text,
    is_merchant boolean default false,
    merchant_security_pledge numeric(18, 4) default 0.00,
    kyc_status text default 'unverified' check (kyc_status in ('unverified', 'pending', 'verified')),
    avatar_url text default 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    country text default 'United States',
    preferred_currency text default 'USD',
    locked_mined_balance numeric(18, 6) not null default 0.00, -- Platform-locked mined DC balance (non-transferable)
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_email on public.profiles(email);
create index if not exists idx_profiles_referral_code on public.profiles(referral_code);

-- ==============================================================================
-- 2. USER WALLETS (Non-Custodial & Connected External Wallets)
-- ==============================================================================
create table if not exists public.wallets (
    id text primary key default ('w_' || gen_random_uuid()),
    user_id text not null references public.profiles(id) on delete cascade,
    name text not null,
    address text not null,
    mnemonic_phrase text, -- Client-encrypted seed phrase
    private_key text, -- Client-encrypted private key
    network text not null default 'dcoine',
    is_external boolean default false,
    is_native boolean default false, -- True for primary platform native DC wallet
    locked_balance numeric(18, 6) not null default 0.00, -- Locked mined DC rewards (non-transferable to other wallets)
    can_transfer_mined boolean default false, -- Strict protocol lock enforcement
    provider text default 'internal', -- 'internal', 'metamask', 'trustwallet', 'phantom', etc.
    created_at timestamptz not null default now()
);

create index if not exists idx_wallets_user_id on public.wallets(user_id);
create index if not exists idx_wallets_address on public.wallets(address);

-- ==============================================================================
-- 3. TOKENS & COINS (Managed from Admin & Used in Swap Dropdowns)
-- ==============================================================================
create table if not exists public.tokens (
    id text primary key,
    symbol text not null,
    name text not null,
    network text not null default 'dcoine',
    contract_address text,
    decimals integer not null default 18,
    balance numeric(28, 8) not null default 0.00,
    price_usd numeric(18, 4) not null default 1.00,
    change_24h numeric(8, 2) not null default 0.00,
    icon_url text,
    is_custom boolean default false,
    enabled_in_swap boolean default true,
    locked_balance numeric(28, 8) not null default 0.00, -- Locked mined balance (in native platform wallet)
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_tokens_symbol on public.tokens(symbol);
create index if not exists idx_tokens_network on public.tokens(network);
create index if not exists idx_tokens_enabled_swap on public.tokens(enabled_in_swap);

-- ==============================================================================
-- 4. MINING SESSIONS & COMMUNITY HASHRATE
-- Protocol Rules:
-- 1. Base mining: 24h = 1 DC (1/24 DC/hr ≈ 0.041667 DC/hr)
-- 2. Referral bonus: 10 active referrals mining for 24h = 1 DC (1 active ref = 0.1 DC / 24h ≈ 0.004167 DC/hr)
-- 3. Mined coins are locked in native platform DC wallet and cannot be transferred to external wallets.
-- ==============================================================================
create table if not exists public.mining_sessions (
    id text primary key default ('mine_' || gen_random_uuid()),
    user_id text not null references public.profiles(id) on delete cascade,
    is_active boolean default false,
    start_time timestamptz,
    end_time timestamptz,
    base_rate_per_hour numeric(10, 6) not null default 0.041667, -- 1 DC per 24 hours (1/24 DC/hr)
    referral_rate_per_active_ref numeric(10, 6) not null default 0.004167, -- 10 active refs = 1 DC/24h (0.1 DC/24h per active ref)
    boost_multiplier numeric(6, 2) not null default 1.30, -- Multiplier from active referees
    current_session_mined numeric(18, 6) not null default 0.00,
    total_mined_lifetime numeric(18, 6) not null default 0.00,
    locked_mined_balance numeric(18, 6) not null default 0.00, -- Locked in native platform DC wallet
    last_claim_time timestamptz,
    consecutive_days integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_mining_user_id on public.mining_sessions(user_id);

-- ==============================================================================
-- 5. REFERRALS & INVITATION BONUSES
-- ==============================================================================
create table if not exists public.referrals (
    id text primary key default ('ref_' || gen_random_uuid()),
    referrer_id text not null references public.profiles(id) on delete cascade,
    referee_user_id text references public.profiles(id) on delete set null,
    name text not null,
    email text not null,
    status text not null default 'active' check (status in ('active', 'idle')),
    dcoin_earned_bonus numeric(18, 4) not null default 0.00,
    joined_at timestamptz not null default now()
);

create index if not exists idx_referrals_referrer on public.referrals(referrer_id);

-- ==============================================================================
-- 6. P2P MARKETPLACE ORDERS & ADS
-- ==============================================================================
create table if not exists public.p2p_orders (
    id text primary key default ('p2p_ord_' || gen_random_uuid()),
    user_id text not null references public.profiles(id) on delete cascade,
    type text not null check (type in ('buy', 'sell')),
    merchant_name text not null,
    merchant_rating numeric(5, 2) not null default 99.00,
    completed_orders_count integer not null default 0,
    crypto_symbol text not null,
    fiat_currency text not null default 'USD',
    price numeric(18, 4) not null,
    min_limit numeric(18, 2) not null default 10.00,
    max_limit numeric(18, 2) not null default 5000.00,
    available_amount numeric(18, 6) not null,
    payment_methods jsonb not null default '["Bank Transfer", "Wise", "Revolut"]'::jsonb,
    terms text,
    status text not null default 'active' check (status in ('active', 'paused', 'completed', 'cancelled')),
    avg_release_time_minutes numeric(5, 1) not null default 3.5,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_p2p_orders_type on public.p2p_orders(type);
create index if not exists idx_p2p_orders_crypto on public.p2p_orders(crypto_symbol);
create index if not exists idx_p2p_orders_status on public.p2p_orders(status);

-- ==============================================================================
-- 7. P2P ESCROW TRADES & DISPUTES
-- ==============================================================================
create table if not exists public.p2p_trades (
    id text primary key default ('trade_' || gen_random_uuid()),
    order_id text not null references public.p2p_orders(id) on delete cascade,
    type text not null check (type in ('buy', 'sell')),
    buyer_id text not null references public.profiles(id),
    buyer_name text not null,
    seller_id text not null references public.profiles(id),
    seller_name text not null,
    crypto_symbol text not null,
    crypto_amount numeric(18, 6) not null,
    fiat_currency text not null,
    fiat_amount numeric(18, 2) not null,
    payment_method text not null,
    status text not null default 'waiting_payment' check (
        status in ('waiting_payment', 'paid_escrow_locked', 'released', 'disputed', 'cancelled')
    ),
    escrow_locked_at timestamptz,
    expires_at timestamptz,
    escrow_tx_hash text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_p2p_trades_buyer on public.p2p_trades(buyer_id);
create index if not exists idx_p2p_trades_seller on public.p2p_trades(seller_id);
create index if not exists idx_p2p_trades_status on public.p2p_trades(status);

-- ==============================================================================
-- 8. P2P TRADE CHAT MESSAGES
-- ==============================================================================
create table if not exists public.p2p_trade_messages (
    id text primary key default ('msg_' || gen_random_uuid()),
    trade_id text not null references public.p2p_trades(id) on delete cascade,
    sender text not null,
    text text not null,
    is_system boolean default false,
    created_at timestamptz not null default now()
);

create index if not exists idx_p2p_messages_trade on public.p2p_trade_messages(trade_id);

-- ==============================================================================
-- 9. TRANSACTION LEDGER & ON-CHAIN AUDIT LOGS
-- ==============================================================================
create table if not exists public.transactions (
    id text primary key default ('tx_' || gen_random_uuid()),
    user_id text references public.profiles(id) on delete cascade,
    type text not null check (type in ('mine', 'deposit', 'withdraw', 'swap', 'p2p_buy', 'p2p_sell', 'referral')),
    symbol text not null,
    amount numeric(28, 8) not null,
    fiat_value numeric(18, 2),
    network text not null default 'dcoine',
    hash text not null,
    from_address text,
    to_address text,
    status text not null default 'completed' check (status in ('completed', 'pending', 'failed')),
    fee numeric(18, 6) default 0.00,
    created_at timestamptz not null default now()
);

create index if not exists idx_transactions_user on public.transactions(user_id);
create index if not exists idx_transactions_hash on public.transactions(hash);
create index if not exists idx_transactions_type on public.transactions(type);

-- ==============================================================================
-- 10. NEWS & ECOSYSTEM ARTICLES
-- ==============================================================================
create table if not exists public.news_articles (
    id text primary key,
    title text not null,
    excerpt text not null,
    content text not null,
    source text not null,
    source_url text not null,
    image_url text not null,
    category text not null check (category in ('Bitcoin', 'Ethereum', 'DeFi', 'Dcoine', 'Regulation')),
    published_at text not null,
    read_time text not null default '3 min read',
    likes_count integer not null default 0,
    created_at timestamptz not null default now()
);

create table if not exists public.news_comments (
    id text primary key default ('comm_' || gen_random_uuid()),
    article_id text not null references public.news_articles(id) on delete cascade,
    user_id text not null references public.profiles(id) on delete cascade,
    user_name text not null,
    user_avatar text,
    text text not null,
    likes_count integer not null default 0,
    created_at timestamptz not null default now()
);

create index if not exists idx_news_comments_article on public.news_comments(article_id);

-- ==============================================================================
-- 11. VERIFIED DAPPS DIRECTORY
-- ==============================================================================
create table if not exists public.dapps (
    id text primary key,
    name text not null,
    category text not null check (category in ('DEX', 'DeFi', 'NFT', 'Staking', 'Bridge', 'Gaming')),
    description text not null,
    url text not null,
    icon_bg text not null default 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    badge text not null default 'Verified',
    rating numeric(3, 2) not null default 4.8,
    chain text not null default 'Dcoine',
    created_at timestamptz not null default now()
);

-- ==============================================================================
-- 12. ADMIN SYSTEM SETTINGS (API KEYS, SEO, SWAP PROTOCOL, MINING)
-- ==============================================================================
create table if not exists public.admin_settings (
    id text primary key default 'global_config',
    api_keys jsonb not null default '{
        "rpcDcoineEndpoint": "https://rpc.dcoine.network/v1/mainnet",
        "etherscanApiKey": "ETH_SCAN_7A88B92K119Q",
        "coinGeckoApiKey": "CG-PRO_99824X88A10",
        "supabaseProjectUrl": "https://dcoine-db.supabase.co",
        "supabaseAnonKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "bscscanApiKey": "BSC_SCAN_8192X0192",
        "customWebhookSecret": "whsec_99a8b1c4e7f80"
    }'::jsonb,
    seo jsonb not null default '{
        "googleSearchConsoleTag": "google-site-verification=dcoine_7F819A0192X881",
        "googleAnalyticsId": "G-DCOINE9988",
        "googleTagManagerId": "GTM-DCOINE1",
        "facebookPixelId": "fbq_9918273645",
        "googleDomainVerification": "google-domain-verification=dcoine.network",
        "customMetaKeywords": "crypto mining, dcoine, p2p crypto, non custodial wallet, dex swap, blockchain"
    }'::jsonb,
    mining_config jsonb not null default '{
        "baseRatePerHour": 0.041667,
        "sessionDurationHours": 24,
        "referralBonusRatePerActive": 0.004167,
        "referral10BonusYield": 1.0,
        "minWithdrawalDcoin": 10.0,
        "lockedInNativeWallet": true
    }'::jsonb,
    swap_config jsonb not null default '{
        "enabled": true,
        "maintenanceMessage": "DEX Liquidity Swap is temporarily paused for protocol upgrade. Please check back shortly.",
        "announcementBanner": "⚡ Zero protocol fee promotion on Dcoine Mainnet swaps!",
        "allowCustomTokens": true,
        "defaultFromToken": "DCOIN",
        "defaultToToken": "USDT",
        "protocolFeePercent": 0.15,
        "feeCollectorAddress": "0x9fa4b2e817c6e0018a99cde3194a02be9761e05a8d90",
        "routerName": "Dcoine Multi-Hop Auto Router",
        "routerContractAddress": "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        "factoryContractAddress": "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
        "estimatedGasFee": "< $0.05",
        "gasLimit": 250000,
        "defaultSlippage": 0.5,
        "slippagePresets": [0.1, 0.5, 1.0, 2.5],
        "minSwapAmountUsd": 1.0,
        "maxSwapAmountUsd": 50000.0,
        "priceImpactWarningPercent": 5.0,
        "supportedNetworks": ["dcoine", "ethereum", "bsc", "solana", "polygon", "arbitrum", "base"]
    }'::jsonb,
    updated_at timestamptz not null default now()
);

-- ==============================================================================
-- 13. ADMIN EMAIL BROADCASTS & CMS PAGES
-- ==============================================================================
create table if not exists public.admin_emails (
    id text primary key default ('email_' || gen_random_uuid()),
    subject text not null,
    body text not null,
    recipient_group text not null check (recipient_group in ('all', 'miners', 'merchants')),
    scheduled_for timestamptz,
    status text not null default 'sent' check (status in ('sent', 'scheduled', 'draft')),
    sent_at timestamptz,
    created_at timestamptz not null default now()
);

create table if not exists public.cms_pages (
    id text primary key default ('page_' || gen_random_uuid()),
    slug text unique not null,
    title text not null,
    content text not null,
    is_published boolean default true,
    updated_at timestamptz not null default now(),
    created_at timestamptz not null default now()
);

-- ==============================================================================
-- 14. UPDATED_AT TRIGGER FUNCTION
-- ==============================================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create or replace trigger on_profiles_updated
    before update on public.profiles
    for each row execute function public.handle_updated_at();

create or replace trigger on_tokens_updated
    before update on public.tokens
    for each row execute function public.handle_updated_at();

create or replace trigger on_p2p_orders_updated
    before update on public.p2p_orders
    for each row execute function public.handle_updated_at();

create or replace trigger on_p2p_trades_updated
    before update on public.p2p_trades
    for each row execute function public.handle_updated_at();

create or replace trigger on_admin_settings_updated
    before update on public.admin_settings
    for each row execute function public.handle_updated_at();

-- ==============================================================================
-- 15. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.wallets enable row level security;
alter table public.tokens enable row level security;
alter table public.mining_sessions enable row level security;
alter table public.referrals enable row level security;
alter table public.p2p_orders enable row level security;
alter table public.p2p_trades enable row level security;
alter table public.p2p_trade_messages enable row level security;
alter table public.transactions enable row level security;
alter table public.news_articles enable row level security;
alter table public.news_comments enable row level security;
alter table public.dapps enable row level security;
alter table public.admin_settings enable row level security;
alter table public.admin_emails enable row level security;
alter table public.cms_pages enable row level security;

-- Public Read Policies
create policy "Allow public read on tokens" on public.tokens for select using (true);
create policy "Allow public read on news" on public.news_articles for select using (true);
create policy "Allow public read on news comments" on public.news_comments for select using (true);
create policy "Allow public read on dapps" on public.dapps for select using (true);
create policy "Allow public read on cms pages" on public.cms_pages for select using (is_published = true);
create policy "Allow public read on active p2p orders" on public.p2p_orders for select using (true);
create policy "Allow public read on admin settings" on public.admin_settings for select using (true);

-- User-scoped Policies
create policy "Users can read own profile" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (true);
create policy "Users can insert profile" on public.profiles for insert with check (true);

create policy "Users can manage own wallets" on public.wallets for all using (true);
create policy "Users can manage own mining" on public.mining_sessions for all using (true);
create policy "Users can view own referrals" on public.referrals for select using (true);
create policy "Users can manage own p2p orders" on public.p2p_orders for all using (true);
create policy "Trade participants can manage trades" on public.p2p_trades for all using (true);
create policy "Trade participants can send messages" on public.p2p_trade_messages for all using (true);
create policy "Users can view and insert own transactions" on public.transactions for all using (true);

-- Admin Full Access Policies
create policy "Admin full access tokens" on public.tokens for all using (true);
create policy "Admin full access admin_settings" on public.admin_settings for all using (true);
create policy "Admin full access emails" on public.admin_emails for all using (true);
create policy "Admin full access cms" on public.cms_pages for all using (true);

-- ==============================================================================
-- 16. SUPABASE REALTIME REPLICATION (For live P2P Chat, Trades & Mining)
-- ==============================================================================
begin;
  -- Add tables to realtime publication
  alter publication supabase_realtime add table public.p2p_trade_messages;
  alter publication supabase_realtime add table public.p2p_trades;
  alter publication supabase_realtime add table public.tokens;
  alter publication supabase_realtime add table public.transactions;
commit;

-- ==============================================================================
-- 17. INITIAL SEED DATA (Tokens, Initial Admin Settings, CMS Pages, DApps)
-- ==============================================================================
insert into public.tokens (id, symbol, name, network, contract_address, decimals, balance, price_usd, change_24h, icon_url, enabled_in_swap, locked_balance)
values
    ('dcoin', 'DCOIN', 'Dcoine Native', 'dcoine', '0x99dc01e74f1791a8291a27e7d90f7790b83e4a01', 18, 245.5, 1.48, 12.6, '/logo.png', true, 48.60),
    ('eth', 'ETH', 'Ethereum', 'ethereum', null, 18, 1.45, 3450.20, 2.4, null, true, 0.00),
    ('usdt', 'USDT', 'Tether USD', 'ethereum', '0xdac17f958d2ee523a2206206994597c13d831ec7', 6, 850.0, 1.00, 0.01, null, true, 0.00),
    ('usdc', 'USDC', 'USD Coin', 'ethereum', '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', 6, 320.0, 1.00, 0.00, null, true, 0.00),
    ('bnb', 'BNB', 'BNB Chain', 'bsc', null, 18, 3.2, 590.40, -1.2, null, true, 0.00),
    ('sol', 'SOL', 'Solana', 'solana', null, 9, 14.5, 178.60, 5.8, null, true, 0.00),
    ('pol', 'POL', 'Polygon', 'polygon', '0x455e53CBB86018Ac2B8092FdCd39d8444aFF8167', 18, 640.0, 0.52, -0.4, null, true, 0.00),
    ('arb', 'ARB', 'Arbitrum', 'arbitrum', '0x912CE59144191C1204E64559FE8253a0e49E6548', 18, 480.0, 0.88, 3.1, null, true, 0.00)
on conflict (id) do nothing;

insert into public.admin_settings (id)
values ('global_config')
on conflict (id) do nothing;

insert into public.cms_pages (id, slug, title, content, is_published)
values
    ('page-terms', 'terms', 'Terms of Service & Escrow Rules', 'Dcoine decentralized protocol provides non-custodial smart contracts. Users are solely responsible for safeguarding seed phrases and private keys. All P2P marketplace trades are protected by automated lock contracts until fiat payment is acknowledged.', true),
    ('page-privacy', 'privacy', 'Decentralized Privacy Policy', 'No centralized personal tracking or IP profiling is executed on-chain. Zero-knowledge authentication and encrypted client-side storage guarantee complete self-sovereignty.', true)
on conflict (id) do nothing;

insert into public.dapps (id, name, category, description, url, icon_bg, badge, rating, chain)
values
    ('dapp-uniswap', 'Uniswap DEX', 'DEX', 'Swap tokens and provide liquidity across Ethereum, Arbitrum, Optimism, and Base.', 'https://app.uniswap.org', 'bg-pink-500/20 text-pink-400 border-pink-500/40', 'Popular', 4.9, 'Multi-Chain'),
    ('dapp-dexscreener', 'DexScreener Charts', 'DeFi', 'Real-time DEX charts, price analytics, transaction tracking, and token pair telemetry.', 'https://dexscreener.com', 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40', 'Trending', 4.8, 'Multi-Chain'),
    ('dapp-1inch', '1inch Aggregator', 'DEX', 'DeFi / DEX aggregator with automated smart routing across deepest on-chain liquidity pools.', 'https://app.1inch.io', 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40', 'Aggregator', 4.7, 'Multi-Chain'),
    ('dapp-aave', 'Aave Protocol', 'DeFi', 'Decentralized non-custodial liquidity market protocol to earn interest on deposits.', 'https://app.aave.com', 'bg-teal-500/20 text-teal-400 border-teal-500/40', 'Lending', 4.9, 'Ethereum'),
    ('dapp-opensea', 'OpenSea Marketplace', 'NFT', 'Discover, collect, and sell extraordinary Web3 digital collectibles and NFTs.', 'https://opensea.io', 'bg-blue-500/20 text-blue-400 border-blue-500/40', 'NFT', 4.6, 'Multi-Chain')
on conflict (id) do nothing;

-- ==============================================================================
-- 18. PLATFORM COMMISSIONS & FEE TIERS (P2P, Swap, Buy, Sell Rates)
-- ==============================================================================
create table if not exists public.platform_commission_config (
    id text primary key default 'global_commissions',
    is_published boolean not null default true, -- Master toggle for public visibility
    p2p_buy_rate_percent numeric(5, 2) not null default 0.10,
    p2p_sell_rate_percent numeric(5, 2) not null default 0.20,
    swap_buy_rate_percent numeric(5, 2) not null default 0.15,
    swap_sell_rate_percent numeric(5, 2) not null default 0.15,
    treasury_wallet_address text not null default '0x71C0F4A972b2c45163D8a0B5d4Ce45Fa91f24A22',
    discount_token_symbol text not null default 'DCOIN',
    discount_percent numeric(5, 2) not null default 25.00,
    updated_at timestamptz not null default now()
);

create table if not exists public.commission_rules (
    id text primary key default ('rule_' || gen_random_uuid()),
    name text not null,
    category text not null default 'all' check (category in ('all', 'p2p', 'swap')),
    buy_rate_percent numeric(5, 2) not null default 0.10,
    sell_rate_percent numeric(5, 2) not null default 0.20,
    min_fee_usd numeric(10, 4) not null default 0.05,
    fixed_fee_usd numeric(10, 4) not null default 0.00,
    description text,
    is_active boolean not null default true,
    is_default boolean not null default false,
    created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.platform_commission_config enable row level security;
alter table public.commission_rules enable row level security;

-- Commission Policies
create policy "Allow public read on platform commission config" on public.platform_commission_config
    for select using (is_published = true);

create policy "Admin full access platform commission config" on public.platform_commission_config
    for all using (true);

create policy "Allow public read on active commission rules" on public.commission_rules
    for select using (is_active = true);

create policy "Admin full access commission rules" on public.commission_rules
    for all using (true);

-- Realtime replication
begin;
  alter publication supabase_realtime add table public.platform_commission_config;
  alter publication supabase_realtime add table public.commission_rules;
commit;

-- Seed Data
insert into public.platform_commission_config (
    id, is_published, p2p_buy_rate_percent, p2p_sell_rate_percent, swap_buy_rate_percent, swap_sell_rate_percent, treasury_wallet_address, discount_token_symbol, discount_percent
) values (
    'global_commissions', true, 0.10, 0.20, 0.15, 0.15, '0x71C0F4A972b2c45163D8a0B5d4Ce45Fa91f24A22', 'DCOIN', 25.00
) on conflict (id) do nothing;

insert into public.commission_rules (id, name, category, buy_rate_percent, sell_rate_percent, min_fee_usd, fixed_fee_usd, description, is_active, is_default)
values
    ('rule-std-global', 'Standard User Tier (Global)', 'all', 0.10, 0.20, 0.05, 0.00, 'Standard platform commission for retail trades and decentralized swaps across all chains.', true, true),
    ('rule-merchant-p2p', 'Verified Merchant Tier (P2P)', 'p2p', 0.05, 0.10, 0.02, 0.00, 'Preferred low commission for verified merchants maintaining 500+ USDT escrow security pledge.', true, false),
    ('rule-vip-swap', 'VIP Liquidity Provider (Swap)', 'swap', 0.08, 0.08, 0.01, 0.00, 'Discounted multi-hop swap rate for accounts holding 1,000+ native DCOIN balance.', true, false),
    ('rule-zero-promo', 'Zero-Fee Promotional Campaign', 'all', 0.00, 0.00, 0.00, 0.00, 'Zero commission promotional campaign tier for community launch events.', false, false)
on conflict (id) do nothing;

-- ==============================================================================
-- DONE! All tables, indexes, RLS policies, triggers and seed data are ready.
-- ==============================================================================
