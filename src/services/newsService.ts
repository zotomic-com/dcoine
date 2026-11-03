import { NewsArticle } from '../types';
import { StorageService } from './storage';

const COINTELEGRAPH_RSS = 'https://api.rss2json.com/v1/api.json?rss_url=https://cointelegraph.com/rss';
const COINDESK_RSS = 'https://api.rss2json.com/v1/api.json?rss_url=https://www.coindesk.com/arc/outboundfeeds/rss/';

// Fallback high-res cover photos
const FALLBACK_COVERS: Record<string, string> = {
  Dcoine: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80',
  Bitcoin: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
  Ethereum: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?auto=format&fit=crop&w=1200&q=80',
  DeFi: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1200&q=80',
  Markets: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
  Regulation: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
  default: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=1200&q=80',
};

function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractFirstImage(item: any): string {
  if (item.thumbnail && typeof item.thumbnail === 'string' && item.thumbnail.startsWith('http')) {
    return item.thumbnail;
  }
  if (item.enclosure?.link && typeof item.enclosure.link === 'string' && item.enclosure.link.startsWith('http')) {
    return item.enclosure.link;
  }
  if (item.description) {
    const match = item.description.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (match && match[1]) return match[1];
  }
  if (item.content) {
    const match = item.content.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (match && match[1]) return match[1];
  }
  return '';
}

function detectCategory(title: string, desc: string, rawCategories?: string[]): string {
  const combined = `${title} ${desc} ${(rawCategories || []).join(' ')}`.toLowerCase();
  if (combined.includes('dcoin') || combined.includes('dcoine')) return 'Dcoine';
  if (combined.includes('bitcoin') || combined.includes('btc') || combined.includes('satoshi')) return 'Bitcoin';
  if (combined.includes('ethereum') || combined.includes('eth') || combined.includes('vitalik')) return 'Ethereum';
  if (combined.includes('defi') || combined.includes('dex') || combined.includes('swap') || combined.includes('yield') || combined.includes('liquidity')) return 'DeFi';
  if (combined.includes('sec') || combined.includes('regulation') || combined.includes('senate') || combined.includes('law') || combined.includes('ban') || combined.includes('court')) return 'Regulation';
  if (combined.includes('market') || combined.includes('rally') || combined.includes('bull') || combined.includes('price') || combined.includes('etf')) return 'Markets';
  return 'Crypto';
}

