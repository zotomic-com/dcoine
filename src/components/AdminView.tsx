import React, { useState } from 'react';
import {
  ShieldAlert,
  Key,
  Globe,
  Mail,
  Pickaxe,
  FileText,
  Copy,
  Check,
  Plus,
  Trash2,
  Edit,
  Save,
  Send,
  Calendar,
  Lock,
  Sparkles,
  Users,
  CheckCircle2,
  Repeat2,
  Coins,
  Settings,
  AlertTriangle,
  Sliders,
  DollarSign,
  ArrowDownUp,
  X,
  ExternalLink,
  Database,
  Download,
  Volume2,
  Radio,
  Eye,
  EyeOff,
  Bell,
  ArrowRight,
  Percent,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  AdminSettings,
  AnnouncementItem,
  AnnouncementSettings,
  CommissionRule,
  NetworkId,
  PlatformCommissionConfig,
  SwapConfig,
  TokenItem,
} from '../types';
import { NETWORKS, StorageService } from '../services/storage';

interface AdminViewProps {
  onExitAdmin: () => void;
  tokens?: TokenItem[];
  onUpdateTokens?: (tokens: TokenItem[]) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  onExitAdmin,
  tokens: propTokens,
  onUpdateTokens,
}) => {
  const [activeTab, setActiveTab] = useState<'commissions' | 'swap' | 'announcements' | 'apikeys' | 'mining' | 'seo' | 'email' | 'pages'>('commissions');
  const [settings, setSettings] = useState<AdminSettings>(() => StorageService.getAdminSettings());
  const [commissionConfig, setCommissionConfig] = useState<PlatformCommissionConfig>(() =>
    StorageService.getCommissionConfig()
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Commission Rule Modal & Form State
  const [isAddingRule, setIsAddingRule] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [ruleFormName, setRuleFormName] = useState('');
  const [ruleFormCategory, setRuleFormCategory] = useState<'all' | 'p2p' | 'swap'>('all');
  const [ruleFormBuyRate, setRuleFormBuyRate] = useState<string>('0.10');
  const [ruleFormSellRate, setRuleFormSellRate] = useState<string>('0.20');
  const [ruleFormMinFee, setRuleFormMinFee] = useState<string>('0.05');
  const [ruleFormFixedFee, setRuleFormFixedFee] = useState<string>('0.00');
  const [ruleFormDescription, setRuleFormDescription] = useState('');
  const [ruleFormIsActive, setRuleFormIsActive] = useState<boolean>(true);

  // Announcement Ticker Bar State
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(() =>
    StorageService.getAnnouncements()
  );
  const [announcementSettings, setAnnouncementSettings] = useState<AnnouncementSettings>(() =>
    StorageService.getAnnouncementSettings()
  );
  const [isAddingAnnouncement, setIsAddingAnnouncement] = useState(false);
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<string | null>(null);
  const [annFormText, setAnnFormText] = useState('');
  const [annFormType, setAnnFormType] = useState<AnnouncementItem['type']>('info');
  const [annFormLinkText, setAnnFormLinkText] = useState('');
  const [annFormLinkUrl, setAnnFormLinkUrl] = useState('');
  const [annFormPriority, setAnnFormPriority] = useState<number>(1);
  const [annFormIsActive, setAnnFormIsActive] = useState<boolean>(true);

  // Tokens state for swap dropdowns and liquidity pool
  const [tokensList, setTokensList] = useState<TokenItem[]>(() =>
    propTokens && propTokens.length > 0 ? propTokens : StorageService.getTokens()
  );

  // Add / Edit Token Modal & Form State
  const [isAddingToken, setIsAddingToken] = useState(false);
  const [editingTokenId, setEditingTokenId] = useState<string | null>(null);
  const [tokenFormSymbol, setTokenFormSymbol] = useState('');
  const [tokenFormName, setTokenFormName] = useState('');
  const [tokenFormNetwork, setTokenFormNetwork] = useState<NetworkId>('dcoine');
  const [tokenFormContract, setTokenFormContract] = useState('');
  const [tokenFormDecimals, setTokenFormDecimals] = useState<number>(18);
  const [tokenFormBalance, setTokenFormBalance] = useState<string>('100');
  const [tokenFormPrice, setTokenFormPrice] = useState<string>('1.00');
  const [tokenFormChange24h, setTokenFormChange24h] = useState<string>('0.0');
  const [tokenFormEnabledInSwap, setTokenFormEnabledInSwap] = useState<boolean>(true);

  // Email composer state
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailRecipientGroup, setEmailRecipientGroup] = useState<'all' | 'miners' | 'merchants'>('all');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('2026-11-05T10:00');

  // Page CMS state
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');
  const [newPageContent, setNewPageContent] = useState('');

  const triggerSaveNotification = (msg = 'Configuration successfully saved!') => {
    StorageService.saveAdminSettings(settings);
    setSaveSuccessMessage(msg);
    setTimeout(() => setSaveSuccessMessage(null), 3000);
    confetti({ particleCount: 30, spread: 60 });
  };

  // ============================================================================
  // PLATFORM COMMISSION & FEE ENGINE HANDLERS
  // ============================================================================
  const handleTogglePublishCommission = () => {
    const updated: PlatformCommissionConfig = {
      ...commissionConfig,
      isPublished: !commissionConfig.isPublished,
    };
    setCommissionConfig(updated);
    StorageService.saveCommissionConfig(updated);
    triggerSaveNotification(
      updated.isPublished
        ? 'Platform commission rates are now PUBLISHED on Swap and P2P pages!'
        : 'Platform commission rates are now HIDDEN from public user pages.'
    );
  };

  const handleUpdateCommissionConfig = (partial: Partial<PlatformCommissionConfig>) => {
    const updated: PlatformCommissionConfig = {
      ...commissionConfig,
      ...partial,
    };
    setCommissionConfig(updated);
    StorageService.saveCommissionConfig(updated);
    triggerSaveNotification('Commission rates updated successfully!');
  };

  const handleOpenAddRule = () => {
    setEditingRuleId(null);
    setRuleFormName('');
    setRuleFormCategory('all');
    setRuleFormBuyRate('0.10');
    setRuleFormSellRate('0.20');
    setRuleFormMinFee('0.05');
    setRuleFormFixedFee('0.00');
    setRuleFormDescription('');
    setRuleFormIsActive(true);
    setIsAddingRule(true);
  };

  const handleOpenEditRule = (rule: CommissionRule) => {
    setEditingRuleId(rule.id);
    setRuleFormName(rule.name);
    setRuleFormCategory(rule.category);
    setRuleFormBuyRate(rule.buyRatePercent.toString());
    setRuleFormSellRate(rule.sellRatePercent.toString());
    setRuleFormMinFee(rule.minFeeUsd.toString());
    setRuleFormFixedFee(rule.fixedFeeUsd.toString());
    setRuleFormDescription(rule.description || '');
    setRuleFormIsActive(rule.isActive);
    setIsAddingRule(true);
  };

  const handleSaveCommissionRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleFormName.trim()) return;

    if (editingRuleId) {
      const updatedRules = commissionConfig.rules.map((r) =>
        r.id === editingRuleId
          ? {
              ...r,
              name: ruleFormName.trim(),
              category: ruleFormCategory,
              buyRatePercent: parseFloat(ruleFormBuyRate) || 0,
              sellRatePercent: parseFloat(ruleFormSellRate) || 0,
              minFeeUsd: parseFloat(ruleFormMinFee) || 0,
              fixedFeeUsd: parseFloat(ruleFormFixedFee) || 0,
              description: ruleFormDescription.trim(),
              isActive: ruleFormIsActive,
            }
          : r
      );
      const updated: PlatformCommissionConfig = {
        ...commissionConfig,
        rules: updatedRules,
      };
      setCommissionConfig(updated);
      StorageService.saveCommissionConfig(updated);
      triggerSaveNotification(`Commission rule "${ruleFormName}" updated!`);
    } else {
      const newRule: CommissionRule = {
        id: `rule-${Date.now()}`,
        name: ruleFormName.trim(),
        category: ruleFormCategory,
        buyRatePercent: parseFloat(ruleFormBuyRate) || 0,
        sellRatePercent: parseFloat(ruleFormSellRate) || 0,
        minFeeUsd: parseFloat(ruleFormMinFee) || 0,
        fixedFeeUsd: parseFloat(ruleFormFixedFee) || 0,
        description: ruleFormDescription.trim(),
        isActive: ruleFormIsActive,
        createdAt: Date.now(),
      };
      const updated: PlatformCommissionConfig = {
        ...commissionConfig,
        rules: [...commissionConfig.rules, newRule],
      };
      setCommissionConfig(updated);
      StorageService.saveCommissionConfig(updated);
      triggerSaveNotification(`New commission rule "${ruleFormName}" created!`);
    }

    setIsAddingRule(false);
    setEditingRuleId(null);
  };

  const handleDeleteCommissionRule = (id: string) => {
    if (commissionConfig.rules.length <= 1) {
      alert('You must have at least one commission tier configured.');
      return;
    }
    const updatedRules = commissionConfig.rules.filter((r) => r.id !== id);
    const updated: PlatformCommissionConfig = {
      ...commissionConfig,
      rules: updatedRules,
    };
    setCommissionConfig(updated);
    StorageService.saveCommissionConfig(updated);
    triggerSaveNotification('Commission rule deleted.');
  };

  const handleToggleRuleActive = (id: string) => {
    const updatedRules = commissionConfig.rules.map((r) =>
      r.id === id ? { ...r, isActive: !r.isActive } : r
    );
    const updated: PlatformCommissionConfig = {
      ...commissionConfig,
      rules: updatedRules,
    };
    setCommissionConfig(updated);
    StorageService.saveCommissionConfig(updated);
    triggerSaveNotification('Commission rule status toggled.');
  };

  // Toggle Ticker Bar Publish / Hide across all pages
  const handleTogglePublishTicker = () => {
    const updated: AnnouncementSettings = {
      ...announcementSettings,
      isPublished: !announcementSettings.isPublished,
    };
    setAnnouncementSettings(updated);
    StorageService.saveAnnouncementSettings(updated);
    triggerSaveNotification(
      updated.isPublished
        ? 'Ticker Announcement Bar is now PUBLISHED and live across all pages!'
        : 'Ticker Announcement Bar is now HIDDEN from all pages.'
    );
  };

  const handleUpdateTickerSpeed = (speed: number) => {
    const updated: AnnouncementSettings = {
      ...announcementSettings,
      speedSeconds: speed,
    };
    setAnnouncementSettings(updated);
    StorageService.saveAnnouncementSettings(updated);
    triggerSaveNotification(`Ticker scroll speed updated to ${speed} seconds.`);
  };

  const handleOpenAddAnnouncement = () => {
    setEditingAnnouncementId(null);
    setAnnFormText('');
    setAnnFormType('info');
    setAnnFormLinkText('');
    setAnnFormLinkUrl('');
    setAnnFormPriority(announcements.length + 1);
    setAnnFormIsActive(true);
    setIsAddingAnnouncement(true);
  };

  const handleOpenEditAnnouncement = (ann: AnnouncementItem) => {
    setEditingAnnouncementId(ann.id);
    setAnnFormText(ann.text);
    setAnnFormType(ann.type);
    setAnnFormLinkText(ann.linkText || '');
    setAnnFormLinkUrl(ann.linkUrl || '');
    setAnnFormPriority(ann.priority || 1);
    setAnnFormIsActive(ann.isActive);
    setIsAddingAnnouncement(true);
  };

  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annFormText.trim()) return;

    if (editingAnnouncementId) {
      // Edit existing
      const updated = announcements.map((a) =>
        a.id === editingAnnouncementId
          ? {
              ...a,
              text: annFormText.trim(),
              type: annFormType,
              linkText: annFormLinkText.trim() || undefined,
              linkUrl: annFormLinkUrl.trim() || undefined,
              priority: annFormPriority,
              isActive: annFormIsActive,
            }
          : a
      );
      setAnnouncements(updated);
      StorageService.saveAnnouncements(updated);
      triggerSaveNotification('Announcement updated successfully!');
    } else {
      // Create new
      const newItem: AnnouncementItem = {
        id: `ann-${Date.now()}`,
        text: annFormText.trim(),
        type: annFormType,
        linkText: annFormLinkText.trim() || undefined,
        linkUrl: annFormLinkUrl.trim() || undefined,
        priority: annFormPriority,
        isActive: annFormIsActive,
        createdAt: Date.now(),
      };
      const updated = [newItem, ...announcements];
      setAnnouncements(updated);
      StorageService.saveAnnouncements(updated);
      triggerSaveNotification('New announcement published to ticker bar!');
    }

    setIsAddingAnnouncement(false);
    setEditingAnnouncementId(null);
  };

  const handleDeleteAnnouncement = (id: string) => {
    const updated = announcements.filter((a) => a.id !== id);
    setAnnouncements(updated);
    StorageService.saveAnnouncements(updated);
    triggerSaveNotification('Announcement deleted.');
  };

  const handleToggleAnnouncementActive = (id: string) => {
    const updated = announcements.map((a) =>
      a.id === id ? { ...a, isActive: !a.isActive } : a
    );
    setAnnouncements(updated);
    StorageService.saveAnnouncements(updated);
    triggerSaveNotification('Announcement visibility toggled.');
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Update Swap Config Helper
  const updateSwapConfig = (partial: Partial<SwapConfig>) => {
    const updatedSwap: SwapConfig = {
      ...settings.swapConfig,
      ...partial,
    };
    const updatedSettings: AdminSettings = {
      ...settings,
      swapConfig: updatedSwap,
    };
    setSettings(updatedSettings);
    StorageService.saveAdminSettings(updatedSettings);
    triggerSaveNotification('Swap protocol configuration updated!');
  };

  // Toggle token presence in Swap Dropdowns
  const handleToggleTokenInSwap = (tokenId: string) => {
    const updated = tokensList.map((t) => {
      if (t.id === tokenId) {
        const currentEnabled = t.enabledInSwap !== false;
        return { ...t, enabledInSwap: !currentEnabled };
      }
      return t;
    });
    setTokensList(updated);
    StorageService.saveTokens(updated);
    if (onUpdateTokens) onUpdateTokens(updated);
    triggerSaveNotification('Swap dropdown token list updated!');
  };

  // Delete token
  const handleDeleteToken = (tokenId: string) => {
    if (tokensList.length <= 2) {
      alert('You must have at least 2 tokens configured for Swap.');
      return;
    }
    const updated = tokensList.filter((t) => t.id !== tokenId);
    setTokensList(updated);
    StorageService.saveTokens(updated);
    if (onUpdateTokens) onUpdateTokens(updated);
    triggerSaveNotification('Token removed from swap and wallet list.');
  };

  // Start Editing a Token
  const startEditToken = (token: TokenItem) => {
    setEditingTokenId(token.id);
    setTokenFormSymbol(token.symbol);
    setTokenFormName(token.name);
    setTokenFormNetwork(token.network);
    setTokenFormContract(token.contractAddress || '');
    setTokenFormDecimals(token.decimals);
    setTokenFormBalance(token.balance.toString());
    setTokenFormPrice(token.priceUsd.toString());
    setTokenFormChange24h(token.change24h.toString());
    setTokenFormEnabledInSwap(token.enabledInSwap !== false);
    setIsAddingToken(false);
  };

  // Save Token Form (Add or Edit)
  const handleSaveTokenForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenFormSymbol.trim()) return;

    const symbolUpper = tokenFormSymbol.trim().toUpperCase();
    const parsedPrice = parseFloat(tokenFormPrice) || 0;
    const parsedBalance = parseFloat(tokenFormBalance) || 0;
    const parsedChange = parseFloat(tokenFormChange24h) || 0;

    let updated: TokenItem[];

    if (editingTokenId) {
      // Edit existing token
      updated = tokensList.map((t) => {
        if (t.id === editingTokenId) {
          return {
            ...t,
            symbol: symbolUpper,
            name: tokenFormName.trim() || symbolUpper,
            network: tokenFormNetwork,
            contractAddress: tokenFormContract.trim() || undefined,
            decimals: tokenFormDecimals,
            balance: parsedBalance,
            priceUsd: parsedPrice,
            change24h: parsedChange,
            enabledInSwap: tokenFormEnabledInSwap,
          };
        }
        return t;
      });
      triggerSaveNotification(`Token ${symbolUpper} details updated successfully!`);
    } else {
      // Create new token
      const newToken: TokenItem = {
        id: `token-${symbolUpper.toLowerCase()}-${Date.now()}`,
        symbol: symbolUpper,
        name: tokenFormName.trim() || symbolUpper,
        network: tokenFormNetwork,
        contractAddress: tokenFormContract.trim() || undefined,
        decimals: tokenFormDecimals,
        balance: parsedBalance,
        priceUsd: parsedPrice,
        change24h: parsedChange,
        enabledInSwap: tokenFormEnabledInSwap,
        isCustom: true,
      };
      updated = [...tokensList, newToken];
      triggerSaveNotification(`New token ${symbolUpper} added to swap dropdowns!`);
    }

    setTokensList(updated);
    StorageService.saveTokens(updated);
    if (onUpdateTokens) onUpdateTokens(updated);

    // Reset Form
    setEditingTokenId(null);
    setIsAddingToken(false);
    setTokenFormSymbol('');
    setTokenFormName('');
    setTokenFormContract('');
    setTokenFormBalance('100');
    setTokenFormPrice('1.00');
    setTokenFormChange24h('0.0');
    setTokenFormEnabledInSwap(true);
  };

  // Cancel Form
  const handleCancelTokenForm = () => {
    setEditingTokenId(null);
    setIsAddingToken(false);
    setTokenFormSymbol('');
    setTokenFormName('');
    setTokenFormContract('');
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailSubject.trim() || !emailBody.trim()) return;

    const newEmailItem = {
      id: `email-${Date.now()}`,
      subject: emailSubject.trim(),
      body: emailBody.trim(),
      recipientGroup: emailRecipientGroup,
      status: isScheduled ? ('scheduled' as const) : ('sent' as const),
      scheduledFor: isScheduled ? scheduleDate : undefined,
      sentAt: isScheduled ? undefined : Date.now(),
    };

    const updated = {
      ...settings,
      emails: [newEmailItem, ...settings.emails],
    };
    setSettings(updated);
    StorageService.saveAdminSettings(updated);

    setEmailSubject('');
    setEmailBody('');
    triggerSaveNotification(isScheduled ? 'Broadcast scheduled!' : 'Email broadcast dispatched to recipients!');
  };

  const handleAddPage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageTitle.trim() || !newPageSlug.trim()) return;

    const newPage = {
      id: `page-${Date.now()}`,
      slug: newPageSlug.trim().toLowerCase().replace(/\s+/g, '-'),
      title: newPageTitle.trim(),
      content: newPageContent.trim() || 'Content coming soon...',
      isPublished: true,
      updatedAt: Date.now(),
    };

    const updated = {
      ...settings,
      pages: [...settings.pages, newPage],
    };
    setSettings(updated);
    StorageService.saveAdminSettings(updated);

    setNewPageTitle('');
    setNewPageSlug('');
    setNewPageContent('');
    triggerSaveNotification('Custom page created successfully!');
  };

  const handleDeletePage = (pageId: string) => {
    const updated = {
      ...settings,
      pages: settings.pages.filter((p) => p.id !== pageId),
    };
    setSettings(updated);
    StorageService.saveAdminSettings(updated);
    triggerSaveNotification('Page removed.');
  };

  // ============================================================================
  // RENDER PLATFORM COMMISSION ENGINE (Master Toggle, Buy/Sell Rates, CRUD Tiers)
  // ============================================================================
  const renderCommissionEngine = () => (
    <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
      {/* 1. Header with Master Publish / Hide Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Percent className="w-5 h-5 text-amber-400" />
              <span>Platform Commission &amp; Fee Engine</span>
            </h2>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                commissionConfig.isPublished
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}
            >
              {commissionConfig.isPublished ? '● PUBLISHED & LIVE ON PAGES' : '● HIDDEN / OFF'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure protocol fee rates for Buy, Sell, P2P Escrow, and DEX Swap transactions, manage custom tiers, and toggle public visibility.
          </p>
        </div>

        {/* Master Publish / Hide Toggle Button */}
        <button
          type="button"
          onClick={handleTogglePublishCommission}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs shadow-lg transition transform active:scale-95 cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            commissionConfig.isPublished
              ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40'
              : 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:from-emerald-400 hover:to-teal-300'
          }`}
        >
          {commissionConfig.isPublished ? (
            <>
              <EyeOff className="w-4 h-4" />
              <span>Hide Commission Rates</span>
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              <span>Publish Commission Rates</span>
            </>
          )}
        </button>
      </div>

      {/* 2. Global Core Commission Rates Grid (Buy & Sell, P2P & Swap) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-amber-400" /> Global Base Commission Rates (Buy &amp; Sell)
          </span>
          <span className="text-[11px] text-slate-500 font-mono">Applies across all non-tier trades</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* P2P Buy Rate */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 hover:border-amber-500/40 transition">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">P2P Buy Commission</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                P2P BUY
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={commissionConfig.p2pBuyRatePercent}
                onChange={(e) =>
                  handleUpdateCommissionConfig({ p2pBuyRatePercent: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-base font-bold font-mono text-amber-400 focus:outline-none focus:border-amber-500"
              />
              <span className="text-xs font-bold text-slate-400">%</span>
            </div>
            <p className="text-[10px] text-slate-500">Charged to fiat buyer upon escrow release</p>
          </div>

          {/* P2P Sell Rate */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 hover:border-amber-500/40 transition">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">P2P Sell Commission</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                P2P SELL
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={commissionConfig.p2pSellRatePercent}
                onChange={(e) =>
                  handleUpdateCommissionConfig({ p2pSellRatePercent: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-base font-bold font-mono text-amber-400 focus:outline-none focus:border-amber-500"
              />
              <span className="text-xs font-bold text-slate-400">%</span>
            </div>
            <p className="text-[10px] text-slate-500">Charged to crypto seller / maker in escrow</p>
          </div>

          {/* Swap Buy / Pay Rate */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 hover:border-amber-500/40 transition">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Swap Buy Commission</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                SWAP BUY
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={commissionConfig.swapBuyRatePercent}
                onChange={(e) =>
                  handleUpdateCommissionConfig({ swapBuyRatePercent: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-base font-bold font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
              />
              <span className="text-xs font-bold text-slate-400">%</span>
            </div>
            <p className="text-[10px] text-slate-500">Routing fee on token input / pay asset</p>
          </div>

          {/* Swap Sell / Receive Rate */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 hover:border-amber-500/40 transition">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Swap Sell Commission</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                SWAP SELL
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={commissionConfig.swapSellRatePercent}
                onChange={(e) =>
                  handleUpdateCommissionConfig({ swapSellRatePercent: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-base font-bold font-mono text-indigo-300 focus:outline-none focus:border-indigo-500"
              />
              <span className="text-xs font-bold text-slate-400">%</span>
            </div>
            <p className="text-[10px] text-slate-500">Liquidity pool cut on output / received asset</p>
          </div>
        </div>
      </div>

      {/* 3. Treasury Wallet & Native Fee Discount Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-white flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-amber-400" /> Platform Fee Treasury Address
            </label>
            <button
              type="button"
              onClick={() => handleCopy(commissionConfig.treasuryWalletAddress, 'treasury_comm')}
              className="text-[10px] text-amber-400 flex items-center gap-1 hover:underline cursor-pointer"
            >
              {copiedKey === 'treasury_comm' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedKey === 'treasury_comm' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <input
            type="text"
            value={commissionConfig.treasuryWalletAddress}
            onChange={(e) => handleUpdateCommissionConfig({ treasuryWalletAddress: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-500"
          />
          <span className="text-[10px] text-slate-500">On-chain contract wallet accumulating protocol commissions</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> DCOIN Utility Fee Discount
            </label>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">{commissionConfig.discountPercent}% OFF</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="1"
              min="0"
              max="90"
              value={commissionConfig.discountPercent}
              onChange={(e) =>
                handleUpdateCommissionConfig({ discountPercent: parseInt(e.target.value, 10) || 0 })
              }
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
            />
            <span className="text-xs font-bold text-slate-400">%</span>
          </div>
          <span className="text-[10px] text-slate-500">Fee discount applied when user pays platform commission with native DCOIN</span>
        </div>
      </div>

      {/* 4. Commission Rules & Tiers Management (CRUD: Add, Edit, Delete) */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-800 pt-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>Commission Tiers &amp; Role Rules</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                {commissionConfig.rules.length} Configured
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Create specific commission exemptions, VIP tiers, and custom rates for P2P merchants or DEX liquidity providers
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAddRule}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition transform active:scale-95 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Commission Tier</span>
          </button>
        </div>

        {/* Rules List Grid */}
        <div className="space-y-2.5">
          {commissionConfig.rules.map((rule) => {
            const categoryBadge =
              rule.category === 'p2p'
                ? { label: 'P2P Escrow Only', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' }
                : rule.category === 'swap'
                ? { label: 'DEX Swap Only', color: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' }
                : { label: 'All (P2P + Swap)', color: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' };

            return (
              <div
                key={rule.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 hover:border-slate-700 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-sm">{rule.name}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${categoryBadge.color}`}>
                      {categoryBadge.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleRuleActive(rule.id)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition cursor-pointer ${
                        rule.isActive
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {rule.isActive ? '● Active' : '○ Paused'}
                    </button>
                  </div>

                  <p className="text-slate-400 text-[11px] leading-relaxed">{rule.description}</p>

                  <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-slate-300 flex-wrap">
                    <span>Buy Commission: <strong className="text-amber-400">{rule.buyRatePercent}%</strong></span>
                    <span>•</span>
                    <span>Sell Commission: <strong className="text-amber-400">{rule.sellRatePercent}%</strong></span>
                    <span>•</span>
                    <span>Min Fee: <strong className="text-slate-200">${rule.minFeeUsd.toFixed(2)}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenEditRule(rule)}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition cursor-pointer"
                    title="Edit Commission Rule"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteCommissionRule(rule.id)}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition cursor-pointer"
                    title="Delete Commission Rule"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-5 pb-24 max-w-4xl mx-auto px-3 sm:px-4">
      {/* Top Banner & Exit Button */}
      <div className="rounded-3xl bg-slate-900 border border-red-500/30 p-5 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/40">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white">System Admin Console</h1>
              <span className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-full font-bold">
                Dev & Protocol Master
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Manage DEX Swap engine, tokens dropdowns, liquidity routing, API keys, SEO & platform economics
            </p>
          </div>
        </div>

        <button
          onClick={onExitAdmin}
          className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 font-semibold transition cursor-pointer"
        >
          Exit Admin Mode
        </button>
      </div>

      {/* Save feedback toast */}
      {saveSuccessMessage && (
        <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{saveSuccessMessage}</span>
        </div>
      )}

      {/* Prominent Platform Commission Quick-Access Header Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500/15 via-slate-900 to-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-white text-sm">Platform Commission &amp; Protocol Fee Engine</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  commissionConfig.isPublished
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {commissionConfig.isPublished ? '● PUBLISHED & LIVE' : '● HIDDEN / PRIVATE'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Current Rates: P2P Buy <strong className="text-amber-400 font-mono">{commissionConfig.p2pBuyRatePercent}%</strong> • P2P Sell <strong className="text-amber-400 font-mono">{commissionConfig.p2pSellRatePercent}%</strong> • Swap Buy <strong className="text-amber-400 font-mono">{commissionConfig.swapBuyRatePercent}%</strong> • Swap Sell <strong className="text-amber-400 font-mono">{commissionConfig.swapSellRatePercent}%</strong>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('commissions')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition shadow-md cursor-pointer whitespace-nowrap ${
              activeTab === 'commissions'
                ? 'bg-amber-500 text-slate-950 font-extrabold shadow-amber-500/20'
                : 'bg-slate-950 hover:bg-slate-800 text-amber-300 border border-amber-500/40'
            }`}
          >
            {activeTab === 'commissions' ? '✓ In Commission Engine' : 'Manage Commission Rates →'}
          </button>
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto no-scrollbar">
        {[
          { id: 'commissions', label: 'Platform Commissions', icon: Percent, badge: 'P2P & Swap Rates' },
          { id: 'swap', label: 'DEX Swap Engine & Tokens', icon: Repeat2, badge: 'Full Dev Control' },
          { id: 'announcements', label: 'Announcement Ticker Bar', icon: Volume2, badge: 'Live Ticker' },
          { id: 'apikeys', label: 'API Keys & Secrets', icon: Key },
          { id: 'mining', label: 'Mining Economy', icon: Pickaxe },
          { id: 'seo', label: 'SEO & Web Pixels', icon: Globe },
          { id: 'email', label: 'Email Broadcasts', icon: Mail },
          { id: 'pages', label: 'Pages & CMS', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ml-1 ${
                    isActive ? 'bg-slate-950 text-amber-400' : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* DEDICATED PLATFORM COMMISSIONS TAB */}
      {activeTab === 'commissions' && (
        <div className="space-y-6">
          {renderCommissionEngine()}
        </div>
      )}

      {/* 1. DEX SWAP & DROPDOWN MANAGEMENT TAB (Full Dev Functionality) */}
      {activeTab === 'swap' && (
        <div className="space-y-6">
          {/* Target CSS Selector 1: Platform Commission & Fee Engine */}
          {renderCommissionEngine()}

          {/* Master Status & Announcements Card */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white">DEX Swap Protocol Master Status</h2>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      settings.swapConfig.enabled
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {settings.swapConfig.enabled ? '● Swap Live & Active' : '● Maintenance / Paused'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Control the entire Swap section runtime, circuit breaker, banner messages, and token pools
                </p>
              </div>

              <button
                type="button"
                onClick={() => updateSwapConfig({ enabled: !settings.swapConfig.enabled })}
                className={`px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer ${
                  settings.swapConfig.enabled
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30'
                    : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                }`}
              >
                {settings.swapConfig.enabled ? 'Pause Swap (Circuit Breaker)' : 'Activate Swap Engine'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-white block mb-1">Custom Announcement / Banner Text</label>
                <input
                  type="text"
                  value={settings.swapConfig.announcementBanner}
                  onChange={(e) => updateSwapConfig({ announcementBanner: e.target.value })}
                  placeholder="e.g. ⚡ Zero protocol fees on Dcoine Mainnet this week!"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
                <span className="text-[10px] text-slate-500">Displayed prominently at top of the Swap page (leave empty to hide)</span>
              </div>

              <div>
                <label className="text-xs font-bold text-white block mb-1">Maintenance Notice Message</label>
                <input
                  type="text"
                  value={settings.swapConfig.maintenanceMessage}
                  onChange={(e) => updateSwapConfig({ maintenanceMessage: e.target.value })}
                  placeholder="Message shown when Swap is paused..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
                <span className="text-[10px] text-slate-500">Shown to users if Swap is paused</span>
              </div>
            </div>
          </div>

          {/* SWAP DROPDOWN TOKENS & COINS MANAGER (Directly controls Selector 1 & Selector 2) */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white">Swap Dropdowns: Tokens & Coins Pool</h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    {tokensList.filter((t) => t.enabledInSwap !== false).length} Active in Dropdowns
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Directly edit, add, delete, and toggle coins for the &quot;You Pay&quot; and &quot;You Receive&quot; dropdown menus
                </p>
              </div>

              {!isAddingToken && !editingTokenId && (
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingToken(true);
                    setEditingTokenId(null);
                    setTokenFormSymbol('');
                    setTokenFormName('');
                    setTokenFormContract('');
                    setTokenFormBalance('500');
                    setTokenFormPrice('1.00');
                    setTokenFormChange24h('0.0');
                    setTokenFormEnabledInSwap(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Token / Coin</span>
                </button>
              )}
            </div>

            {/* Add / Edit Token Modal Form */}
            {(isAddingToken || editingTokenId) && (
              <form
                onSubmit={handleSaveTokenForm}
                className="p-4 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-3 animate-in fade-in duration-150"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-xs text-amber-400">
                    {editingTokenId ? `Edit Token: ${tokenFormSymbol}` : 'Add New Coin / Token to Swap Dropdowns'}
                  </span>
                  <button
                    type="button"
                    onClick={handleCancelTokenForm}
                    className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Symbol *</label>
                    <input
                      type="text"
                      required
                      value={tokenFormSymbol}
                      onChange={(e) => setTokenFormSymbol(e.target.value)}
                      placeholder="e.g. PEPE, SOL, DAI"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white uppercase focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Token Name *</label>
                    <input
                      type="text"
                      required
                      value={tokenFormName}
                      onChange={(e) => setTokenFormName(e.target.value)}
                      placeholder="e.g. Pepe Coin"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Network *</label>
                    <select
                      value={tokenFormNetwork}
                      onChange={(e) => setTokenFormNetwork(e.target.value as NetworkId)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      {NETWORKS.map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.name} ({n.symbol})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Price (USD) *</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={tokenFormPrice}
                      onChange={(e) => setTokenFormPrice(e.target.value)}
                      placeholder="e.g. 1.48"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">User Balance in Wallet</label>
                    <input
                      type="number"
                      step="any"
                      value={tokenFormBalance}
                      onChange={(e) => setTokenFormBalance(e.target.value)}
                      placeholder="e.g. 500"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">24h Change (%)</label>
                    <input
                      type="number"
                      step="any"
                      value={tokenFormChange24h}
                      onChange={(e) => setTokenFormChange24h(e.target.value)}
                      placeholder="e.g. +4.2"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-300 block mb-1">Contract Address (Optional)</label>
                    <input
                      type="text"
                      value={tokenFormContract}
                      onChange={(e) => setTokenFormContract(e.target.value)}
                      placeholder="0x... or native"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Decimals</label>
                    <input
                      type="number"
                      value={tokenFormDecimals}
                      onChange={(e) => setTokenFormDecimals(parseInt(e.target.value, 10) || 18)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={tokenFormEnabledInSwap}
                      onChange={(e) => setTokenFormEnabledInSwap(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                    />
                    <span>Enabled in Swap &quot;You Pay&quot; &amp; &quot;You Receive&quot; Dropdowns</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCancelTokenForm}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition"
                    >
                      {editingTokenId ? 'Save Token Changes' : 'Add Token to Pool'}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Tokens Table List */}
            <div className="space-y-2">
              <div className="hidden sm:grid sm:grid-cols-12 gap-2 px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <span className="col-span-3">Coin / Token</span>
                <span className="col-span-2">Network</span>
                <span className="col-span-2">Price USD</span>
                <span className="col-span-2">Balance</span>
                <span className="col-span-1 text-center">Swap Dropdown</span>
                <span className="col-span-2 text-right">Actions</span>
              </div>

              {tokensList.map((token) => {
                const isEnabled = token.enabledInSwap !== false;
                return (
                  <div
                    key={token.id}
                    className={`p-3 rounded-2xl bg-slate-950 border transition flex flex-col sm:grid sm:grid-cols-12 sm:items-center gap-2 text-xs ${
                      isEnabled ? 'border-slate-800 hover:border-slate-700' : 'border-rose-950/40 opacity-70'
                    }`}
                  >
                    {/* Symbol & Name */}
                    <div className="sm:col-span-3 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs shrink-0">
                        {token.symbol.slice(0, 3)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white text-sm">{token.symbol}</span>
                          {token.isCustom && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                              Custom
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 truncate block">{token.name}</span>
                      </div>
                    </div>

                    {/* Network */}
                    <div className="sm:col-span-2 text-slate-300 font-medium">
                      <span className="capitalize">{token.network}</span>
                    </div>

                    {/* Price USD */}
                    <div className="sm:col-span-2">
                      <span className="font-mono font-bold text-amber-300">${token.priceUsd.toLocaleString()}</span>
                      <span
                        className={`text-[10px] ml-1 font-semibold ${
                          token.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {token.change24h >= 0 ? `+${token.change24h}%` : `${token.change24h}%`}
                      </span>
                    </div>

                    {/* Balance */}
                    <div className="sm:col-span-2 font-mono text-slate-300">
                      {token.balance.toLocaleString()}
                    </div>

                    {/* In Swap Dropdown Toggle Switch */}
                    <div className="sm:col-span-1 flex justify-center">
                      <button
                        type="button"
                        onClick={() => handleToggleTokenInSwap(token.id)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                          isEnabled
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                            : 'bg-slate-900 text-slate-500 border border-slate-800 hover:text-slate-300'
                        }`}
                        title="Click to toggle availability in Swap Dropdown"
                      >
                        {isEnabled ? 'In Dropdown' : 'Hidden'}
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="sm:col-span-2 flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => startEditToken(token)}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition cursor-pointer"
                        title="Edit token parameters"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteToken(token.id)}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-800 transition cursor-pointer"
                        title="Remove token"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SMART CONTRACT & LIQUIDITY ROUTER (DEV FUNCTIONALITY) */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white">Smart Contract & Liquidity Router (Dev Settings)</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure DEX router contract, automated pathfinding engine, factory address, and gas calculations
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white">Liquidity Router Engine Name</label>
                  <span className="text-[10px] text-amber-400 font-mono">Routing Provider</span>
                </div>
                <input
                  type="text"
                  value={settings.swapConfig.routerName}
                  onChange={(e) => updateSwapConfig({ routerName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
                />
                <span className="text-[10px] text-slate-500">e.g. Dcoine Multi-Hop Auto Router, Uniswap V3, 1inch</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white">Router Smart Contract Address</label>
                  <button
                    type="button"
                    onClick={() => handleCopy(settings.swapConfig.routerContractAddress, 'routerContract')}
                    className="text-[10px] text-amber-400 flex items-center gap-1 hover:underline"
                  >
                    {copiedKey === 'routerContract' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copy
                  </button>
                </div>
                <input
                  type="text"
                  value={settings.swapConfig.routerContractAddress}
                  onChange={(e) => updateSwapConfig({ routerContractAddress: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-500"
                />
                <span className="text-[10px] text-slate-500">EVM Smart contract address handling token swaps</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white">Factory Smart Contract Address</label>
                  <button
                    type="button"
                    onClick={() => handleCopy(settings.swapConfig.factoryContractAddress, 'factoryContract')}
                    className="text-[10px] text-amber-400 flex items-center gap-1 hover:underline"
                  >
                    {copiedKey === 'factoryContract' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copy
                  </button>
                </div>
                <input
                  type="text"
                  value={settings.swapConfig.factoryContractAddress}
                  onChange={(e) => updateSwapConfig({ factoryContractAddress: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                />
                <span className="text-[10px] text-slate-500">Pair factory contract for pool creation and liquidity math</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white">Gas Limit per Swap</label>
                  <span className="text-[10px] text-slate-400 font-mono">gas units</span>
                </div>
                <input
                  type="number"
                  value={settings.swapConfig.gasLimit}
                  onChange={(e) => updateSwapConfig({ gasLimit: parseInt(e.target.value, 10) || 250000 })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                />
                <span className="text-[10px] text-slate-500">Max execution gas units for multi-hop execution</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white">Estimated Gas Fee Label</label>
                  <span className="text-[10px] text-emerald-400">Displayed in Details</span>
                </div>
                <input
                  type="text"
                  value={settings.swapConfig.estimatedGasFee}
                  onChange={(e) => updateSwapConfig({ estimatedGasFee: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400 focus:outline-none focus:border-amber-500"
                />
                <span className="text-[10px] text-slate-500">Estimated gas fee shown in the transaction summary (e.g. &lt; $0.05)</span>
              </div>
            </div>
          </div>

          {/* PROTOCOL FEES & TREASURY COLLECTOR (DEV FUNCTIONALITY) */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white">Protocol Swap Fees &amp; Treasury</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Set liquidity fee percentage and the on-chain treasury recipient wallet address
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="text-xs font-bold text-white block">Platform Protocol Fee (%)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="5"
                    value={settings.swapConfig.protocolFeePercent}
                    onChange={(e) =>
                      updateSwapConfig({ protocolFeePercent: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm font-mono text-amber-300 focus:outline-none"
                  />
                  <span className="text-xs font-bold text-slate-400">%</span>
                </div>
                <span className="text-[10px] text-slate-500">Standard decentralized swap fee (e.g. 0.15% or 0.25%)</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white">Treasury / Fee Collector Address</label>
                  <button
                    type="button"
                    onClick={() => handleCopy(settings.swapConfig.feeCollectorAddress, 'treasury')}
                    className="text-[10px] text-amber-400 flex items-center gap-1 hover:underline"
                  >
                    {copiedKey === 'treasury' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copy
                  </button>
                </div>
                <input
                  type="text"
                  value={settings.swapConfig.feeCollectorAddress}
                  onChange={(e) => updateSwapConfig({ feeCollectorAddress: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                />
                <span className="text-[10px] text-slate-500">Protocol fees collected from trades are directed here</span>
              </div>
            </div>
          </div>

          {/* SLIPPAGE TOLERANCE & TRADING LIMITS (DEV FUNCTIONALITY) */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white">Slippage Tolerance Presets &amp; Trade Limits</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure user slippage buttons, minimum/maximum trade guardrails, and price impact warnings
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="text-xs font-bold text-white block">Default Slippage (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.swapConfig.defaultSlippage}
                  onChange={(e) => updateSwapConfig({ defaultSlippage: parseFloat(e.target.value) || 0.5 })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-amber-400 focus:outline-none"
                />
                <span className="text-[10px] text-slate-500">Preselected tolerance for swap execution</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 sm:col-span-2">
                <label className="text-xs font-bold text-white block">Slippage Preset Buttons (Comma Separated)</label>
                <input
                  type="text"
                  value={settings.swapConfig.slippagePresets.join(', ')}
                  onChange={(e) => {
                    const parsed = e.target.value
                      .split(',')
                      .map((s) => parseFloat(s.trim()))
                      .filter((n) => !isNaN(n) && n > 0);
                    if (parsed.length > 0) updateSwapConfig({ slippagePresets: parsed });
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-white focus:outline-none"
                />
                <span className="text-[10px] text-slate-500">Buttons rendered in the Swap Settings drawer</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="text-xs font-bold text-white block">Minimum Swap Trade (USD)</label>
                <input
                  type="number"
                  step="0.5"
                  value={settings.swapConfig.minSwapAmountUsd}
                  onChange={(e) => updateSwapConfig({ minSwapAmountUsd: parseFloat(e.target.value) || 1.0 })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-white focus:outline-none"
                />
                <span className="text-[10px] text-slate-500">Lowest trade size allowed</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="text-xs font-bold text-white block">Maximum Swap Trade (USD)</label>
                <input
                  type="number"
                  step="1000"
                  value={settings.swapConfig.maxSwapAmountUsd}
                  onChange={(e) => updateSwapConfig({ maxSwapAmountUsd: parseFloat(e.target.value) || 50000.0 })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-white focus:outline-none"
                />
                <span className="text-[10px] text-slate-500">Safety circuit per transaction</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="text-xs font-bold text-white block">Price Impact Warning (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={settings.swapConfig.priceImpactWarningPercent}
                  onChange={(e) =>
                    updateSwapConfig({ priceImpactWarningPercent: parseFloat(e.target.value) || 5.0 })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-amber-400 focus:outline-none"
                />
                <span className="text-[10px] text-slate-500">Triggers high price impact alert</span>
              </div>
            </div>
          </div>

          {/* NETWORKS ENABLED IN SWAP SELECTOR (DEV FUNCTIONALITY) */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white">Networks Supported in Swap View</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Toggle which blockchain networks appear in the Swap header network dropdown selector
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {NETWORKS.map((n) => {
                const isSelected = settings.swapConfig.supportedNetworks.includes(n.id);
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => {
                      const current = settings.swapConfig.supportedNetworks;
                      let updatedNets: NetworkId[];
                      if (isSelected) {
                        if (current.length <= 1) {
                          alert('At least one network must remain supported.');
                          return;
                        }
                        updatedNets = current.filter((id) => id !== n.id);
                      } else {
                        updatedNets = [...current, n.id];
                      }
                      updateSwapConfig({ supportedNetworks: updatedNets });
                    }}
                    className={`p-3 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/40 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs">{n.name}</div>
                      <div className="text-[10px] text-slate-500">Chain ID: {n.chainId}</div>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                        isSelected ? 'bg-amber-500 border-amber-500 text-slate-950 font-bold' : 'border-slate-700'
                      }`}
                    >
                      {isSelected ? '✓' : ''}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* FEATURE CONTROLS */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white">Advanced Feature Toggles</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Control user permissions such as custom token contract imports
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-white block">Allow Users to Import Custom Token Contracts</span>
                <span className="text-[10px] text-slate-400">
                  When enabled, users can click &quot;+ Import Token&quot; in Swap and paste custom ERC20 contract addresses
                </span>
              </div>
              <button
                type="button"
                onClick={() => updateSwapConfig({ allowCustomTokens: !settings.swapConfig.allowCustomTokens })}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                  settings.swapConfig.allowCustomTokens
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {settings.swapConfig.allowCustomTokens ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. ANNOUNCEMENT TICKER BAR TAB (Add, Edit, Delete, Toggle Publish/Hide) */}
      {activeTab === 'announcements' && (
        <div className="space-y-6">
          {/* Master Ticker Bar Status & Toggle */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-white">Announcement Ticker Bar</h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      announcementSettings.isPublished
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {announcementSettings.isPublished ? '● PUBLISHED & ACTIVE' : '● HIDDEN / OFF'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Controls the live scrolling ticker bar displayed under the header bar across all pages and devices (PC, tablet, mobile).
                </p>
              </div>

              {/* Master Publish / Hide Toggle Button */}
              <button
                type="button"
                onClick={handleTogglePublishTicker}
                className={`px-4 py-2.5 rounded-2xl font-bold text-xs shadow-lg transition transform active:scale-95 cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                  announcementSettings.isPublished
                    ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:from-emerald-400 hover:to-teal-300'
                }`}
              >
                {announcementSettings.isPublished ? (
                  <>
                    <EyeOff className="w-4 h-4" />
                    <span>Hide Ticker Bar</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    <span>Publish Ticker Bar</span>
                  </>
                )}
              </button>
            </div>

            {/* Scroll Speed Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div>
                <span className="text-xs font-semibold text-slate-300 block">Scroll Speed</span>
                <span className="text-[11px] text-slate-500">Duration of one complete marquee loop</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { label: 'Fast (35s)', speed: 35 },
                  { label: 'Normal (55s)', speed: 55 },
                  { label: 'Smooth & Slow (75s)', speed: 75 },
                  { label: 'Very Relaxed (95s)', speed: 95 },
                ].map((s) => (
                  <button
                    key={s.speed}
                    type="button"
                    onClick={() => handleUpdateTickerSpeed(s.speed)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      announcementSettings.speedSeconds === s.speed
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Ticker Preview */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" /> Live Ticker Bar Preview (As Seen by Users)
                </span>
                <span className="font-mono text-[10px] text-amber-400">
                  {announcements.filter((a) => a.isActive).length} Active Messages
                </span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 overflow-hidden text-xs text-slate-200">
                {announcements.filter((a) => a.isActive).length === 0 ? (
                  <p className="text-slate-500 italic text-center py-1">No active announcements to display.</p>
                ) : (
                  <div
                    className="flex items-center gap-6 whitespace-nowrap animate-marquee"
                    style={{ animationDuration: `${announcementSettings.speedSeconds || 55}s` }}
                  >
                    {[...announcements.filter((a) => a.isActive), ...announcements.filter((a) => a.isActive)].map(
                      (item, i) => (
                        <div key={`${item.id}-${i}`} className="inline-flex items-center gap-2 shrink-0">
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            {item.type}
                          </span>
                          <span className="text-[11px] text-slate-200 font-medium">{item.text}</span>
                          {item.linkText && (
                            <span className="text-[11px] font-bold text-amber-400 underline">{item.linkText}</span>
                          )}
                          <span className="text-slate-700 px-1 font-bold">•</span>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Announcements CRUD List Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Announcement Messages ({announcements.length})</h3>
                <p className="text-xs text-slate-400">Add, edit, reorder, or delete ticker announcements</p>
              </div>

              <button
                type="button"
                onClick={handleOpenAddAnnouncement}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Announcement</span>
              </button>
            </div>

            {/* List */}
            <div className="space-y-3">
              {announcements.length === 0 ? (
                <div className="p-8 text-center text-slate-500 rounded-2xl bg-slate-950 border border-slate-800">
                  <p className="text-xs">No announcements yet. Click &quot;Add Announcement&quot; to create one.</p>
                </div>
              ) : (
                announcements.map((ann, idx) => (
                  <div
                    key={ann.id}
                    className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
                      ann.isActive
                        ? 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        : 'bg-slate-950/40 border-slate-900 opacity-60'
                    }`}
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 font-mono font-bold">#{idx + 1}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            ann.type === 'urgent'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : ann.type === 'reward'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : ann.type === 'event'
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              : ann.type === 'update'
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {ann.type}
                        </span>
                        <span
                          className={`text-[10px] font-semibold ${
                            ann.isActive ? 'text-emerald-400' : 'text-slate-500'
                          }`}
                        >
                          {ann.isActive ? '● Active' : '○ Paused'}
                        </span>
                      </div>

                      <p className="text-slate-200 text-xs font-medium leading-relaxed">{ann.text}</p>

                      {ann.linkText && (
                        <div className="flex items-center gap-1.5 text-[11px] text-amber-400">
                          <ArrowRight className="w-3 h-3" />
                          <span>Link: <strong>{ann.linkText}</strong> (Target: #{ann.linkUrl})</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handleToggleAnnouncementActive(ann.id)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                          ann.isActive
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                        title="Toggle visibility"
                      >
                        {ann.isActive ? 'Active' : 'Paused'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEditAnnouncement(ann)}
                        className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-amber-400 transition cursor-pointer"
                        title="Edit announcement"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteAnnouncement(ann.id)}
                        className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                        title="Delete announcement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT ANNOUNCEMENT MODAL */}
      {isAddingAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  {editingAnnouncementId ? 'Edit Announcement' : 'New Ticker Announcement'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddingAnnouncement(false);
                  setEditingAnnouncementId(null);
                }}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAnnouncement} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Announcement Message Text <span className="text-amber-400">*</span>
                </label>
                <textarea
                  value={annFormText}
                  onChange={(e) => setAnnFormText(e.target.value)}
                  placeholder="e.g. 🚀 Mainnet 2.0 Mining Pool yield boosted by 15% for next 48 hours!"
                  rows={3}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Category / Tag</label>
                  <select
                    value={annFormType}
                    onChange={(e) => setAnnFormType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="info">INFO (General)</option>
                    <option value="reward">REWARD (Mining / Yield)</option>
                    <option value="urgent">URGENT (Security / Escrow)</option>
                    <option value="event">EVENT (Launch / Promo)</option>
                    <option value="update">UPDATE (Platform feature)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Display Priority</label>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={annFormPriority}
                    onChange={(e) => setAnnFormPriority(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Button Link Label (Optional)
                  </label>
                  <input
                    type="text"
                    value={annFormLinkText}
                    onChange={(e) => setAnnFormLinkText(e.target.value)}
                    placeholder="e.g. Start Mining, Open P2P"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Link Target Tab (Optional)
                  </label>
                  <select
                    value={annFormLinkUrl}
                    onChange={(e) => setAnnFormLinkUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">No Link</option>
                    <option value="mining">Mining Page</option>
                    <option value="p2p">P2P Escrow Market</option>
                    <option value="swap">DEX Swap</option>
                    <option value="wallet">Wallet Page</option>
                    <option value="dashboard">Dashboard</option>
                    <option value="explorer">Explorer / Browser</option>
                    <option value="news">News Page</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="annActiveCheckbox"
                  checked={annFormIsActive}
                  onChange={(e) => setAnnFormIsActive(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="annActiveCheckbox" className="text-xs font-semibold text-slate-300 cursor-pointer">
                  Publish immediately (Active in live ticker)
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingAnnouncement(false);
                    setEditingAnnouncementId(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-medium transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-md cursor-pointer"
                >
                  {editingAnnouncementId ? 'Save Changes' : 'Publish Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. API KEYS & FRONTEND COPY-PASTE TAB */}
      {activeTab === 'apikeys' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
          <div>
            <h2 className="text-base font-bold text-white">Frontend API Keys &amp; Credentials Management</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Copy any key directly, or paste new values and click Save to apply immediately.
            </p>
          </div>

          {/* Supabase Schema Download & Quick Copy Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-950 to-slate-950 border border-emerald-500/30 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Supabase PostgreSQL Schema (Full Project)</h3>
                  <p className="text-[11px] text-slate-400">
                    Ready-to-run SQL schema with 14 tables, foreign keys, triggers, RLS policies &amp; initial seed data
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="/supabase-schema.sql"
                  download="supabase-schema.sql"
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download schema.sql</span>
                </a>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const res = await fetch('/supabase-schema.sql');
                      const text = await res.text();
                      navigator.clipboard.writeText(text);
                      triggerSaveNotification('Supabase schema copied to clipboard! Paste into Supabase SQL editor.');
                    } catch (err) {
                      triggerSaveNotification('Download the schema.sql file using the download button.');
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy SQL</span>
                </button>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80 flex flex-wrap gap-2">
              <span className="font-semibold text-emerald-300">Included Tables:</span>
              <span>profiles</span>•
              <span>wallets</span>•
              <span>tokens</span>•
              <span>mining_sessions</span>•
              <span>referrals</span>•
              <span>p2p_orders</span>•
              <span>p2p_trades</span>•
              <span>p2p_trade_messages</span>•
              <span>transactions</span>•
              <span>news_articles</span>•
              <span>news_comments</span>•
              <span>dapps</span>•
              <span>admin_settings</span>•
              <span>admin_emails</span>•
              <span>cms_pages</span>•
              <span>platform_commission_config</span>•
              <span>commission_rules</span>
            </div>
          </div>

          <div className="space-y-4">
            {[
              {
                id: 'rpcDcoineEndpoint',
                label: 'Dcoine RPC Node URL',
                val: settings.apiKeys.rpcDcoineEndpoint,
                desc: 'Web3 RPC provider endpoint for Dcoine consensus network',
              },
              {
                id: 'etherscanApiKey',
                label: 'Etherscan / Block Explorer API Key',
                val: settings.apiKeys.etherscanApiKey,
                desc: 'Used to fetch live on-chain confirmations and smart contract ABIs',
              },
              {
                id: 'coinGeckoApiKey',
                label: 'CoinGecko / CoinMarketCap API Key',
                val: settings.apiKeys.coinGeckoApiKey,
                desc: 'Real-time cryptocurrency spot pricing and 24h market metrics',
              },
              {
                id: 'supabaseProjectUrl',
                label: 'Supabase / Database URL',
                val: settings.apiKeys.supabaseProjectUrl,
                desc: 'Direct backend endpoint for relational state replication',
              },
              {
                id: 'supabaseAnonKey',
                label: 'Supabase Anon Public API Key',
                val: settings.apiKeys.supabaseAnonKey,
                desc: 'Client-side authentication and real-time socket subscription key',
              },
              {
                id: 'bscscanApiKey',
                label: 'BSCScan API Key',
                val: settings.apiKeys.bscscanApiKey,
                desc: 'BNB Smart Chain block validator telemetry key',
              },
            ].map((field) => (
              <div key={field.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-white">{field.label}</label>
                    <p className="text-[10px] text-slate-400">{field.desc}</p>
                  </div>
                  <button
                    onClick={() => handleCopy(field.val, field.id)}
                    className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-[11px] text-amber-400 border border-slate-800 flex items-center gap-1 transition cursor-pointer"
                  >
                    {copiedKey === field.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === field.id ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={field.val}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      apiKeys: { ...settings.apiKeys, [field.id]: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            ))}
          </div>

          <button
            onClick={() => triggerSaveNotification('API credentials successfully saved!')}
            className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save All API Credentials</span>
          </button>
        </div>
      )}

      {/* 3. MINING ECONOMY TAB */}
      {activeTab === 'mining' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
          <div>
            <h2 className="text-base font-bold text-white">Mining Rewards &amp; Platform Economics</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Adjust base hashrate emission rates, session durations, and referral bonuses.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <label className="text-xs font-bold text-white">Base Mining Rate (DCOIN / Hour)</label>
              <input
                type="number"
                step="0.05"
                value={settings.miningConfig.baseRatePerHour}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    miningConfig: {
                      ...settings.miningConfig,
                      baseRatePerHour: parseFloat(e.target.value) || 1.25,
                    },
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm font-mono text-amber-300 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500">Default rate rewarded before referral boosts</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <label className="text-xs font-bold text-white">Session Duration (Hours)</label>
              <input
                type="number"
                value={settings.miningConfig.sessionDurationHours}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    miningConfig: {
                      ...settings.miningConfig,
                      sessionDurationHours: parseInt(e.target.value, 10) || 24,
                    },
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm font-mono text-white focus:outline-none"
              />
              <span className="text-[10px] text-slate-500">Standard 24-hour cycle lock</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <label className="text-xs font-bold text-white">Referral Bonus Percentage (%)</label>
              <input
                type="number"
                value={settings.miningConfig.referralBonusPercent}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    miningConfig: {
                      ...settings.miningConfig,
                      referralBonusPercent: parseInt(e.target.value, 10) || 10,
                    },
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm font-mono text-emerald-400 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500">Bonus hashrate granted per active referee</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <label className="text-xs font-bold text-white">Minimum Withdrawal (DCOIN)</label>
              <input
                type="number"
                value={settings.miningConfig.minWithdrawalDcoin}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    miningConfig: {
                      ...settings.miningConfig,
                      minWithdrawalDcoin: parseFloat(e.target.value) || 10,
                    },
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm font-mono text-white focus:outline-none"
              />
              <span className="text-[10px] text-slate-500">Threshold required before on-chain transfer</span>
            </div>
          </div>

          <button
            onClick={() => triggerSaveNotification('Mining parameters updated!')}
            className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Apply Mining Parameters</span>
          </button>
        </div>
      )}

      {/* 4. SEO & WEB PIXELS TAB */}
      {activeTab === 'seo' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
          <div>
            <h2 className="text-base font-bold text-white">SEO Meta Tags &amp; Web Tracking Pixels</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Connect Google Search Console, Google Analytics 4, Tag Manager, and Facebook Pixel.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { id: 'googleSearchConsoleTag', label: 'Google Search Console Verification Tag', val: settings.seo.googleSearchConsoleTag },
              { id: 'googleAnalyticsId', label: 'Google Analytics 4 Measurement ID (G-XXXXX)', val: settings.seo.googleAnalyticsId },
              { id: 'googleTagManagerId', label: 'Google Tag Manager ID (GTM-XXXXX)', val: settings.seo.googleTagManagerId },
              { id: 'facebookPixelId', label: 'Meta / Facebook Pixel ID', val: settings.seo.facebookPixelId },
              { id: 'googleDomainVerification', label: 'Domain DNS Verification Token', val: settings.seo.googleDomainVerification },
              { id: 'customMetaKeywords', label: 'Custom Global Keywords (comma separated)', val: settings.seo.customMetaKeywords },
            ].map((field) => (
              <div key={field.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <label className="text-xs font-bold text-white">{field.label}</label>
                <input
                  type="text"
                  value={field.val}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      seo: { ...settings.seo, [field.id]: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            ))}
          </div>

          <button
            onClick={() => triggerSaveNotification('SEO verification tags updated!')}
            className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save SEO &amp; Tracking Configuration</span>
          </button>
        </div>
      )}

      {/* 5. EMAIL BROADCASTS TAB */}
      {activeTab === 'email' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
          <div>
            <h2 className="text-base font-bold text-white">Email Dispatch &amp; Notification Engine</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Compose custom email broadcasts to registered miners, P2P merchants, or the entire userbase.
            </p>
          </div>

          <form onSubmit={handleSendEmail} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Target Audience</label>
              <select
                value={emailRecipientGroup}
                onChange={(e) => setEmailRecipientGroup(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
              >
                <option value="all">All Registered Users (Global)</option>
                <option value="miners">Active Miners Only</option>
                <option value="merchants">Verified P2P Merchants Only</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Subject</label>
              <input
                type="text"
                required
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Important Announcement..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-medium"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Message Content</label>
              <textarea
                required
                rows={4}
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="Write message to community..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400">
                <input
                  type="checkbox"
                  checked={isScheduled}
                  onChange={(e) => setIsScheduled(e.target.checked)}
                  className="rounded text-amber-500"
                />
                <span>Schedule for later date</span>
              </label>

              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isScheduled ? 'Schedule Broadcast' : 'Dispatch Email Now'}</span>
              </button>
            </div>
          </form>

          {/* Email History */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 block">Recent Broadcasts</span>
            {settings.emails.map((e) => (
              <div key={e.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{e.subject}</span>
                  <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    {e.status}
                  </span>
                </div>
                <p className="text-slate-400 whitespace-pre-wrap">{e.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. PAGES & CMS TAB */}
      {activeTab === 'pages' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
          <div>
            <h2 className="text-base font-bold text-white">Content Pages &amp; Legal Terms CMS</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Add new custom pages (e.g. Whitepaper, Escrow Rules, Privacy) and edit existing entries.
            </p>
          </div>

          {/* Add Page Form */}
          <form onSubmit={handleAddPage} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Page Title</label>
                <input
                  type="text"
                  required
                  value={newPageTitle}
                  onChange={(e) => setNewPageTitle(e.target.value)}
                  placeholder="e.g. Whitepaper"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">URL Slug</label>
                <input
                  type="text"
                  required
                  value={newPageSlug}
                  onChange={(e) => setNewPageSlug(e.target.value)}
                  placeholder="whitepaper"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Content</label>
              <textarea
                rows={3}
                value={newPageContent}
                onChange={(e) => setNewPageContent(e.target.value)}
                placeholder="Enter page text..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
            >
              + Create New Page
            </button>
          </form>

          {/* Pages List */}
          <div className="space-y-3">
            {settings.pages.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{p.title}</span>
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                      /{p.slug}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeletePage(p.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer"
                    title="Delete page"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-slate-400 leading-relaxed">{p.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Commission Rule Add/Edit Modal */}
      {isAddingRule && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Percent className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">
                  {editingRuleId ? 'Edit Commission Tier' : 'Add New Commission Tier'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddingRule(false);
                  setEditingRuleId(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCommissionRule} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Tier / Rule Name *</label>
                <input
                  type="text"
                  required
                  value={ruleFormName}
                  onChange={(e) => setRuleFormName(e.target.value)}
                  placeholder="e.g. VIP Merchant Tier, Promo Campaign"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Applicable Category</label>
                  <select
                    value={ruleFormCategory}
                    onChange={(e) => setRuleFormCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="all">All Platforms (P2P + DEX Swap)</option>
                    <option value="p2p">P2P Escrow Trading Only</option>
                    <option value="swap">DEX Liquidity Swap Only</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Status</label>
                  <label className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ruleFormIsActive}
                      onChange={(e) => setRuleFormIsActive(e.target.checked)}
                      className="rounded text-amber-500"
                    />
                    <span>Active &amp; Enforced</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Buy Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    required
                    value={ruleFormBuyRate}
                    onChange={(e) => setRuleFormBuyRate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-amber-400 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Sell Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    required
                    value={ruleFormSellRate}
                    onChange={(e) => setRuleFormSellRate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-amber-400 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Min Fee ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={ruleFormMinFee}
                    onChange={(e) => setRuleFormMinFee(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Fixed Fee ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={ruleFormFixedFee}
                    onChange={(e) => setRuleFormFixedFee(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Description / Conditions</label>
                <textarea
                  rows={2}
                  value={ruleFormDescription}
                  onChange={(e) => setRuleFormDescription(e.target.value)}
                  placeholder="Notes on who qualifies for this rate tier..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingRule(false);
                    setEditingRuleId(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
                >
                  {editingRuleId ? 'Save Changes' : 'Create Commission Tier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
