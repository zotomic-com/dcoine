/**
 * Cryptographic & Blockchain Utilities for Dcoine Ecosystem
 */

const BIP39_WORDS = [
  'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract', 'absurd', 'abuse',
  'access', 'accident', 'account', 'accuse', 'achieve', 'acid', 'acoustic', 'acquire', 'across', 'act',
  'action', 'actor', 'actress', 'actual', 'adapt', 'add', 'addict', 'address', 'adjust', 'admit',
  'adult', 'advance', 'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'age', 'agent',
  'agree', 'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album', 'alcohol', 'alert',
  'alien', 'all', 'alley', 'allow', 'almost', 'alone', 'alpha', 'already', 'also', 'alter',
  'always', 'amateur', 'amazing', 'among', 'amount', 'amused', 'analyst', 'anchor', 'ancient', 'anger',
  'angle', 'angry', 'animal', 'ankle', 'announce', 'annual', 'another', 'answer', 'antenna', 'antique',
  'anxiety', 'any', 'apart', 'apology', 'appear', 'apple', 'approve', 'april', 'arch', 'arctic',
  'area', 'arena', 'argue', 'arm', 'armed', 'armor', 'army', 'around', 'arrange', 'arrest',
  'arrive', 'arrow', 'art', 'artefact', 'artist', 'artwork', 'ask', 'aspect', 'assault', 'asset',
  'assist', 'assume', 'asthma', 'athlete', 'atom', 'attack', 'attend', 'attitude', 'attract', 'auction',
  'audit', 'august', 'aunt', 'author', 'auto', 'autumn', 'average', 'avocado', 'avoid', 'awake',
  'aware', 'away', 'awesome', 'awful', 'awkward', 'axis', 'baby', 'bachelor', 'bacon', 'badge',
  'bag', 'balance', 'balcony', 'ball', 'bamboo', 'banana', 'banner', 'bar', 'barely', 'bargain',
  'barrel', 'base', 'basic', 'basket', 'battle', 'beach', 'bean', 'beauty', 'because', 'become',
  'beef', 'before', 'begin', 'behave', 'behind', 'believe', 'below', 'belt', 'bench', 'benefit',
  'best', 'betray', 'better', 'between', 'beyond', 'bicycle', 'bid', 'bike', 'bind', 'biology',
  'bird', 'birth', 'bitter', 'black', 'blade', 'blame', 'blanket', 'blast', 'bleak', 'bless',
  'blind', 'blood', 'blossom', 'blouse', 'blue', 'blur', 'blush', 'board', 'boat', 'body',
  'boil', 'bomb', 'bone', 'bonus', 'book', 'boost', 'border', 'boring', 'borrow', 'boss',
  'bottom', 'bounce', 'box', 'boy', 'bracket', 'brain', 'brand', 'brass', 'brave', 'bread',
  'breeze', 'brick', 'bridge', 'brief', 'bright', 'bring', 'brisk', 'broccoli', 'broken', 'bronze'
];

/**
 * Generate a random 12-word mnemonic seed phrase
 */
export function generateMnemonic(length: 12 = 12): string {
  const words: string[] = [];
  const cryptoObj = window.crypto || (window as unknown as { msCrypto: Crypto }).msCrypto;
  const randomValues = new Uint32Array(length);
  cryptoObj.getRandomValues(randomValues);

  for (let i = 0; i < length; i++) {
    const index = randomValues[i] % BIP39_WORDS.length;
    words.push(BIP39_WORDS[index]);
  }
  return words.join(' ');
}

/**
 * Generate a secure 64-character private key with 0x prefix
 */
export function generatePrivateKey(): string {
  const cryptoObj = window.crypto;
  const array = new Uint8Array(32);
  cryptoObj.getRandomValues(array);
  const hex = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  return `0x${hex}`;
}

/**
 * Generate a standard EVM-compatible address
 */
export function generateAddress(): string {
  const cryptoObj = window.crypto;
  const array = new Uint8Array(20);
  cryptoObj.getRandomValues(array);
  const hex = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  return `0x${hex}`;
}

/**
 * Generate a transaction hash
 */
export function generateTxHash(): string {
  const cryptoObj = window.crypto;
  const array = new Uint8Array(32);
  cryptoObj.getRandomValues(array);
  const hex = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  return `0x${hex}`;
}

/**
 * Generate a unique referral code like DCOIN-7F9A
 */
export function generateReferralCode(prefix: string = 'DCOIN'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${code}`;
}

/**
 * Shorten crypto address for clean display e.g. 0x1234...abcd
 */
export function shortenAddress(address: string, chars = 4): string {
  if (!address) return '';
  if (address.length <= chars * 2 + 2) return address;
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
}

/**
 * Generate mock Google Authenticator base32 secret
 */
export function generateTwoFactorSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  for (let i = 0; i < 16; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
}

/**
 * Verify 2FA code (simulates Google Authenticator verification)
 * Accepts standard 6-digit codes or test code 123456
 */
export function verifyTwoFactorCode(inputCode: string, _secret?: string): boolean {
  const cleaned = inputCode.trim();
  // Validates standard 6 digits format
  if (!/^\d{6}$/.test(cleaned)) {
    return false;
  }
  // In demo environment, any valid 6-digit code or default 123456 passes
  return true;
}
