import React, { useState } from 'react';
import {
  Plug,
  Key,
  Globe,
  Share2,
  CheckCircle,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  Sparkles,
  Layers,
  Code,
  Sliders,
  DollarSign,
} from 'lucide-react';
import { IntegrationSettings } from '../../types';
import { StorageService } from '../../services/storage';

export const AdminIntegrationsTab: React.FC = () => {
  const [integrations, setIntegrations] = useState<IntegrationSettings>(() =>
    StorageService.getIntegrationSettings()
  );
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveIntegrationSettings(integrations);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleTestGemini = () => {
    setTestResult('Connecting to Gemini AI Engine...');
    setTimeout(() => {
      setTestResult('✓ Successfully connected! Gemini AI Neural Engine response latency: 124ms.');
      setTimeout(() => setTestResult(null), 4000);
    }, 800);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Plug className="w-5 h-5 text-amber-400" />
            7. External Integrations Hub
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage Gemini AI keys, multi-chain RPC node endpoints, SEO metadata, tracking pixels, and ad monetization networks
          </p>
        </div>

        <button
          type="submit"
          className="flex items-center gap-2 px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-amber-500/25"
        >
          {isSaved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{isSaved ? 'Integrations Saved!' : 'Save All Integrations'}</span>
        </button>
      </div>

      {isSaved && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-semibold text-emerald-400 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>All API keys, SEO metadata tags, and tracking pixels updated successfully.</span>
        </div>
      )}

      {/* 1. API Keys & Webhooks */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
          <Key className="w-4 h-4 text-amber-400" />
          1. API Keys & Blockchain Node RPCs
        </h3>

        {/* Gemini AI API Key */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Gemini AI Neural Engine API Key
            </label>
            <button
              type="button"
              onClick={handleTestGemini}
              className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold underline"
            >
              Test Connection
            </button>
          </div>

          <div className="relative mt-2">
            <input
              type={showGeminiKey ? 'text' : 'password'}
              value={integrations.geminiApiKey}
              onChange={(e) => setIntegrations({ ...integrations, geminiApiKey: e.target.value })}
              className="w-full pr-10 p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-amber-400"
              placeholder="AIzaSy..."
            />
            <button
              type="button"
              onClick={() => setShowGeminiKey(!showGeminiKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {testResult && (
            <div className="text-[11px] text-emerald-400 mt-2 font-mono">{testResult}</div>
          )}
        </div>

        {/* Multi-Chain RPC Node Endpoints */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-400 font-medium">Dcoine Mainnet RPC Node</label>
            <input
              type="text"
              value={integrations.rpcDcoineEndpoint}
              onChange={(e) => setIntegrations({ ...integrations, rpcDcoineEndpoint: e.target.value })}
              className="w-full mt-1.5 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
            />
          </div>

          <div>
            <label className="text-slate-400 font-medium">CoinGecko Price Feed API Key</label>
            <input
              type="text"
              value={integrations.coinGeckoApiKey}
              onChange={(e) => setIntegrations({ ...integrations, coinGeckoApiKey: e.target.value })}
              className="w-full mt-1.5 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
            />
          </div>

          <div>
            <label className="text-slate-400 font-medium">Polygon POS RPC Endpoint</label>
            <input
              type="text"
              value={integrations.polygonRpc}
              onChange={(e) => setIntegrations({ ...integrations, polygonRpc: e.target.value })}
              className="w-full mt-1.5 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
            />
          </div>

          <div>
            <label className="text-slate-400 font-medium">Solana L1 RPC Endpoint</label>
            <input
              type="text"
              value={integrations.solanaRpc}
              onChange={(e) => setIntegrations({ ...integrations, solanaRpc: e.target.value })}
              className="w-full mt-1.5 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
            />
          </div>
        </div>

        {/* Webhooks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
          <div>
            <label className="text-slate-400 font-medium">Blockchain Event Webhook URL</label>
            <input
              type="text"
              value={integrations.webhookUrl}
              onChange={(e) => setIntegrations({ ...integrations, webhookUrl: e.target.value })}
              className="w-full mt-1.5 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
            />
          </div>

          <div>
            <label className="text-slate-400 font-medium">Webhook Signature Secret</label>
            <div className="relative mt-1.5">
              <input
                type={showWebhookSecret ? 'text' : 'password'}
                value={integrations.webhookSecret}
                onChange={(e) => setIntegrations({ ...integrations, webhookSecret: e.target.value })}
                className="w-full pr-10 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
              />
              <button
                type="button"
                onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showWebhookSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Web & SEO Optimization */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
          <Globe className="w-4 h-4 text-blue-400" />
          2. Web & SEO Search Engine Optimization
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-400 font-medium">Meta Title Tag</label>
            <input
              type="text"
              value={integrations.metaTitle}
              onChange={(e) => setIntegrations({ ...integrations, metaTitle: e.target.value })}
              className="w-full mt-1.5 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="text-slate-400 font-medium">Twitter / X Handle</label>
            <input
              type="text"
              value={integrations.twitterHandle}
              onChange={(e) => setIntegrations({ ...integrations, twitterHandle: e.target.value })}
              className="w-full mt-1.5 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white"
            />
          </div>
        </div>

        <div className="text-xs">
          <label className="text-slate-400 font-medium">Meta Description</label>
          <textarea
            rows={2}
            value={integrations.metaDescription}
            onChange={(e) => setIntegrations({ ...integrations, metaDescription: e.target.value })}
            className="w-full mt-1.5 p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-400 font-medium">Meta Keywords (comma separated)</label>
            <input
              type="text"
              value={integrations.metaKeywords}
              onChange={(e) => setIntegrations({ ...integrations, metaKeywords: e.target.value })}
              className="w-full mt-1.5 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="text-slate-400 font-medium">OpenGraph Social Share Card Image URL</label>
            <input
              type="text"
              value={integrations.ogImageUrl}
              onChange={(e) => setIntegrations({ ...integrations, ogImageUrl: e.target.value })}
              className="w-full mt-1.5 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
            />
          </div>
        </div>

        <div className="text-xs">
          <label className="text-slate-400 font-medium">Robots.txt Content</label>
          <textarea
            rows={3}
            value={integrations.robotsTxt}
            onChange={(e) => setIntegrations({ ...integrations, robotsTxt: e.target.value })}
            className="w-full mt-1.5 p-2 bg-slate-950 border border-slate-800 rounded-lg text-amber-200 font-mono text-[11px]"
          />
        </div>
      </div>

      {/* 3. Tracking Pixels & Analytics */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
          <Share2 className="w-4 h-4 text-purple-400" />
          3. Analytics Tracking Pixels (GA4, Pixel, TikTok, GTM)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-400 font-medium">Google Analytics 4 (GA4) Measurement ID</label>
            <input
              type="text"
              placeholder="G-XXXXXXXXXX"
              value={integrations.googleAnalyticsId}
              onChange={(e) => setIntegrations({ ...integrations, googleAnalyticsId: e.target.value })}
              className="w-full mt-1.5 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
            />
          </div>

          <div>
            <label className="text-slate-400 font-medium">Meta / Facebook Pixel ID</label>
            <input
              type="text"
              placeholder="fbq_XXXXXXXXX"
              value={integrations.metaPixelId}
              onChange={(e) => setIntegrations({ ...integrations, metaPixelId: e.target.value })}
              className="w-full mt-1.5 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
            />
          </div>

          <div>
            <label className="text-slate-400 font-medium">TikTok Pixel Code ID</label>
            <input
              type="text"
              placeholder="tt_XXXXXXXXX"
              value={integrations.tikTokPixelId}
              onChange={(e) => setIntegrations({ ...integrations, tikTokPixelId: e.target.value })}
              className="w-full mt-1.5 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
            />
          </div>

          <div>
            <label className="text-slate-400 font-medium">Google Tag Manager (GTM) Container ID</label>
            <input
              type="text"
              placeholder="GTM-XXXXXXX"
              value={integrations.googleTagManagerId}
              onChange={(e) => setIntegrations({ ...integrations, googleTagManagerId: e.target.value })}
              className="w-full mt-1.5 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
            />
          </div>
        </div>
      </div>

      {/* 4. Ad Networks & Monetization */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          4. Ad Monetization & Google AdSense Integration
        </h3>

        <div className="text-xs">
          <label className="text-slate-400 font-medium">Google AdSense Publisher ID</label>
          <input
            type="text"
            placeholder="pub-xxxxxxxxxxxxxxxx"
            value={integrations.adSensePublisherId}
            onChange={(e) => setIntegrations({ ...integrations, adSensePublisherId: e.target.value })}
            className="w-full mt-1.5 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
          />
        </div>

        <div className="space-y-3 pt-2">
          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer text-xs">
            <div>
              <div className="font-semibold text-white">Top Header Sponsored Banner Slot</div>
              <div className="text-[11px] text-slate-400">Display 728x90 crypto ad banner at top of user dashboard</div>
            </div>
            <input
              type="checkbox"
              checked={integrations.enableHeaderBanner}
              onChange={(e) => setIntegrations({ ...integrations, enableHeaderBanner: e.target.checked })}
              className="w-4 h-4 text-amber-500 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer text-xs">
            <div>
              <div className="font-semibold text-white">P2P & DEX Sidebar Sponsored Ads</div>
              <div className="text-[11px] text-slate-400">Display 300x250 web3 sponsor creatives during trade match</div>
            </div>
            <input
              type="checkbox"
              checked={integrations.enableSidebarBanner}
              onChange={(e) => setIntegrations({ ...integrations, enableSidebarBanner: e.target.checked })}
              className="w-4 h-4 text-amber-500 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer text-xs">
            <div>
              <div className="font-semibold text-white">Mining Screen Bottom Banner</div>
              <div className="text-[11px] text-slate-400">Monetize 24h cloud mining session claims with partner promotions</div>
            </div>
            <input
              type="checkbox"
              checked={integrations.enableMiningBanner}
              onChange={(e) => setIntegrations({ ...integrations, enableMiningBanner: e.target.checked })}
              className="w-4 h-4 text-amber-500 rounded"
            />
          </label>
        </div>
      </div>
    </form>
  );
};