export function formatTimeAgo(dateStr: string): string {
  try {
    const time = new Date(dateStr).getTime();
    if (isNaN(time)) return 'Recently';
    const now = Date.now();
    const diff = Math.floor((now - time) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
}

export const NewsService = {
  // Fetch live crypto news with dual RSS2JSON endpoints and fallback
  async fetchLiveNews(): Promise<NewsArticle[]> {
    const cached = StorageService.getNews();

    try {
      // Fetch both CoinTelegraph and CoinDesk feeds concurrently with a 6-second timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const [resCT, resCD] = await Promise.allSettled([
        fetch(COINTELEGRAPH_RSS, { signal: controller.signal }),
        fetch(COINDESK_RSS, { signal: controller.signal }),
      ]);
      clearTimeout(timeoutId);

      const liveArticles: NewsArticle[] = [];

      // Process CoinTelegraph items
      if (resCT.status === 'fulfilled' && resCT.value.ok) {
        const data = await resCT.value.json();
        if (data.status === 'ok' && Array.isArray(data.items)) {
          data.items.slice(0, 10).forEach((item: any, idx: number) => {
            const cleanTitle = stripHtml(item.title);
            const cleanBody = stripHtml(item.description || item.content);
            const excerpt = cleanBody.length > 200 ? cleanBody.substring(0, 197) + '...' : cleanBody;
            const category = detectCategory(cleanTitle, cleanBody, item.categories);
            const img = extractFirstImage(item) || FALLBACK_COVERS[category] || FALLBACK_COVERS.default;

            liveArticles.push({
              id: `ct-${Date.parse(item.pubDate) || Date.now()}-${idx}`,
              title: cleanTitle,
              excerpt: excerpt || 'Latest developments from digital asset markets and blockchain infrastructure.',
              content: cleanBody || cleanTitle,
              source: 'CoinTelegraph',
              sourceUrl: item.link || 'https://cointelegraph.com',
              imageUrl: img,
              category: category as any,
              publishedAt: formatTimeAgo(item.pubDate),
              readTime: `${Math.max(2, Math.round(cleanBody.split(' ').length / 180))} min read`,
              likes: Math.floor(Math.random() * 180) + 45,
              comments: [],
            });
          });
        }
      }

      // Process CoinDesk items
      if (resCD.status === 'fulfilled' && resCD.value.ok) {
        const data = await resCD.value.json();
        if (data.status === 'ok' && Array.isArray(data.items)) {
          data.items.slice(0, 8).forEach((item: any, idx: number) => {
            const cleanTitle = stripHtml(item.title);
            const cleanBody = stripHtml(item.description || item.content);
            const excerpt = cleanBody.length > 200 ? cleanBody.substring(0, 197) + '...' : cleanBody;
            const category = detectCategory(cleanTitle, cleanBody, item.categories);
            const img = extractFirstImage(item) || FALLBACK_COVERS[category] || FALLBACK_COVERS.default;

            liveArticles.push({
              id: `cd-${Date.parse(item.pubDate) || Date.now()}-${idx}`,
              title: cleanTitle,
              excerpt: excerpt || 'Institutional insights and market intelligence across decentralized finance.',
              content: cleanBody || cleanTitle,
              source: 'CoinDesk',
              sourceUrl: item.link || 'https://coindesk.com',
              imageUrl: img,
              category: category as any,
              publishedAt: formatTimeAgo(item.pubDate),
              readTime: `${Math.max(2, Math.round(cleanBody.split(' ').length / 180))} min read`,
              likes: Math.floor(Math.random() * 220) + 60,
              comments: [],
            });
          });
        }
      }

      // If we got live articles, merge them with official Dcoine protocol announcements
      if (liveArticles.length > 0) {
        // Keep existing Dcoine native protocol articles pinned at top
        const dcoineArticles = cached.filter((a) => a.category === 'Dcoine' || a.source.includes('Dcoine'));
        
        // Preserve user comments and likes from existing cached articles
        const commentsMap = new Map<string, any[]>();
        const likesMap = new Map<string, number>();
        cached.forEach((a) => {
          if (a.comments && a.comments.length > 0) commentsMap.set(a.title.toLowerCase().trim(), a.comments);
          if (a.likes) likesMap.set(a.title.toLowerCase().trim(), a.likes);
        });

        const mergedLive = liveArticles.map((art) => {
          const key = art.title.toLowerCase().trim();
          return {
            ...art,
            comments: commentsMap.get(key) || art.comments,
            likes: likesMap.get(key) || art.likes,
          };
        });

        // Combined result: Dcoine pinned updates first, then fresh live feed
        const combined = [...dcoineArticles, ...mergedLive];
        
        // De-duplicate by title
        const seen = new Set<string>();
        const unique = combined.filter((item) => {
          const key = item.title.toLowerCase().trim();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        StorageService.saveNews(unique);
        if (typeof window !== 'undefined') {
          localStorage.setItem('dcoine_news_last_synced', Date.now().toString());
        }
        return unique;
      }
    } catch (err) {
      console.warn('Live news fetch issue, using cached news:', err);
    }

    return cached;
  },

  // Bookmark / Save Articles
  getSavedArticleIds(): string[] {
    try {
      const saved = localStorage.getItem('dcoine_saved_articles');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  toggleSaveArticle(id: string): boolean {
    const list = this.getSavedArticleIds();
    const exists = list.includes(id);
    const updated = exists ? list.filter((item) => item !== id) : [...list, id];
    try {
      localStorage.setItem('dcoine_saved_articles', JSON.stringify(updated));
    } catch {}
    return !exists;
  },

  isArticleSaved(id: string): boolean {
    return this.getSavedArticleIds().includes(id);
  },

  getLastSyncedTime(): string {
    try {
      const ts = localStorage.getItem('dcoine_news_last_synced');
      if (!ts) return 'Live Cached';
      return formatTimeAgo(new Date(parseInt(ts, 10)).toISOString());
    } catch {
      return 'Live';
    }
  },
};
