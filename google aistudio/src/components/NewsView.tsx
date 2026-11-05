import React, { useState, useEffect } from 'react';
import {
  Newspaper,
  ExternalLink,
  MessageSquare,
  ThumbsUp,
  Clock,
  Sparkles,
  Search,
  Filter,
  Send,
  X,
  Share2,
  RefreshCw,
  Bookmark,
  BookmarkCheck,
  Check,
  Copy,
  ArrowUpRight,
  Radio,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { NewsArticle, NewsComment, UserProfile } from '../types';
import { StorageService } from '../services/storage';
import { NewsService } from '../services/newsService';

interface NewsViewProps {
  user: UserProfile;
}

export const NewsView: React.FC<NewsViewProps> = ({ user }) => {
  const [news, setNews] = useState<NewsArticle[]>(() => StorageService.getNews());
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [commentText, setCommentText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'quick'>('latest');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncedText, setLastSyncedText] = useState<string>(() => NewsService.getLastSyncedTime());
  const [savedIds, setSavedIds] = useState<string[]>(() => NewsService.getSavedArticleIds());
  const [shareToast, setShareToast] = useState<string | null>(null);

  // Live real-time news synchronization on component mount
  const loadFreshNews = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const fresh = await NewsService.fetchLiveNews();
      if (fresh && fresh.length > 0) {
        setNews(fresh);
        setLastSyncedText('Just now');
      }
    } catch (err) {
      console.warn('Failed to refresh news feed:', err);
    } finally {
      if (!silent) {
        setTimeout(() => setIsRefreshing(false), 500);
      }
    }
  };

  useEffect(() => {
    // Initial fetch on mount for true production live data
    loadFreshNews(true);

    // Auto-sync background updates every 4 minutes
    const interval = setInterval(() => {
      loadFreshNews(true);
    }, 4 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Categories list with dynamic calculation
  const categories = ['All', 'Dcoine', 'Bitcoin', 'Ethereum', 'DeFi', 'Markets', 'Regulation', 'Bookmarks'];

  // Filter & Sort
  const filteredNews = news
    .filter((art) => {
      if (categoryFilter === 'Bookmarks') {
        if (!savedIds.includes(art.id)) return false;
      } else if (categoryFilter !== 'All') {
        const artCat = (art.category || '').toLowerCase();
        const targetCat = categoryFilter.toLowerCase();
        if (!artCat.includes(targetCat)) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          art.title.toLowerCase().includes(q) ||
          art.excerpt.toLowerCase().includes(q) ||
          art.content.toLowerCase().includes(q) ||
          (art.source && art.source.toLowerCase().includes(q))
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'popular') return (b.likes || 0) - (a.likes || 0);
      if (sortBy === 'quick') {
        const aMin = parseInt(a.readTime || '3', 10) || 3;
        const bMin = parseInt(b.readTime || '3', 10) || 3;
        return aMin - bMin;
      }
      return 0; // Default order is newest first from API & storage
    });

  const handleLikeArticle = (id: string) => {
    const updated = news.map((art) => (art.id === id ? { ...art, likes: (art.likes || 0) + 1 } : art));
    setNews(updated);
    StorageService.saveNews(updated);
    if (selectedArticle && selectedArticle.id === id) {
      setSelectedArticle({ ...selectedArticle, likes: (selectedArticle.likes || 0) + 1 });
    }
  };

  const handleToggleBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const isNowSaved = NewsService.toggleSaveArticle(id);
    const updatedSaved = NewsService.getSavedArticleIds();
    setSavedIds(updatedSaved);

    setShareToast(isNowSaved ? 'Story saved to Bookmarks!' : 'Removed from Bookmarks');
    setTimeout(() => setShareToast(null), 2500);
  };

  const handleShareStory = (art: NewsArticle, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const shareUrl = art.sourceUrl || window.location.href;
    const shareTitle = `${art.title} - Dcoine News`;

    if (navigator.share) {
      navigator.share({
        title: shareTitle,
        text: art.excerpt,
        url: shareUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${shareTitle}\n${shareUrl}`);
      setShareToast('Link copied to clipboard!');
      setTimeout(() => setShareToast(null), 2500);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedArticle) return;

    const newComment: NewsComment = {
      id: `c-${Date.now()}`,
      userId: user.id,
      userName: user.username,
      userAvatar: user.avatarUrl,
      text: commentText.trim(),
      timestamp: Date.now(),
      likes: 0,
    };

    const updatedComments = [newComment, ...(selectedArticle.comments || [])];
    const updatedArticle = { ...selectedArticle, comments: updatedComments };

    const updatedNewsList = news.map((a) => (a.id === selectedArticle.id ? updatedArticle : a));
    setNews(updatedNewsList);
    StorageService.saveNews(updatedNewsList);
    setSelectedArticle(updatedArticle);
    setCommentText('');

    confetti({
      particleCount: 25,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  const handleLikeComment = (commentId: string) => {
    if (!selectedArticle) return;
    const updatedComments = (selectedArticle.comments || []).map((c) =>
      c.id === commentId ? { ...c, likes: (c.likes || 0) + 1 } : c
    );
    const updatedArticle = { ...selectedArticle, comments: updatedComments };
    const updatedNewsList = news.map((a) => (a.id === selectedArticle.id ? updatedArticle : a));
    setNews(updatedNewsList);
    StorageService.saveNews(updatedNewsList);
    setSelectedArticle(updatedArticle);
  };

  return (
    <div className="space-y-4 pb-24 max-w-5xl mx-auto px-2 sm:px-4">
      {/* Toast Notification */}
      {shareToast && (
        <div className="fixed top-20 right-4 z-50 px-4 py-2.5 rounded-2xl bg-amber-500 text-slate-950 font-bold text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
          <span>{shareToast}</span>
        </div>
      )}

      {/* Top Banner (CSS selector 1 target inside: div > div > div > div > span:nth-of-type(1)) */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Newspaper className="w-6 h-6 text-amber-400" />
              <span>Crypto Intelligence &amp; News</span>
            </h1>

            {/* CSS Selector 1 Target: Perfectly aligned, spaced live badge button with pulsing indicator */}
            <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-amber-500/15 text-amber-300 border border-amber-500/35 shadow-sm leading-none whitespace-nowrap">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="leading-none pt-0.5 font-extrabold tracking-wide">Live Feed</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Real-time decentralized market news aggregated live from CoinTelegraph, CoinDesk &amp; Dcoine Protocol.
          </p>
        </div>

        {/* Action Controls: Search, Sort & Refresh Feed */}
        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap sm:flex-nowrap">
          {/* Search Input */}
          <div className="relative flex-1 md:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search news, coins..."
              className="w-full pl-8 pr-3 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="latest">Latest</option>
            <option value="popular">Most Liked</option>
            <option value="quick">Quick Read</option>
          </select>

          {/* Live Refresh Button */}
          <button
            type="button"
            onClick={() => loadFreshNews(false)}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-amber-400 hover:text-amber-300 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60 whitespace-nowrap shadow-sm"
            title="Fetch latest crypto news"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-300' : ''}`} />
            <span className="hidden sm:inline">{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills with Item Count Badges */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => {
          const isActive = categoryFilter === cat;
          let count = 0;
          if (cat === 'All') count = news.length;
          else if (cat === 'Bookmarks') count = savedIds.length;
          else count = news.filter((a) => (a.category || '').toLowerCase().includes(cat.toLowerCase())).length;

          return (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
              }`}
            >
              <span>{cat}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? 'bg-slate-950 text-amber-400' : 'bg-slate-950 text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Pinned Protocol Highlight Banner */}
      {categoryFilter === 'All' && !searchQuery && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500/15 via-slate-900 to-amber-500/10 border border-amber-500/30 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-xs sm:text-sm">Dcoine Layer-1 Protocol News</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  OFFICIAL
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Proof-of-Engagement 24-Hour Mining &amp; Non-Custodial Smart Escrow DEX are running live across all testnets and mainnet nodes.
              </p>
            </div>
          </div>
          <button
            onClick={() => setCategoryFilter('Dcoine')}
            className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition whitespace-nowrap self-stretch sm:self-auto text-center"
          >
            View Protocol News →
          </button>
        </div>
      )}

      {/* News Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNews.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <p className="text-sm text-slate-400">
              {categoryFilter === 'Bookmarks'
                ? 'No saved stories yet. Bookmark articles by clicking the bookmark icon on any card!'
                : 'No articles found matching your criteria.'}
            </p>
            <button
              onClick={() => {
                setCategoryFilter('All');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredNews.map((article) => {
            const isSaved = savedIds.includes(article.id);
            return (
              <div
                key={article.id}
                onClick={() => setSelectedArticle(article)}
                className="group rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg hover:border-amber-500/50 transition duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Cover Image with Fallback */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=1200&q=80';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      loading="lazy"
                    />

                    {/* Category Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-slate-950/85 backdrop-blur-md text-[10px] font-bold text-amber-400 border border-amber-500/30">
                        {article.category || 'Crypto'}
                      </span>
                    </div>

                    {/* Bookmark and Share Fast Actions */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => handleToggleBookmark(article.id, e)}
                        className={`p-1.5 rounded-full backdrop-blur-md transition ${
                          isSaved
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-950/80 text-slate-300 hover:text-white'
                        }`}
                        title={isSaved ? 'Remove bookmark' : 'Bookmark story'}
                      >
                        {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleShareStory(article, e)}
                        className="p-1.5 rounded-full bg-slate-950/80 text-slate-300 hover:text-white backdrop-blur-md transition"
                        title="Share story"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Read Time */}
                    <div className="absolute bottom-2 right-3 text-[10px] text-white/90 bg-black/70 px-2 py-0.5 rounded-md backdrop-blur-sm flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{article.readTime || '3 min read'}</span>
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="p-4 sm:p-5 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-semibold text-amber-400/90">{article.source || 'Decentralized Feed'}</span>
                      <span>{article.publishedAt}</span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition line-clamp-2 leading-snug">
                      {article.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {article.excerpt}
                    </p>
                  </div>
                </div>

                {/* Bottom Meta Bar */}
                <div className="px-4 sm:px-5 py-3 bg-slate-950/70 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLikeArticle(article.id);
                      }}
                      className="flex items-center gap-1.5 text-slate-400 hover:text-amber-400 transition"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{article.likes || 0}</span>
                    </button>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{article.comments?.length || 0}</span>
                    </div>
                  </div>

                  <span className="text-[11px] text-amber-400 font-semibold group-hover:underline flex items-center gap-1">
                    <span>Read Full Story</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ARTICLE READER & COMMENT MODAL */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  {selectedArticle.category || 'Crypto'}
                </span>
                <span className="text-xs text-slate-400">• Source: {selectedArticle.source}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleBookmark(selectedArticle.id)}
                  className={`p-1.5 rounded-xl border transition ${
                    savedIds.includes(selectedArticle.id)
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
                  }`}
                  title="Bookmark"
                >
                  <Bookmark className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleShareStory(selectedArticle)}
                  className="p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition"
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedArticle(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              <img
                src={selectedArticle.imageUrl}
                alt={selectedArticle.title}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=1200&q=80';
                }}
                className="w-full h-56 sm:h-64 object-cover rounded-2xl border border-slate-800 shadow-lg"
              />

              <h2 className="text-lg sm:text-2xl font-extrabold text-white leading-tight">
                {selectedArticle.title}
              </h2>

              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span>Published {selectedArticle.publishedAt}</span>
                  <span>•</span>
                  <span>{selectedArticle.readTime || '3 min read'}</span>
                </div>

                {selectedArticle.sourceUrl && (
                  <a
                    href={selectedArticle.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-amber-400 hover:underline font-semibold"
                  >
                    <span>View on {selectedArticle.source || 'Original Source'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {/* Full Article Text */}
              <div className="text-sm text-slate-300 leading-relaxed space-y-3 font-normal">
                <p className="font-semibold text-slate-100 text-sm sm:text-base">{selectedArticle.excerpt}</p>
                <p>{selectedArticle.content}</p>
                <p>
                  As decentralized protocols and layer-1 infrastructures evolve, transparent non-custodial tools empower retail traders and global miners. Community participants are encouraged to stay informed and verify smart contracts on-chain.
                </p>
              </div>

              {/* Social Like Bar */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleLikeArticle(selectedArticle.id)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500 text-xs font-semibold text-amber-400 transition"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>Like ({selectedArticle.likes || 0})</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleShareStory(selectedArticle)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 transition"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Story</span>
                </button>
              </div>

              {/* Comments Section */}
              <div className="border-t border-slate-800 pt-5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-400" />
                  <span>Discussion ({selectedArticle.comments?.length || 0})</span>
                </h3>

                {/* Comment Form */}
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={`Comment as ${user.username}...`}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center gap-1 shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Post</span>
                  </button>
                </form>

                {/* Comments List */}
                <div className="space-y-2.5">
                  {!selectedArticle.comments || selectedArticle.comments.length === 0 ? (
                    <p className="text-xs text-slate-500 py-2">No comments yet. Be the first to share your thoughts!</p>
                  ) : (
                    selectedArticle.comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between text-slate-400">
                          <span className="font-bold text-white">{comment.userName}</span>
                          <button
                            type="button"
                            onClick={() => handleLikeComment(comment.id)}
                            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-amber-400 transition"
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span>{comment.likes || 0}</span>
                          </button>
                        </div>
                        <p className="text-slate-300">{comment.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
