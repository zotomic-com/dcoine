import React, { useState } from 'react';
import {
  LayoutDashboard,
  Pickaxe,
  Wallet,
  ArrowLeftRight,
  Repeat,
  Search,
  Newspaper,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  LogOut,
  Coins,
  Sparkles,
  ShieldAlert,
  User,
} from 'lucide-react';
import { NavTab } from './BottomNav';
import { UserProfile } from '../types';

interface UserSidebarProps {
  open: boolean;
  onClose: () => void;
  onNavigateTab: (tab: NavTab) => void;
  onLogout: () => void;
  user: UserProfile;
  currentTab: string;
}

interface MenuItem {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  badge?: string;
  badgeColor?: string;
}

const USER_NAV_ITEMS: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard & Portfolio',
    icon: LayoutDashboard,
    description: 'Account overview & balances',
    badge: 'Live',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  {
    id: 'mining',
    label: 'Mining Pool',
    icon: Pickaxe,
    description: 'Mine DCN tokens 24/7',
    badge: 'Active',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
  {
    id: 'wallet',
    label: 'Crypto Wallet',
    icon: Wallet,
    description: 'Multi-chain non-custodial vault',
  },
  {
    id: 'p2p',
    label: 'P2P Trading',
    icon: ArrowLeftRight,
    description: 'Zero-fee escrow marketplace',
    badge: 'Escrow',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  {
    id: 'swap',
    label: 'DEX Token Swap',
    icon: Repeat,
    description: 'Instant liquidity swaps',
  },
  {
    id: 'explorer',
    label: 'Blockchain Explorer',
    icon: Search,
    description: 'Live blocks & transactions',
  },
  {
    id: 'news',
    label: 'Crypto News & Feeds',
    icon: Newspaper,
    description: 'Curated market intelligence',
  },
];

export const UserSidebar: React.FC<UserSidebarProps> = ({
  open,
  onClose,
  onNavigateTab,
  onLogout,
  user,
  currentTab,
}) => {
  const [copiedRef, setCopiedRef] = useState(false);

  if (!open) return null;

  const handleCopyRef = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (user.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  const isKycVerified = user.kycStatus === 'verified';
  const isKycPending = user.kycStatus === 'pending';

  return (
    <div className="fixed inset-0 z-50 flex animate-fadeIn">
      {/* Sidebar Drawer Container */}
      <div className="w-80 max-w-[85vw] bg-slate-950 border-r border-slate-800 p-4 flex flex-col gap-3 shadow-2xl z-20 h-full overflow-hidden">
        {/* Header: Brand & Collapse Button */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 p-0.5 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Coins className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="font-black text-white text-base tracking-tight flex items-center gap-1.5">
                Dcoine <span className="text-amber-400">User</span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium">Registered Member Portal</div>
            </div>
          </div>

          {/* Close Sidebar Icon (Streamline Iconoir style matching header) */}
          <button
            onClick={onClose}
            title="Close menu"
            aria-label="Close menu"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition cursor-pointer"
          >
            <svg
              viewBox="-0.5 -0.5 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-4.5 h-4.5 text-slate-400 hover:text-amber-400 transition"
            >
              <path
                d="M12.7769375 14.284625H2.2230625c-0.8326875 0 -1.5076875 -0.675 -1.5076875 -1.5076875l0 -10.553875c0 -0.8326875 0.675 -1.5076875 1.5076875 -1.5076875h10.553875c0.8326875 0 1.5076875 0.675 1.5076875 1.5076875v10.553875c0 0.8326875 -0.675 1.5076875 -1.5076875 1.5076875Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.15"
              />
              <path
                d="M3.91925 5.9923125 2.6 7.5l1.31925 1.5076875"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.15"
              />
              <path
                d="M5.615375 14.284625V0.715375"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.15"
              />
            </svg>
          </button>
        </div>

        {/* User Profile Card */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/90 flex flex-col gap-2.5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <div className="w-11 h-11 rounded-full border-2 border-amber-500/50 flex items-center justify-center bg-slate-800 text-amber-400 shadow-md">
                <User className="w-5 h-5" />
              </div>
              {isKycVerified && (
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center border-2 border-slate-900"
                  title="KYC Verified"
                >
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-100 text-sm truncate">{user.username}</span>
                {user.role === 'admin' && (
                  <span className="px-1.5 py-0.2 text-[9px] font-extrabold uppercase rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Admin
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 truncate">{user.email}</div>

              {/* Status Pills */}
              <div className="flex items-center gap-1.5 mt-1">
                {isKycVerified ? (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Verified
                  </span>
                ) : isKycPending ? (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                    <AlertCircle className="w-2.5 h-2.5" />
                    KYC Pending
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                    <ShieldAlert className="w-2.5 h-2.5 text-slate-500" />
                    KYC Required
                  </span>
                )}
                {user.isMerchant && (
                  <span className="inline-flex items-center text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                    Merchant
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Balance Preview */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
            <div className="bg-slate-950/60 rounded-lg p-2 border border-slate-800/50">
              <div className="text-[10px] font-medium text-slate-400">Mined DCN</div>
              <div className="text-xs font-bold text-amber-400 truncate">
                {(user.lockedMinedBalance ?? 0).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 4,
                })}{' '}
                <span className="text-[10px] text-slate-400 font-normal">DCN</span>
              </div>
            </div>
            <div className="bg-slate-950/60 rounded-lg p-2 border border-slate-800/50">
              <div className="text-[10px] font-medium text-slate-400">Security</div>
              <div className="text-xs font-bold text-slate-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                {user.twoFactorEnabled ? '2FA Active' : '2FA Off'}
              </div>
            </div>
          </div>
        </div>

        {/* Menu Navigation List */}
        <div className="flex-1 overflow-y-auto space-y-1 py-1 pr-1 custom-scrollbar">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
            Platform Navigation
          </div>
          {USER_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigateTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition cursor-pointer group ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                      isActive
                        ? 'bg-slate-950/20 text-slate-950'
                        : 'bg-slate-900 text-slate-400 group-hover:text-amber-400 group-hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate">{item.label}</div>
                    <div
                      className={`text-[10px] truncate font-normal ${
                        isActive ? 'text-slate-900/80' : 'text-slate-400'
                      }`}
                    >
                      {item.description}
                    </div>
                  </div>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border flex-shrink-0 ${
                      isActive ? 'bg-slate-950/20 text-slate-950 border-transparent' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Referral Code Box */}
          {user.referralCode && (
            <div className="mt-2 p-3 rounded-xl bg-gradient-to-br from-amber-500/10 via-slate-900/60 to-slate-900/40 border border-amber-500/20">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  My Referral Code
                </span>
                <span className="text-[10px] text-slate-400">Earn +10% DCN</span>
              </div>
              <div className="flex items-center justify-between gap-2 bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
                <code className="text-xs font-mono font-bold text-amber-400 tracking-wide">
                  {user.referralCode}
                </code>
                <button
                  type="button"
                  onClick={handleCopyRef}
                  className="flex items-center gap-1 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded transition cursor-pointer"
                  title="Copy referral code"
                >
                  {copiedRef ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-400" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer: User Identity + Icon-Only Logout Button */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 flex-shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-200 truncate">{user.username}</div>
              <div className="text-[10px] text-slate-400">Dcoine Member</div>
            </div>
          </div>

          {/* Icon-Only Logout Button */}
          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            title="Log Out"
            aria-label="Log Out"
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 transition cursor-pointer flex-shrink-0 group"
          >
            <LogOut className="w-4 h-4 transition-transform group-hover:scale-110" />
          </button>
        </div>
      </div>

      {/* Backdrop */}
      <div
        className="flex-1 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
    </div>
  );
};
