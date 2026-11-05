/**
 * Production-ready Web3 Wallet Connection Service
 * Supports EIP-1193 standard injected providers (MetaMask, Trust, Rabby, Coinbase, OKX, Rainbow, Brave)
 * and Solana providers (Phantom, Solflare).
 */

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      isCoinbaseWallet?: boolean;
      isRabby?: boolean;
      isTrust?: boolean;
      isOkxWallet?: boolean;
      isBraveWallet?: boolean;
      request: (args: { method: string; params?: unknown[] }) => Promise<any>;
      on?: (eventName: string, handler: (...args: any[]) => void) => void;
      removeListener?: (eventName: string, handler: (...args: any[]) => void) => void;
    };
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: { toString: () => string } }>;
      disconnect?: () => Promise<void>;
    };
    phantom?: {
      solana?: {
        isPhantom?: boolean;
        connect: () => Promise<{ publicKey: { toString: () => string } }>;
      };
    };
  }
}

export interface Web3ConnectionResult {
  success: boolean;
  address?: string;
  chainId?: string;
  balanceEth?: string;
  providerName: string;
  isRealProvider: boolean;
  error?: string;
  installUrl?: string;
}

export const PROVIDER_DOWNLOAD_URLS: Record<string, string> = {
  metamask: 'https://metamask.io/download/',
  trust: 'https://trustwallet.com/download',
  phantom: 'https://phantom.app/download',
  coinbase: 'https://www.coinbase.com/wallet',
  rainbow: 'https://rainbow.me/',
  rabby: 'https://rabby.io/',
  okx: 'https://www.okx.com/web3',
  bitget: 'https://web3.bitget.com/',
  zerion: 'https://zerion.io/',
  ledger: 'https://www.ledger.com/ledger-live',
  trezor: 'https://trezor.io/',
  safepal: 'https://www.safepal.com/download',
  exodus: 'https://www.exodus.com/download/',
  argent: 'https://www.argent.xyz/',
  uniswap: 'https://wallet.uniswap.org/',
  backpack: 'https://backpack.app/',
  solflare: 'https://solflare.com/',
  keplr: 'https://www.keplr.app/download',
  brave: 'https://brave.com/wallet/',
  '1inch': 'https://1inch.io/wallet/',
  ronin: 'https://wallet.roninchain.com/',
  tronlink: 'https://www.tronlink.org/',
  sui: 'https://suiwallet.com/',
};

export class Web3WalletService {
  /**
   * Check if standard EIP-1193 EVM provider is available
   */
  public static hasEVMProvider(): boolean {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined' && typeof window.ethereum.request === 'function';
  }

  /**
   * Check if Solana / Phantom provider is available
   */
  public static hasSolanaProvider(): boolean {
    if (typeof window === 'undefined') return false;
    return Boolean(window.phantom?.solana || window.solana);
  }

  /**
   * Request real user authorization from injected Web3 wallet
   */
  public static async connectWallet(providerId: string, providerName: string): Promise<Web3ConnectionResult> {
    const installUrl = PROVIDER_DOWNLOAD_URLS[providerId.toLowerCase()] || `https://duckduckgo.com/?q=${encodeURIComponent(providerName + ' wallet download')}`;

    // 1. Solana Ecosystem (Phantom, Solflare, Backpack)
    if (providerId === 'phantom' || providerId === 'solflare' || providerId === 'backpack') {
      const solanaObj = window.phantom?.solana || window.solana;
      if (!solanaObj) {
        return {
          success: false,
          providerName,
          isRealProvider: false,
          error: `${providerName} extension not found in your browser. Install the extension to authorize connection.`,
          installUrl,
        };
      }

      try {
        const resp = await solanaObj.connect();
        const address = resp.publicKey.toString();
        return {
          success: true,
          address,
          providerName,
          isRealProvider: true,
        };
      } catch (err: any) {
        const isRejected = err?.code === 4001 || err?.message?.toLowerCase()?.includes('reject') || err?.message?.toLowerCase()?.includes('cancel');
        return {
          success: false,
          providerName,
          isRealProvider: true,
          error: isRejected ? 'Connection authorization rejected by user in wallet.' : (err?.message || 'Failed to connect Solana wallet.'),
        };
      }
    }

    // 2. EVM Ecosystem (MetaMask, Trust, Rabby, Coinbase, OKX, Rainbow, Brave, etc.)
    if (this.hasEVMProvider()) {
      try {
        // Request accounts - triggers real browser extension permission popup
        const accounts: string[] = await window.ethereum!.request({
          method: 'eth_requestAccounts',
        });

        if (!accounts || accounts.length === 0) {
          return {
            success: false,
            providerName,
            isRealProvider: true,
            error: 'No accounts authorized by wallet.',
          };
        }

        const address = accounts[0];
        let chainId = '0x1';
        let balanceEth = '0.00';

        try {
          chainId = await window.ethereum!.request({ method: 'eth_chainId' });
        } catch {}

        try {
          const balanceHex = await window.ethereum!.request({
            method: 'eth_getBalance',
            params: [address, 'latest'],
          });
          if (balanceHex) {
            const wei = BigInt(balanceHex);
            const eth = Number(wei) / 1e18;
            balanceEth = eth.toFixed(4);
          }
        } catch {}

        return {
          success: true,
          address,
          chainId,
          balanceEth,
          providerName,
          isRealProvider: true,
        };
      } catch (err: any) {
        // EIP-1193 4001 code is standard user rejection
        const isUserRejected = err?.code === 4001 || err?.message?.toLowerCase()?.includes('user rejected');
        return {
          success: false,
          providerName,
          isRealProvider: true,
          error: isUserRejected
            ? 'Connection authorization rejected. You declined the access request in your wallet.'
            : (err?.message || 'Failed to authorize wallet connection.'),
        };
      }
    }

    // 3. Provider extension not detected in this browser
    return {
      success: false,
      providerName,
      isRealProvider: false,
      error: `${providerName} extension was not detected in this browser. Please install the official browser extension or use MetaMask Mobile.`,
      installUrl,
    };
  }
}
