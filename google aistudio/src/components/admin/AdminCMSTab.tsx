import React, { useState } from 'react';
import {
  FileText,
  Megaphone,
  Newspaper,
  LayoutTemplate,
  HelpCircle,
  Plus,
  Edit2,
  Trash2,
  Save,
  CheckCircle,
  Eye,
  Sliders,
  ExternalLink,
  Sparkles,
  Search,
  Check,
  X,
  Clock,
  ThumbsUp,
  Tag,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import {
  AnnouncementItem,
  AnnouncementSettings,
  CMSHeroContent,
  FAQItem,
  NewsArticle,
} from '../../types';
import { AdminCMSPagesView } from './AdminCMSPagesView';

export const AdminCMSTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'pages' | 'announcements' | 'news' | 'hero' | 'faqs'>('pages');

  // Announcements State
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(() => StorageService.getAnnouncements());
  const [announcementSettings, setAnnouncementSettings] = useState<AnnouncementSettings>(() => StorageService.getAnnouncementSettings());
  const [editingAnnouncement, setEditingAnnouncement] = useState<AnnouncementItem | null>(null);
  const [isAnnModalOpen, setIsAnnModalOpen] = useState(false);

  // News State
  const [news, setNews] = useState<NewsArticle[]>(() => StorageService.getNews());
  const [newsSearch, setNewsSearch] = useState('');
  const [newsCategoryFilter, setNewsCategoryFilter] = useState('All');
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);

  // Hero & Banners State
  const [heroContent, setHeroContent] = useState<CMSHeroContent>(() => StorageService.getHeroContent());
  const [isHeroSaved, setIsHeroSaved] = useState(false);

  // Pages & Legal State
  const [adminSettings, setAdminSettings] = useState(() => StorageService.getAdminSettings());
  const [editingPageId, setEditingPageId] = useState<string>('terms');
  const [pageTitle, setPageTitle] = useState('');
  const [pageContent, setPageContent] = useState('');
  const [pagePublished, setPagePublished] = useState(true);
  const [isPageSaved, setIsPageSaved] = useState(false);

  // FAQs State
  const [faqs, setFaqs] = useState<FAQItem[]>(() => StorageService.getFAQs());
  const [faqCategoryFilter, setFaqCategoryFilter] = useState('all');
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);

  // Success Notification
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // -------------------------------------------------------------
  // ANNOUNCEMENTS HANDLERS
  // -------------------------------------------------------------
  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnnouncement) return;

    if (editingAnnouncement.id) {
      const updated = announcements.map((a) => (a.id === editingAnnouncement.id ? editingAnnouncement : a));
      StorageService.saveAnnouncements(updated);
      setAnnouncements(updated);
      showToast('Announcement updated successfully!');
    } else {
      const newAnn: AnnouncementItem = {
        ...editingAnnouncement,
        id: `ann-${Date.now()}`,
        createdAt: Date.now(),
      };
      const updated = [newAnn, ...announcements];
      StorageService.saveAnnouncements(updated);
      setAnnouncements(updated);
      showToast('New announcement published to live ticker!');
    }
    setIsAnnModalOpen(false);
    setEditingAnnouncement(null);
  };

  const handleDeleteAnnouncement = (id: string) => {
    if (confirm('Delete this announcement from the live ticker bar?')) {
      const updated = announcements.filter((a) => a.id !== id);
      StorageService.saveAnnouncements(updated);
      setAnnouncements(updated);
      showToast('Announcement removed.');
    }
  };

  const handleToggleAnnouncementActive = (id: string) => {
    const updated = announcements.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a));
    StorageService.saveAnnouncements(updated);
    setAnnouncements(updated);
    showToast('Announcement visibility toggled.');
  };

  const handleSaveTickerSettings = (newSettings: AnnouncementSettings) => {
    setAnnouncementSettings(newSettings);
    StorageService.saveAnnouncementSettings(newSettings);
    showToast('Ticker settings updated live.');
  };

  // -------------------------------------------------------------
  // NEWS ARTICLES HANDLERS
  // -------------------------------------------------------------
  const handleSaveArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;

    if (editingArticle.id) {
      StorageService.updateNewsArticle(editingArticle);
      setNews(StorageService.getNews());
      showToast('News article updated.');
    } else {
      StorageService.addNewsArticle({
        ...editingArticle,
        publishedAt: 'Just now',
        likes: 0,
        comments: [],
      });
      setNews(StorageService.getNews());
      showToast('New article published to Crypto News feed.');
    }
    setIsArticleModalOpen(false);
    setEditingArticle(null);
  };

  const handleDeleteArticle = (id: string) => {
    if (confirm('Permanently delete this news article?')) {
      StorageService.deleteNewsArticle(id);
      setNews(StorageService.getNews());
      showToast('Article deleted.');
    }
  };

  // -------------------------------------------------------------
  // HERO & PROMO HANDLERS
  // -------------------------------------------------------------
  const handleSaveHero = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveHeroContent(heroContent);
    setIsHeroSaved(true);
    showToast('Landing hero & promo banner updated across the app!');
    setTimeout(() => setIsHeroSaved(false), 3000);
  };

  // -------------------------------------------------------------
  // LEGAL & PAGES HANDLERS
  // -------------------------------------------------------------
  React.useEffect(() => {
    const page = adminSettings.pages?.find((p) => p.id === editingPageId || p.slug === editingPageId);
    if (page) {
      setPageTitle(page.title);
      setPageContent(page.content);
      setPagePublished(page.isPublished);
    }
  }, [editingPageId, adminSettings]);

  const handleSavePage = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.updatePage(editingPageId, pageTitle, pageContent, pagePublished);
    setAdminSettings(StorageService.getAdminSettings());
    setIsPageSaved(true);
    showToast(`Page '${pageTitle}' published and saved.`);
    setTimeout(() => setIsPageSaved(false), 2500);
  };

  // -------------------------------------------------------------
  // FAQ HANDLERS
  // -------------------------------------------------------------
  const handleSaveFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaq) return;

    if (editingFaq.id) {
      StorageService.updateFAQ(editingFaq);
      setFaqs(StorageService.getFAQs());
      showToast('FAQ entry updated.');
    } else {
      StorageService.addFAQ({
        question: editingFaq.question,
        answer: editingFaq.answer,
        category: editingFaq.category,
        order: editingFaq.order || faqs.length + 1,
        isPublished: editingFaq.isPublished !== undefined ? editingFaq.isPublished : true,
      });
      setFaqs(StorageService.getFAQs());
      showToast('New FAQ question added.');
    }
    setIsFaqModalOpen(false);
    setEditingFaq(null);
  };

  const handleDeleteFaq = (id: string) => {
    if (confirm('Delete this FAQ entry?')) {
      StorageService.deleteFAQ(id);
      setFaqs(StorageService.getFAQs());
      showToast('FAQ deleted.');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Notification */}
      {statusMessage && (
        <div className="fixed top-16 right-5 z-50 p-3.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            Content Management System (CMS)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage live header tickers, news articles, homepage hero branding, legal policies, and knowledge base FAQs
          </p>
        </div>

        {/* CMS Sub-Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveSubTab('pages')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeSubTab === 'pages'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Pages (Builder & SEO)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('announcements')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeSubTab === 'announcements'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Ticker & Announcements</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/20">{announcements.length}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('news')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeSubTab === 'news'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>News & Blog Feed</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/20">{news.length}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('hero')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeSubTab === 'hero'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <LayoutTemplate className="w-3.5 h-3.5" />
            <span>Hero & Promo Banners</span>
          </button>

          <button
            onClick={() => setActiveSubTab('faqs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeSubTab === 'faqs'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>FAQs & Help Desk</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/20">{faqs.length}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. TICKER & ANNOUNCEMENTS SUB-TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'announcements' && (
        <div className="space-y-6">
          {/* Controls & Master Switch */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs font-bold text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={announcementSettings.isPublished}
                  onChange={(e) =>
                    handleSaveTickerSettings({ ...announcementSettings, isPublished: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-amber-500 bg-slate-950 border-slate-700"
                />
                <span>Publish Live Ticker Banner</span>
              </label>

              <div className="h-4 w-px bg-slate-800" />

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Speed:</span>
                <input
                  type="range"
                  min="30"
                  max="120"
                  step="5"
                  value={announcementSettings.speedSeconds || 55}
                  onChange={(e) =>
                    handleSaveTickerSettings({
                      ...announcementSettings,
                      speedSeconds: Number(e.target.value),
                    })
                  }
                  className="w-24 accent-amber-500"
                />
                <span className="text-white font-mono text-[11px]">{announcementSettings.speedSeconds || 55}s</span>
              </div>
            </div>

            <button
              onClick={() => {
                setEditingAnnouncement({
                  id: '',
                  text: '',
                  linkText: 'Learn More',
                  linkUrl: 'mining',
                  type: 'info',
                  isActive: true,
                  priority: announcements.length + 1,
                  createdAt: Date.now(),
                });
                setIsAnnModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Announcement</span>
            </button>
          </div>

          {/* Announcements Table */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-bold">
                  <tr>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Message / Banner Copy</th>
                    <th className="py-3 px-4">Target CTA</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {announcements.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono font-bold text-amber-400">#{item.priority}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            item.type === 'urgent'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : item.type === 'reward'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : item.type === 'event'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}
                        >
                          {item.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-200 max-w-md font-medium">{item.text}</td>
                      <td className="py-3 px-4 text-slate-400">
                        {item.linkText && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                            {item.linkText} <span className="text-[10px] text-slate-500 font-mono">({item.linkUrl})</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleAnnouncementActive(item.id)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition ${
                            item.isActive
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {item.isActive ? 'Active' : 'Draft'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingAnnouncement(item);
                              setIsAnnModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteAnnouncement(item.id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. NEWS & BLOG ARTICLES SUB-TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'news' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search articles by title, excerpt or author..."
                  value={newsSearch}
                  onChange={(e) => setNewsSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <button
              onClick={() => {
                setEditingArticle({
                  id: '',
                  title: '',
                  excerpt: '',
                  content: '',
                  source: 'Dcoine Research Desk',
                  sourceUrl: 'https://dcoine.network/insights',
                  imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=600&q=80',
                  category: 'Dcoine',
                  publishedAt: 'Today',
                  readTime: '3 min read',
                  likes: 12,
                  comments: [],
                });
                setIsArticleModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Write News Article</span>
            </button>
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {news
              .filter(
                (a) =>
                  !newsSearch ||
                  a.title.toLowerCase().includes(newsSearch.toLowerCase()) ||
                  a.excerpt.toLowerCase().includes(newsSearch.toLowerCase())
              )
              .map((article) => (
                <div
                  key={article.id}
                  className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl flex flex-col justify-between group hover:border-amber-500/30 transition"
                >
                  <div>
                    <div className="relative h-40 w-full overflow-hidden bg-slate-950">
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-amber-300 border border-amber-500/30">
                        {article.category}
                      </span>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>{article.source}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {article.readTime}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-white line-clamp-2 group-hover:text-amber-300 transition">
                        {article.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2">{article.excerpt}</p>
                    </div>
                  </div>

                  <div className="p-4 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3 text-amber-400" />
                      {article.likes} Likes
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setEditingArticle(article);
                          setIsArticleModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                        title="Edit Article"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteArticle(article.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                        title="Delete Article"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. HERO & PROMO BANNERS SUB-TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'hero' && (
        <form onSubmit={handleSaveHero} className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Homepage & Landing Hero Customizer</h3>
              <p className="text-xs text-slate-400">Customize the high-converting copy and promotion badges for visitors</p>
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-amber-500/20"
            >
              {isHeroSaved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{isHeroSaved ? 'Hero Saved!' : 'Save Hero Copy'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form Fields */}
            <div className="space-y-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
              <div>
                <label className="text-xs font-semibold text-slate-300">Badge Tagline</label>
                <input
                  type="text"
                  value={heroContent.badgeText}
                  onChange={(e) => setHeroContent({ ...heroContent, badgeText: e.target.value })}
                  className="w-full mt-1.5 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Main Headline</label>
                <input
                  type="text"
                  value={heroContent.headline}
                  onChange={(e) => setHeroContent({ ...heroContent, headline: e.target.value })}
                  className="w-full mt-1.5 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Gradient Highlighted Word</label>
                <input
                  type="text"
                  value={heroContent.highlightWord}
                  onChange={(e) => setHeroContent({ ...heroContent, highlightWord: e.target.value })}
                  className="w-full mt-1.5 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-amber-400 font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Subheadline Description</label>
                <textarea
                  rows={3}
                  value={heroContent.subheadline}
                  onChange={(e) => setHeroContent({ ...heroContent, subheadline: e.target.value })}
                  className="w-full mt-1.5 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Primary CTA Button</label>
                  <input
                    type="text"
                    value={heroContent.primaryCtaText}
                    onChange={(e) => setHeroContent({ ...heroContent, primaryCtaText: e.target.value })}
                    className="w-full mt-1.5 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Secondary CTA Button</label>
                  <input
                    type="text"
                    value={heroContent.secondaryCtaText}
                    onChange={(e) => setHeroContent({ ...heroContent, secondaryCtaText: e.target.value })}
                    className="w-full mt-1.5 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>
              </div>

              {/* Promo Banner Settings */}
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-white">Top Promotional Banner Active</label>
                  <input
                    type="checkbox"
                    checked={heroContent.isBannerActive}
                    onChange={(e) => setHeroContent({ ...heroContent, isBannerActive: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 bg-slate-950 border-slate-700"
                  />
                </div>
                <input
                  type="text"
                  value={heroContent.promoBannerText}
                  onChange={(e) => setHeroContent({ ...heroContent, promoBannerText: e.target.value })}
                  placeholder="e.g. 50% discount on DEX Swap fees this weekend..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-amber-300"
                />
              </div>
            </div>

            {/* Live Interactive Preview */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  Live Preview on Guest Homepage
                </div>

                {heroContent.isBannerActive && (
                  <div className="mb-4 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span className="truncate">{heroContent.promoBannerText}</span>
                  </div>
                )}

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-bold text-amber-400 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {heroContent.badgeText}
                </div>

                <h1 className="text-2xl font-black text-white leading-tight mb-2">
                  {heroContent.headline}{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200">
                    {heroContent.highlightWord}
                  </span>
                </h1>

                <p className="text-xs text-slate-400 leading-relaxed mb-6">{heroContent.subheadline}</p>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20"
                  >
                    {heroContent.primaryCtaText}
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-semibold text-xs"
                  >
                    {heroContent.secondaryCtaText}
                  </button>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-4 gap-2 pt-6 mt-6 border-t border-slate-800 text-center">
                {heroContent.stats.map((s, idx) => (
                  <div key={idx} className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
                    <div className="text-xs font-bold text-amber-400">{s.value}</div>
                    <div className="text-[10px] text-slate-500">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* 4. PAGES (ADD/EDIT/DELETE WITH BLOCKS & SEO) SUB-TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'pages' && <AdminCMSPagesView />}

      {/* ========================================================================= */}
      {/* 5. FAQS & HELP DESK SUB-TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'faqs' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Category:</span>
              <select
                value={faqCategoryFilter}
                onChange={(e) => setFaqCategoryFilter(e.target.value)}
                className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
              >
                <option value="all">All Categories</option>
                <option value="mining">Mining Pool</option>
                <option value="p2p">P2P Trading</option>
                <option value="security">Security & Non-Custodial</option>
                <option value="wallet">Wallet & DEX Swap</option>
              </select>
            </div>

            <button
              onClick={() => {
                setEditingFaq({
                  id: '',
                  question: '',
                  answer: '',
                  category: 'general',
                  order: faqs.length + 1,
                  isPublished: true,
                  updatedAt: Date.now(),
                });
                setIsFaqModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add FAQ Question</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faqs
              .filter((f) => faqCategoryFilter === 'all' || f.category === faqCategoryFilter)
              .map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col justify-between group hover:border-amber-500/30 transition"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        {item.category}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">Order #{item.order}</span>
                    </div>

                    <h4 className="font-bold text-sm text-white group-hover:text-amber-300 transition">
                      {item.question}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.answer}</p>
                  </div>

                  <div className="pt-3 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <span
                      className={`text-[10px] font-semibold ${
                        item.isPublished ? 'text-emerald-400' : 'text-slate-500'
                      }`}
                    >
                      {item.isPublished ? 'Live on Help Desk' : 'Draft / Hidden'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setEditingFaq(item);
                          setIsFaqModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                        title="Edit FAQ"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteFaq(item.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                        title="Delete FAQ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT ANNOUNCEMENT */}
      {/* ========================================================================= */}
      {isAnnModalOpen && editingAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleSaveAnnouncement}
            className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-amber-400" />
                {editingAnnouncement.id ? 'Edit Announcement' : 'New Ticker Announcement'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAnnModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-semibold">Message Text</label>
              <textarea
                required
                rows={3}
                value={editingAnnouncement.text}
                onChange={(e) =>
                  setEditingAnnouncement({ ...editingAnnouncement, text: e.target.value })
                }
                placeholder="e.g. 🚀 Cloud Mining 2.0 boosted by 15% this weekend..."
                className="w-full mt-1.5 p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-300 font-semibold">Target Link Label</label>
                <input
                  type="text"
                  value={editingAnnouncement.linkText || ''}
                  onChange={(e) =>
                    setEditingAnnouncement({ ...editingAnnouncement, linkText: e.target.value })
                  }
                  placeholder="e.g. Start Mining"
                  className="w-full mt-1.5 p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold">Target App Tab</label>
                <select
                  value={editingAnnouncement.linkUrl || 'mining'}
                  onChange={(e) =>
                    setEditingAnnouncement({ ...editingAnnouncement, linkUrl: e.target.value })
                  }
                  className="w-full mt-1.5 p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                >
                  <option value="mining">Mining Pool</option>
                  <option value="p2p">P2P Trading</option>
                  <option value="swap">DEX Swap</option>
                  <option value="wallet">Wallet</option>
                  <option value="news">Crypto News</option>
                  <option value="explorer">Explorer</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-300 font-semibold">Type / Urgency</label>
                <select
                  value={editingAnnouncement.type}
                  onChange={(e) =>
                    setEditingAnnouncement({
                      ...editingAnnouncement,
                      type: e.target.value as any,
                    })
                  }
                  className="w-full mt-1.5 p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                >
                  <option value="reward">Reward / Bonus</option>
                  <option value="urgent">Urgent / Alert</option>
                  <option value="event">Event / Feature</option>
                  <option value="info">Info / Notice</option>
                  <option value="update">Protocol Update</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold">Display Priority (1-10)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={editingAnnouncement.priority}
                  onChange={(e) =>
                    setEditingAnnouncement({
                      ...editingAnnouncement,
                      priority: Number(e.target.value),
                    })
                  }
                  className="w-full mt-1.5 p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAnnModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-md"
              >
                Save Announcement
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT NEWS ARTICLE */}
      {/* ========================================================================= */}
      {isArticleModalOpen && editingArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleSaveArticle}
            className="w-full max-w-xl bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-amber-400" />
                {editingArticle.id ? 'Edit News Article' : 'Write News Article'}
              </h3>
              <button
                type="button"
                onClick={() => setIsArticleModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-semibold">Article Headline</label>
              <input
                required
                type="text"
                value={editingArticle.title}
                onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                placeholder="e.g. Bitcoin Crosses New High as Network Hashrate Climbs"
                className="w-full mt-1.5 p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-300 font-semibold">Category</label>
                <select
                  value={editingArticle.category}
                  onChange={(e) => setEditingArticle({ ...editingArticle, category: e.target.value })}
                  className="w-full mt-1.5 p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                >
                  <option value="Dcoine">Dcoine</option>
                  <option value="Bitcoin">Bitcoin</option>
                  <option value="Ethereum">Ethereum</option>
                  <option value="DeFi">DeFi</option>
                  <option value="Markets">Markets</option>
                  <option value="Regulation">Regulation</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold">Read Time</label>
                <input
                  type="text"
                  value={editingArticle.readTime}
                  onChange={(e) => setEditingArticle({ ...editingArticle, readTime: e.target.value })}
                  placeholder="e.g. 4 min read"
                  className="w-full mt-1.5 p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-300 font-semibold">Source / Author</label>
                <input
                  type="text"
                  value={editingArticle.source}
                  onChange={(e) => setEditingArticle({ ...editingArticle, source: e.target.value })}
                  className="w-full mt-1.5 p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold">Cover Image URL</label>
                <input
                  type="url"
                  value={editingArticle.imageUrl}
                  onChange={(e) => setEditingArticle({ ...editingArticle, imageUrl: e.target.value })}
                  className="w-full mt-1.5 p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-semibold">Short Excerpt</label>
              <textarea
                required
                rows={2}
                value={editingArticle.excerpt}
                onChange={(e) => setEditingArticle({ ...editingArticle, excerpt: e.target.value })}
                placeholder="Brief 1-2 sentence preview for search and cards..."
                className="w-full mt-1.5 p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-semibold">Full Article Body</label>
              <textarea
                required
                rows={6}
                value={editingArticle.content}
                onChange={(e) => setEditingArticle({ ...editingArticle, content: e.target.value })}
                placeholder="Write the comprehensive article content..."
                className="w-full mt-1.5 p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white leading-relaxed"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsArticleModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-md"
              >
                Save & Publish
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT FAQ */}
      {/* ========================================================================= */}
      {isFaqModalOpen && editingFaq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleSaveFaq}
            className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                {editingFaq.id ? 'Edit FAQ Question' : 'Add New FAQ Question'}
              </h3>
              <button
                type="button"
                onClick={() => setIsFaqModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-semibold">Question</label>
              <input
                required
                type="text"
                value={editingFaq.question}
                onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                placeholder="e.g. How does 24h cloud mining work?"
                className="w-full mt-1.5 p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-300 font-semibold">Category</label>
                <select
                  value={editingFaq.category}
                  onChange={(e) =>
                    setEditingFaq({ ...editingFaq, category: e.target.value as any })
                  }
                  className="w-full mt-1.5 p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                >
                  <option value="mining">Mining Pool</option>
                  <option value="p2p">P2P Trading</option>
                  <option value="security">Security</option>
                  <option value="wallet">Wallet & Swap</option>
                  <option value="general">General</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold">Display Order</label>
                <input
                  type="number"
                  value={editingFaq.order}
                  onChange={(e) => setEditingFaq({ ...editingFaq, order: Number(e.target.value) })}
                  className="w-full mt-1.5 p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-semibold">Answer Explanation</label>
              <textarea
                required
                rows={5}
                value={editingFaq.answer}
                onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                placeholder="Detailed step-by-step answer for users..."
                className="w-full mt-1.5 p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white leading-relaxed"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsFaqModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-md"
              >
                Save FAQ
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
