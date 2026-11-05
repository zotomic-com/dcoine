import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  Save,
  CheckCircle,
  Eye,
  Sliders,
  Sparkles,
  Search,
  Check,
  X,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Copy,
  Layers,
  Image as ImageIcon,
  Video,
  Type,
  Maximize2,
  Minimize2,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Globe,
  Share2,
  ShieldCheck,
  ExternalLink,
  Tag,
  AlertCircle,
  Code,
  Layout,
  CornerDownRight,
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import {
  CMSPage,
  CMSPageBlock,
  PageAccentColor,
  PageAlignment,
  PageBgTheme,
  PageBlockType,
  PageContainerWidth,
  PagePadding,
} from '../../types';

export const AdminCMSPagesView: React.FC = () => {
  const [pages, setPages] = useState<CMSPage[]>(() => StorageService.getCMSPages());
  const [searchQuery, setSearchQuery] = useState('');

  // Editing state (null = directory list, non-null = page customizer)
  const [editingPage, setEditingPage] = useState<CMSPage | null>(null);
  const [editorTab, setEditorTab] = useState<'content' | 'seo' | 'preview'>('content');

  // New Page creation modal
  const [isNewPageModalOpen, setIsNewPageModalOpen] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');
  const [newPageTemplate, setNewPageTemplate] = useState<'blank' | 'policy' | 'landing' | 'about'>('blank');

  // Live reader preview modal
  const [previewModalPage, setPreviewModalPage] = useState<CMSPage | null>(null);

  // New tag input for SEO
  const [newTagInput, setNewTagInput] = useState('');

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // -------------------------------------------------------------
  // CRUD OPERATIONS
  // -------------------------------------------------------------
  const handleCreateNewPage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageTitle.trim()) return;

    const slug = (newPageSlug.trim() || newPageTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'))
      .replace(/^-|-$/g, '');

    // Check duplicate slug
    if (pages.some((p) => p.slug === slug)) {
      alert('A page with this slug already exists. Please choose a distinct URL slug.');
      return;
    }

    let initialBlocks: CMSPageBlock[] = [];
    if (newPageTemplate === 'policy') {
      initialBlocks = [
        {
          id: `b-${Date.now()}-1`,
          type: 'hero',
          heading: newPageTitle,
          subheading: 'Official compliance and legal framework documentation.',
          alignment: 'center',
          containerWidth: 'medium',
          paddingY: 'relaxed',
          bgTheme: 'midnight_gradient',
          accentColor: 'amber',
          hasBorder: true,
        },
        {
          id: 'b-' + Date.now() + '-2',
          type: 'text',
          heading: '1. Overview & General Provisions',
          text: 'This policy sets forth the operational standards and requirements applicable to all ecosystem participants.',
          alignment: 'left',
          containerWidth: 'medium',
          paddingY: 'normal',
          bgTheme: 'slate_card',
          accentColor: 'amber',
          hasBorder: false,
        },
      ];
    } else if (newPageTemplate === 'landing') {
      initialBlocks = [
        {
          id: `b-${Date.now()}-1`,
          type: 'hero',
          heading: newPageTitle,
          subheading: 'Experience the next standard in decentralized financial sovereignty.',
          alignment: 'center',
          containerWidth: 'wide',
          paddingY: 'spacious',
          bgTheme: 'amber_subtle',
          accentColor: 'amber',
          hasBorder: true,
        },
        {
          id: `b-${Date.now()}-2`,
          type: 'image',
          heading: 'Ecosystem Architecture Overview',
          imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80',
          imageAlt: 'Architecture',
          imageCaption: 'Distributed consensus across high-performance networks.',
          alignment: 'center',
          containerWidth: 'medium',
          paddingY: 'normal',
          bgTheme: 'slate_card',
          accentColor: 'amber',
          hasBorder: true,
        },
        {
          id: `b-${Date.now()}-3`,
          type: 'cta',
          heading: 'Get Started Today',
          subheading: 'Start cloud mining and trade securely with smart contract escrow protection.',
          ctaText: 'Launch App',
          ctaUrl: 'mining',
          alignment: 'center',
          containerWidth: 'medium',
          paddingY: 'relaxed',
          bgTheme: 'midnight_gradient',
          accentColor: 'amber',
          hasBorder: true,
        },
      ];
    } else if (newPageTemplate === 'about') {
      initialBlocks = [
        {
          id: `b-${Date.now()}-1`,
          type: 'hero',
          heading: newPageTitle,
          subheading: 'Our mission to democratize decentralized cloud mining and zero-barrier trading.',
          alignment: 'center',
          containerWidth: 'medium',
          paddingY: 'relaxed',
          bgTheme: 'midnight_gradient',
          accentColor: 'amber',
          hasBorder: true,
        },
        {
          id: `b-${Date.now()}-2`,
          type: 'text',
          heading: 'Pioneering Trustless Web3 Access',
          text: 'Founded to deliver real financial sovereignty without hardware barriers, custodial risks, or centralized gatekeepers.',
          alignment: 'left',
          containerWidth: 'medium',
          paddingY: 'normal',
          bgTheme: 'slate_card',
          accentColor: 'amber',
          hasBorder: false,
        },
      ];
    } else {
      // blank
      initialBlocks = [
        {
          id: `b-${Date.now()}-1`,
          type: 'hero',
          heading: newPageTitle,
          subheading: 'Welcome to our new custom page.',
          alignment: 'center',
          containerWidth: 'medium',
          paddingY: 'normal',
          bgTheme: 'slate_card',
          accentColor: 'amber',
          hasBorder: true,
        },
      ];
    }

    const created = StorageService.addCMSPage({
      slug,
      title: newPageTitle,
      subtitle: 'Custom page built with Dcoine CMS Builder',
      isPublished: true,
      author: 'Content Team',
      blocks: initialBlocks,
      seo: {
        metaTitle: `${newPageTitle} | Dcoine Network`,
        metaDescription: `Discover ${newPageTitle} on the Dcoine decentralized ecosystem platform.`,
        tags: [slug.replace(/-/g, ' '), 'dcoine', 'crypto', 'web3'],
        ogTitle: `${newPageTitle} – Dcoine`,
        ogDescription: `Discover ${newPageTitle} on the Dcoine decentralized ecosystem platform.`,
        ogImageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80',
        canonicalUrl: `https://dcoine.network/page/${slug}`,
        robotsDirective: 'index, follow',
        schemaType: 'WebPage',
      },
    });

    setPages(StorageService.getCMSPages());
    setIsNewPageModalOpen(false);
    setNewPageTitle('');
    setNewPageSlug('');
    setEditingPage(created);
    setEditorTab('content');
    showToast(`Page '${created.title}' created! Opening Visual Page Builder...`);
  };

  const handleSavePageEdits = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingPage) return;

    StorageService.updateCMSPage(editingPage);
    setPages(StorageService.getCMSPages());
    showToast(`Page '${editingPage.title}' and SEO metadata saved live!`);
  };

  const handleDeletePage = (page: CMSPage) => {
    if (confirm(`Are you sure you want to delete '${page.title}' (/page/${page.slug})? This action cannot be undone.`)) {
      StorageService.deleteCMSPage(page.id);
      setPages(StorageService.getCMSPages());
      if (editingPage?.id === page.id) {
        setEditingPage(null);
      }
      showToast(`Page '${page.title}' deleted.`);
    }
  };

  // -------------------------------------------------------------
  // BLOCK MANAGEMENT HANDLERS
  // -------------------------------------------------------------
  const handleAddBlock = (type: PageBlockType) => {
    if (!editingPage) return;

    const newBlock: CMSPageBlock = {
      id: `b-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      type,
      heading:
        type === 'hero'
          ? 'New Hero Section'
          : type === 'text'
          ? 'Section Title'
          : type === 'image'
          ? 'Featured Media Image'
          : type === 'video'
          ? 'Featured Protocol Video'
          : 'Call To Action',
      subheading: type === 'hero' ? 'Add compelling subtitle text here.' : undefined,
      text:
        type === 'text'
          ? 'Write detailed rich text, explanations, instructions, or policy articles here...'
          : undefined,
      imageUrl:
        type === 'image'
          ? 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80'
          : undefined,
      imageAlt: type === 'image' ? 'Illustration' : undefined,
      videoUrl: type === 'video' ? 'https://www.youtube.com/embed/dQw4w9WgXcQ' : undefined,
      ctaText: type === 'cta' ? 'Get Started' : undefined,
      ctaUrl: type === 'cta' ? 'mining' : undefined,
      alignment: 'center',
      containerWidth: 'medium',
      paddingY: 'normal',
      bgTheme: 'slate_card',
      accentColor: 'amber',
      hasBorder: true,
    };

    setEditingPage({
      ...editingPage,
      blocks: [...editingPage.blocks, newBlock],
    });
    showToast(`Added new ${type.toUpperCase()} block.`);
  };

  const handleUpdateBlock = (blockId: string, updates: Partial<CMSPageBlock>) => {
    if (!editingPage) return;
    const updatedBlocks = editingPage.blocks.map((b) => (b.id === blockId ? { ...b, ...updates } : b));
    setEditingPage({
      ...editingPage,
      blocks: updatedBlocks,
    });
  };

  const handleDeleteBlock = (blockId: string) => {
    if (!editingPage) return;
    const updatedBlocks = editingPage.blocks.filter((b) => b.id !== blockId);
    setEditingPage({
      ...editingPage,
      blocks: updatedBlocks,
    });
    showToast('Block removed from page.');
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    if (!editingPage) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= editingPage.blocks.length) return;

    const newBlocks = [...editingPage.blocks];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[targetIdx];
    newBlocks[targetIdx] = temp;

    setEditingPage({
      ...editingPage,
      blocks: newBlocks,
    });
  };

  // -------------------------------------------------------------
  // SEO & TAGS HANDLERS
  // -------------------------------------------------------------
  const handleAddTag = () => {
    if (!editingPage || !newTagInput.trim()) return;
    const tag = newTagInput.trim().toLowerCase();
    if (!editingPage.seo.tags.includes(tag)) {
      setEditingPage({
        ...editingPage,
        seo: {
          ...editingPage.seo,
          tags: [...editingPage.seo.tags, tag],
        },
      });
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!editingPage) return;
    setEditingPage({
      ...editingPage,
      seo: {
        ...editingPage.seo,
        tags: editingPage.seo.tags.filter((t) => t !== tagToRemove),
      },
    });
  };

  // Calculate SEO score
  const calculateSeoScore = (page: CMSPage): number => {
    let score = 0;
    if (page.seo.metaTitle && page.seo.metaTitle.length >= 25 && page.seo.metaTitle.length <= 65) score += 30;
    else if (page.seo.metaTitle) score += 15;

    if (page.seo.metaDescription && page.seo.metaDescription.length >= 80 && page.seo.metaDescription.length <= 170)
      score += 30;
    else if (page.seo.metaDescription) score += 15;

    if (page.seo.tags && page.seo.tags.length >= 3) score += 15;
    else if (page.seo.tags && page.seo.tags.length > 0) score += 8;

    if (page.seo.ogImageUrl) score += 15;
    if (page.seo.canonicalUrl) score += 10;
    return Math.min(score, 100);
  };

  // =========================================================================
  // VIEW: PAGE CUSTOMIZER (EDITING A SPECIFIC PAGE)
  // =========================================================================
  if (editingPage) {
    const seoScore = calculateSeoScore(editingPage);

    return (
      <div className="space-y-5 animate-fadeIn">
        {/* Editor Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl sticky top-2 z-30 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (confirm('Return to pages list? Be sure you have saved any unsaved changes.')) {
                  setEditingPage(null);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-xs font-semibold transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Pages</span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-white text-sm">{editingPage.title}</span>
                <span className="text-[11px] font-mono text-amber-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  /page/{editingPage.slug}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    editingPage.isPublished
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {editingPage.isPublished ? 'Live' : 'Draft'}
                </span>
              </div>
            </div>
          </div>

          {/* Sub-Tabs: Content vs SEO vs Preview */}
          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setEditorTab('content')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  editorTab === 'content'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layout className="w-3.5 h-3.5" />
                <span>Page Content & Blocks ({editingPage.blocks.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setEditorTab('seo')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  editorTab === 'seo'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>SEO & Meta Data</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                    seoScore >= 80 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {seoScore}%
                </span>
              </button>

              <button
                type="button"
                onClick={() => setEditorTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  editorTab === 'preview'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Live Preview</span>
              </button>
            </div>

            <button
              onClick={() => handleSavePageEdits()}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Page</span>
            </button>
          </div>
        </div>

        {/* Global Page Settings Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs">
          <div>
            <label className="text-slate-400 font-medium">Page Title</label>
            <input
              type="text"
              value={editingPage.title}
              onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
              className="w-full mt-1 p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-bold"
            />
          </div>
          <div>
            <label className="text-slate-400 font-medium">URL Slug (e.g. /page/tokenomics)</label>
            <input
              type="text"
              value={editingPage.slug}
              onChange={(e) =>
                setEditingPage({
                  ...editingPage,
                  slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                })
              }
              className="w-full mt-1 p-2 bg-slate-950 border border-slate-800 rounded-lg text-amber-300 font-mono"
            />
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-3 pt-4 sm:pt-0">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-white">
              <input
                type="checkbox"
                checked={editingPage.isPublished}
                onChange={(e) => setEditingPage({ ...editingPage, isPublished: e.target.checked })}
                className="w-4 h-4 rounded text-amber-500 bg-slate-950 border-slate-700"
              />
              <span>Published Live</span>
            </label>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* TAB 1: CONTENT & BLOCKS BUILDER */}
        {/* ===================================================================== */}
        {editorTab === 'content' && (
          <div className="space-y-5">
            {/* Add New Block Toolbar */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Add Content Component Block:</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAddBlock('hero')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-amber-300 border border-slate-800 text-xs font-semibold transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Hero Header</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddBlock('text')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold transition"
                >
                  <Type className="w-3.5 h-3.5 text-blue-400" />
                  <span>Rich Text / Paragraph</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddBlock('image')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold transition"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Image Media</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddBlock('video')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold transition"
                >
                  <Video className="w-3.5 h-3.5 text-rose-400" />
                  <span>Video Embed</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddBlock('cta')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold transition"
                >
                  <CornerDownRight className="w-3.5 h-3.5 text-purple-400" />
                  <span>Call to Action (CTA)</span>
                </button>
              </div>
            </div>

            {/* Blocks List */}
            {editingPage.blocks.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-slate-900/40 border-2 border-dashed border-slate-800 space-y-3">
                <FileText className="w-8 h-8 text-slate-600 mx-auto" />
                <div className="text-sm font-bold text-slate-300">No content blocks yet</div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Use the toolbar above to add text, image media, video embeds, or hero banners to this page.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {editingPage.blocks.map((block, index) => (
                  <div
                    key={block.id}
                    className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4 hover:border-slate-700 transition"
                  >
                    {/* Block Header & Reorder Bar */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-slate-500">#{index + 1}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {block.type}
                        </span>
                        <span className="text-xs font-bold text-white truncate max-w-xs">
                          {block.heading || 'Untitled Block'}
                        </span>
                      </div>

                      {/* Move Up / Down / Delete */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveBlock(index, 'up')}
                          className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                          title="Move block up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === editingPage.blocks.length - 1}
                          onClick={() => handleMoveBlock(index, 'down')}
                          className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                          title="Move block down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBlock(block.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition ml-1"
                          title="Delete block"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Content Inputs */}
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-slate-400 font-medium">Heading / Title</label>
                        <input
                          type="text"
                          value={block.heading || ''}
                          onChange={(e) => handleUpdateBlock(block.id, { heading: e.target.value })}
                          placeholder="Section Heading"
                          className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-bold"
                        />
                      </div>

                      {block.type === 'hero' && (
                        <div>
                          <label className="text-xs text-slate-400 font-medium">Hero Subtitle</label>
                          <input
                            type="text"
                            value={block.subheading || ''}
                            onChange={(e) => handleUpdateBlock(block.id, { subheading: e.target.value })}
                            placeholder="Hero subtitle description..."
                            className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300"
                          />
                        </div>
                      )}

                      {(block.type === 'text' || block.type === 'cta') && (
                        <div>
                          <label className="text-xs text-slate-400 font-medium">
                            {block.type === 'cta' ? 'CTA Subtitle' : 'Paragraph / Text Body Content'}
                          </label>
                          <textarea
                            rows={block.type === 'cta' ? 2 : 5}
                            value={block.text || ''}
                            onChange={(e) => handleUpdateBlock(block.id, { text: e.target.value })}
                            placeholder="Write comprehensive content..."
                            className="w-full mt-1 p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 leading-relaxed font-sans"
                          />
                        </div>
                      )}

                      {block.type === 'image' && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs text-slate-400 font-medium">Image URL</label>
                              <input
                                type="url"
                                value={block.imageUrl || ''}
                                onChange={(e) => handleUpdateBlock(block.id, { imageUrl: e.target.value })}
                                placeholder="https://..."
                                className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-slate-400 font-medium">Alt Text (Accessibility & SEO)</label>
                              <input
                                type="text"
                                value={block.imageAlt || ''}
                                onChange={(e) => handleUpdateBlock(block.id, { imageAlt: e.target.value })}
                                placeholder="Descriptive alt text"
                                className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-xs text-slate-400 font-medium">Caption Description</label>
                            <input
                              type="text"
                              value={block.imageCaption || ''}
                              onChange={(e) => handleUpdateBlock(block.id, { imageCaption: e.target.value })}
                              placeholder="Optional image caption..."
                              className="w-full mt-1 p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-400"
                            />
                          </div>

                          {block.imageUrl && (
                            <div className="relative h-44 rounded-xl overflow-hidden border border-slate-800 max-w-md">
                              <img src={block.imageUrl} alt="preview" className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>
                      )}

                      {block.type === 'video' && (
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs text-slate-400 font-medium">Video Embed URL (YouTube, Vimeo or MP4)</label>
                            <input
                              type="url"
                              value={block.videoUrl || ''}
                              onChange={(e) => handleUpdateBlock(block.id, { videoUrl: e.target.value })}
                              placeholder="e.g. https://www.youtube.com/embed/dQw4w9WgXcQ"
                              className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-amber-300 font-mono"
                            />
                          </div>
                          {block.videoUrl && (
                            <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-800 max-w-lg bg-black">
                              <iframe
                                src={block.videoUrl}
                                title="Video preview"
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {block.type === 'cta' && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-slate-400 font-medium">Button Label</label>
                            <input
                              type="text"
                              value={block.ctaText || ''}
                              onChange={(e) => handleUpdateBlock(block.id, { ctaText: e.target.value })}
                              placeholder="e.g. Start Cloud Mining"
                              className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-bold"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-slate-400 font-medium">Button Target Tab / URL</label>
                            <input
                              type="text"
                              value={block.ctaUrl || ''}
                              onChange={(e) => handleUpdateBlock(block.id, { ctaUrl: e.target.value })}
                              placeholder="e.g. mining or https://..."
                              className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-amber-300 font-mono"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Layout, Spacing & Color Customization Controls */}
                    <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      {/* Alignment */}
                      <div>
                        <label className="text-slate-400 font-medium block mb-1">Position / Alignment</label>
                        <select
                          value={block.alignment}
                          onChange={(e) =>
                            handleUpdateBlock(block.id, { alignment: e.target.value as PageAlignment })
                          }
                          className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                        >
                          <option value="left">Left Aligned</option>
                          <option value="center">Centered</option>
                          <option value="right">Right Aligned</option>
                        </select>
                      </div>

                      {/* Width */}
                      <div>
                        <label className="text-slate-400 font-medium block mb-1">Container Width</label>
                        <select
                          value={block.containerWidth}
                          onChange={(e) =>
                            handleUpdateBlock(block.id, {
                              containerWidth: e.target.value as PageContainerWidth,
                            })
                          }
                          className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                        >
                          <option value="narrow">Narrow (680px)</option>
                          <option value="medium">Medium (900px)</option>
                          <option value="wide">Wide (1150px)</option>
                          <option value="full">Full Width</option>
                        </select>
                      </div>

                      {/* Spacing / Padding */}
                      <div>
                        <label className="text-slate-400 font-medium block mb-1">Vertical Spacing (Padding)</label>
                        <select
                          value={block.paddingY}
                          onChange={(e) =>
                            handleUpdateBlock(block.id, { paddingY: e.target.value as PagePadding })
                          }
                          className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                        >
                          <option value="compact">Compact (16px)</option>
                          <option value="normal">Normal (32px)</option>
                          <option value="relaxed">Relaxed (56px)</option>
                          <option value="spacious">Spacious (80px)</option>
                        </select>
                      </div>

                      {/* Color Theme */}
                      <div>
                        <label className="text-slate-400 font-medium block mb-1">Background Theme & Color</label>
                        <select
                          value={block.bgTheme}
                          onChange={(e) =>
                            handleUpdateBlock(block.id, { bgTheme: e.target.value as PageBgTheme })
                          }
                          className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-amber-300 font-semibold"
                        >
                          <option value="slate_card">Slate Card Box</option>
                          <option value="slate_dark">Deep Dark Background</option>
                          <option value="midnight_gradient">Midnight Gradient</option>
                          <option value="amber_subtle">Subtle Amber Glow</option>
                          <option value="transparent">Transparent</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===================================================================== */}
        {/* TAB 2: SEO & META DATA BUILDER */}
        {/* ===================================================================== */}
        {editorTab === 'seo' && (
          <div className="space-y-6">
            {/* SEO Health Card */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-black text-white">Search Engine Optimization & Social Sharing Score</h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Optimize title length, rich summary description, tags, and OpenGraph share card preview
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-2xl font-black text-amber-400">{seoScore}%</div>
                  <div className="text-[10px] text-slate-400 font-medium">SEO Readiness</div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                  {seoScore >= 80 ? (
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-amber-400" />
                  )}
                </div>
              </div>
            </div>

            {/* Core Meta Fields */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Search Engine Snippet</h4>

              <div>
                <div className="flex items-center justify-between text-xs">
                  <label className="text-slate-300 font-semibold">Meta Page Title (&lt;title&gt; and og:title)</label>
                  <span
                    className={`font-mono text-[11px] ${
                      editingPage.seo.metaTitle.length >= 30 && editingPage.seo.metaTitle.length <= 60
                        ? 'text-emerald-400 font-bold'
                        : 'text-amber-400'
                    }`}
                  >
                    {editingPage.seo.metaTitle.length} / 60 chars (optimal: 30-60)
                  </span>
                </div>
                <input
                  type="text"
                  value={editingPage.seo.metaTitle}
                  onChange={(e) =>
                    setEditingPage({
                      ...editingPage,
                      seo: { ...editingPage.seo, metaTitle: e.target.value },
                    })
                  }
                  placeholder="e.g. Terms of Service & Escrow Rules | Dcoine Network"
                  className="w-full mt-1.5 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-bold"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs">
                  <label className="text-slate-300 font-semibold">
                    Meta Description (&lt;meta name="description"&gt;)
                  </label>
                  <span
                    className={`font-mono text-[11px] ${
                      editingPage.seo.metaDescription.length >= 120 && editingPage.seo.metaDescription.length <= 160
                        ? 'text-emerald-400 font-bold'
                        : 'text-amber-400'
                    }`}
                  >
                    {editingPage.seo.metaDescription.length} / 160 chars (optimal: 120-160)
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={editingPage.seo.metaDescription}
                  onChange={(e) =>
                    setEditingPage({
                      ...editingPage,
                      seo: { ...editingPage.seo, metaDescription: e.target.value },
                    })
                  }
                  placeholder="Accurate 1-2 sentence compelling summary of this page..."
                  className="w-full mt-1.5 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
                />
              </div>

              {/* Google Snippet Search Preview */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
                  <Globe className="w-3 h-3 text-emerald-400" />
                  <span>https://dcoine.network/page/{editingPage.slug}</span>
                </div>
                <div className="text-sm font-bold text-blue-400 hover:underline cursor-pointer">
                  {editingPage.seo.metaTitle || 'Page Title Placeholder'}
                </div>
                <div className="text-xs text-slate-400 line-clamp-2">
                  {editingPage.seo.metaDescription || 'Meta description will be displayed here in search result snippets.'}
                </div>
              </div>
            </div>

            {/* TAGS & KEYWORDS MANAGER */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Tag className="w-4 h-4 text-amber-400" />
                  <span>Page Keywords & Tags ({editingPage.seo.tags.length})</span>
                </h4>
                <span className="text-[11px] text-slate-400">Used for indexing and on-site discovery</span>
              </div>

              {/* Add tag input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Enter a keyword / tag (e.g. escrow rules, cloud mining, staking)..."
                  className="flex-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Add Tag
                </button>
              </div>

              {/* Active Tag Chips */}
              <div className="flex flex-wrap gap-2 pt-1">
                {editingPage.seo.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-950 border border-slate-800 text-amber-300"
                  >
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-slate-400 hover:text-rose-400 cursor-pointer"
                      title="Remove tag"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Quick suggestions */}
              <div className="pt-2 border-t border-slate-800 flex items-center gap-2 text-xs text-slate-500">
                <span>Quick suggestions:</span>
                {['dcoine', 'crypto', 'web3', 'blockchain', 'escrow', 'mining', 'security'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      if (!editingPage.seo.tags.includes(s)) {
                        setEditingPage({
                          ...editingPage,
                          seo: { ...editingPage.seo, tags: [...editingPage.seo.tags, s] },
                        });
                      }
                    }}
                    className="px-2 py-0.5 rounded bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-amber-300 border border-slate-800 text-[11px] transition"
                  >
                    +{s}
                  </button>
                ))}
              </div>
            </div>

            {/* OPENGRAPH SOCIAL SHARE CARDS */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Share2 className="w-4 h-4 text-purple-400" />
                <span>OpenGraph (Social Share Card for X/Twitter, Slack & Discord)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-300 font-semibold">Social Card Title (og:title)</label>
                  <input
                    type="text"
                    value={editingPage.seo.ogTitle || editingPage.seo.metaTitle}
                    onChange={(e) =>
                      setEditingPage({
                        ...editingPage,
                        seo: { ...editingPage.seo, ogTitle: e.target.value },
                      })
                    }
                    className="w-full mt-1.5 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold">Social Share Banner Image URL (og:image)</label>
                  <input
                    type="url"
                    value={editingPage.seo.ogImageUrl}
                    onChange={(e) =>
                      setEditingPage({
                        ...editingPage,
                        seo: { ...editingPage.seo, ogImageUrl: e.target.value },
                      })
                    }
                    className="w-full mt-1.5 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold">Social Card Description (og:description)</label>
                <textarea
                  rows={2}
                  value={editingPage.seo.ogDescription || editingPage.seo.metaDescription}
                  onChange={(e) =>
                    setEditingPage({
                      ...editingPage,
                      seo: { ...editingPage.seo, ogDescription: e.target.value },
                    })
                  }
                  className="w-full mt-1.5 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                />
              </div>

              {/* Realistic Social Card Preview */}
              <div className="pt-2">
                <div className="text-[11px] font-bold text-slate-400 mb-2">Live Social Card Preview:</div>
                <div className="max-w-md rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl">
                  {editingPage.seo.ogImageUrl ? (
                    <div className="h-44 w-full bg-slate-900 overflow-hidden">
                      <img src={editingPage.seo.ogImageUrl} alt="og-card" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-32 w-full bg-slate-900 flex items-center justify-center text-xs text-slate-500">
                      No OG Image specified
                    </div>
                  )}
                  <div className="p-3.5 space-y-1">
                    <div className="text-[10px] text-slate-500 font-mono uppercase">dcoine.network</div>
                    <div className="text-xs font-bold text-white line-clamp-1">
                      {editingPage.seo.ogTitle || editingPage.title}
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-2">
                      {editingPage.seo.ogDescription || editingPage.seo.metaDescription}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* TECHNICAL SEARCH DIRECTIVES */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Technical Crawling Directives</h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 font-medium">Canonical URL</label>
                  <input
                    type="text"
                    value={editingPage.seo.canonicalUrl}
                    onChange={(e) =>
                      setEditingPage({
                        ...editingPage,
                        seo: { ...editingPage.seo, canonicalUrl: e.target.value },
                      })
                    }
                    className="w-full mt-1 p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-medium">Robots Crawling Directive</label>
                  <select
                    value={editingPage.seo.robotsDirective}
                    onChange={(e) =>
                      setEditingPage({
                        ...editingPage,
                        seo: {
                          ...editingPage.seo,
                          robotsDirective: e.target.value as any,
                        },
                      })
                    }
                    className="w-full mt-1 p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  >
                    <option value="index, follow">Index, Follow (Recommended)</option>
                    <option value="noindex, nofollow">Noindex, Nofollow (Private)</option>
                    <option value="noindex, follow">Noindex, Follow</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-medium">Schema.org Structured Type</label>
                  <select
                    value={editingPage.seo.schemaType}
                    onChange={(e) =>
                      setEditingPage({
                        ...editingPage,
                        seo: {
                          ...editingPage.seo,
                          schemaType: e.target.value as any,
                        },
                      })
                    }
                    className="w-full mt-1 p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  >
                    <option value="WebPage">WebPage (General)</option>
                    <option value="Article">Article / Publication</option>
                    <option value="AboutPage">AboutPage</option>
                    <option value="FAQPage">FAQPage</option>
                    <option value="ContactPage">ContactPage</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* TAB 3: LIVE PREVIEW OF THE PAGE */}
        {/* ===================================================================== */}
        {editorTab === 'preview' && (
          <div className="rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl p-6 sm:p-10 space-y-8">
            <div className="border-b border-slate-800/80 pb-4 flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-4 h-4" /> Live Visitor Rendering
              </span>
              <span className="text-xs text-slate-500 font-mono">/page/{editingPage.slug}</span>
            </div>

            {editingPage.blocks.map((block) => {
              const paddingClass =
                block.paddingY === 'compact'
                  ? 'py-4'
                  : block.paddingY === 'relaxed'
                  ? 'py-14'
                  : block.paddingY === 'spacious'
                  ? 'py-20'
                  : 'py-8';

              const widthClass =
                block.containerWidth === 'narrow'
                  ? 'max-w-2xl'
                  : block.containerWidth === 'wide'
                  ? 'max-w-6xl'
                  : block.containerWidth === 'full'
                  ? 'w-full'
                  : 'max-w-4xl';

              const alignClass =
                block.alignment === 'center'
                  ? 'text-center mx-auto'
                  : block.alignment === 'right'
                  ? 'text-right ml-auto'
                  : 'text-left';

              const bgThemeClass =
                block.bgTheme === 'midnight_gradient'
                  ? 'bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/20'
                  : block.bgTheme === 'amber_subtle'
                  ? 'bg-amber-950/20 border border-amber-500/20'
                  : block.bgTheme === 'slate_dark'
                  ? 'bg-slate-950'
                  : block.bgTheme === 'transparent'
                  ? 'bg-transparent'
                  : 'bg-slate-900/80';

              return (
                <div
                  key={block.id}
                  className={`rounded-3xl p-6 sm:p-8 ${bgThemeClass} ${paddingClass} ${
                    block.hasBorder ? 'border border-slate-800' : ''
                  }`}
                >
                  <div className={`${widthClass} ${alignClass} space-y-4`}>
                    {block.heading && (
                      <h2
                        className={`font-black tracking-tight text-white ${
                          block.type === 'hero' ? 'text-3xl sm:text-5xl leading-tight' : 'text-xl sm:text-2xl'
                        }`}
                      >
                        {block.heading}
                      </h2>
                    )}

                    {block.subheading && <p className="text-sm sm:text-base text-slate-400">{block.subheading}</p>}

                    {block.text && (
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans whitespace-pre-line">
                        {block.text}
                      </p>
                    )}

                    {block.type === 'image' && block.imageUrl && (
                      <div className="space-y-2 pt-2">
                        <img
                          src={block.imageUrl}
                          alt={block.imageAlt || 'Illustration'}
                          className="rounded-2xl max-h-96 w-auto mx-auto border border-slate-800 object-cover shadow-2xl"
                        />
                        {block.imageCaption && (
                          <div className="text-[11px] text-slate-400 italic text-center">{block.imageCaption}</div>
                        )}
                      </div>
                    )}

                    {block.type === 'video' && block.videoUrl && (
                      <div className="aspect-video max-w-2xl mx-auto rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-black">
                        <iframe
                          src={block.videoUrl}
                          title={block.heading || 'Video'}
                          className="w-full h-full"
                          allowFullScreen
                        />
                      </div>
                    )}

                    {block.type === 'cta' && (
                      <div className="pt-2">
                        <button
                          type="button"
                          className="px-6 py-3 rounded-2xl bg-amber-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20"
                        >
                          {block.ctaText || 'Get Started'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW: PAGES DIRECTORY / LIST
  // =========================================================================
  const filteredPages = pages.filter(
    (p) =>
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-16 right-5 z-50 p-3.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <Layout className="w-5 h-5 text-amber-400" />
            Custom Pages & Visual Builder
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Add new pages, edit rich blocks (text, image, video, layout, spacing, colors) and configure comprehensive SEO & social cards
          </p>
        </div>

        <button
          onClick={() => setIsNewPageModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-amber-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Page</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Search pages by title or slug..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
        />
      </div>

      {/* Pages Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPages.map((page) => {
          const seoScore = calculateSeoScore(page);

          return (
            <div
              key={page.id}
              className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl flex flex-col justify-between hover:border-amber-500/30 transition group space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-white group-hover:text-amber-300 transition line-clamp-1">
                      {page.title}
                    </h4>
                    <span className="text-[11px] font-mono text-amber-400/90">/page/{page.slug}</span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      page.isPublished
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {page.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                  {page.seo.metaDescription || page.subtitle || 'Custom page built with CMS Visual Builder.'}
                </p>

                {/* Blocks & SEO pill */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-center">
                  <div className="bg-slate-950 p-2 rounded-xl border border-slate-800/60">
                    <div className="text-[10px] text-slate-400">Content Blocks</div>
                    <div className="text-xs font-bold text-white mt-0.5">{page.blocks.length} Blocks</div>
                  </div>

                  <div className="bg-slate-950 p-2 rounded-xl border border-slate-800/60">
                    <div className="text-[10px] text-slate-400">SEO Health</div>
                    <div
                      className={`text-xs font-bold mt-0.5 ${
                        seoScore >= 80 ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {seoScore}% Score
                    </div>
                  </div>
                </div>

                {/* Tags preview */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {page.seo.tags.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="text-[9px] px-1.5 py-0.2 rounded bg-slate-950 text-slate-400 border border-slate-800"
                    >
                      #{t}
                    </span>
                  ))}
                  {page.seo.tags.length > 3 && (
                    <span className="text-[9px] text-slate-500">+{page.seo.tags.length - 3}</span>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingPage(page);
                    setEditorTab('content');
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold text-xs transition cursor-pointer border border-amber-500/30"
                >
                  <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Edit Page & SEO</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPreviewModalPage(page)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    title="Live Reader Preview"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeletePage(page)}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                    title="Delete Page"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: ADD NEW PAGE */}
      {/* ========================================================================= */}
      {isNewPageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleCreateNewPage}
            className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Create New Custom Page</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsNewPageModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-semibold">Page Title</label>
              <input
                required
                type="text"
                value={newPageTitle}
                onChange={(e) => {
                  setNewPageTitle(e.target.value);
                  if (!newPageSlug) {
                    setNewPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                  }
                }}
                placeholder="e.g. Protocol Whitepaper or Tokenomics"
                className="w-full mt-1.5 p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-semibold">URL Path Slug</label>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-xs text-slate-500 font-mono">/page/</span>
                <input
                  required
                  type="text"
                  value={newPageSlug}
                  onChange={(e) => setNewPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="tokenomics"
                  className="flex-1 p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-amber-400 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-semibold">Starter Layout Template</label>
              <div className="grid grid-cols-2 gap-2 mt-1.5">
                {[
                  { id: 'blank', label: 'Blank Canvas', desc: 'Empty canvas to build custom blocks' },
                  { id: 'policy', label: 'Legal & Policy', desc: 'Hero + structured legal article' },
                  { id: 'landing', label: 'Landing Showcase', desc: 'Hero + Media Image + CTA button' },
                  { id: 'about', label: 'About & Mission', desc: 'Hero + Mission narrative text' },
                ].map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setNewPageTemplate(t.id as any)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition ${
                      newPageTemplate === t.id
                        ? 'bg-amber-500/10 border-amber-500/50 text-amber-300'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold">{t.label}</div>
                    <div className="text-[10px] text-slate-500">{t.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsNewPageModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-md"
              >
                Create Page & Open Builder
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: FULL READER PREVIEW */}
      {/* ========================================================================= */}
      {previewModalPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl max-h-[90vh] overflow-y-auto space-y-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">{previewModalPage.title}</span>
                <span className="text-xs text-amber-400 font-mono">/page/{previewModalPage.slug}</span>
              </div>
              <button
                onClick={() => setPreviewModalPage(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {previewModalPage.blocks.map((block) => (
              <div key={block.id} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
                {block.heading && <h2 className="text-2xl font-black text-white">{block.heading}</h2>}
                {block.subheading && <p className="text-sm text-slate-400">{block.subheading}</p>}
                {block.text && <p className="text-xs text-slate-300 leading-relaxed">{block.text}</p>}
                {block.type === 'image' && block.imageUrl && (
                  <img src={block.imageUrl} alt="preview" className="rounded-xl max-h-72 mx-auto object-cover" />
                )}
                {block.type === 'video' && block.videoUrl && (
                  <div className="aspect-video max-w-lg mx-auto rounded-xl overflow-hidden bg-black">
                    <iframe src={block.videoUrl} title="video" className="w-full h-full" allowFullScreen />
                  </div>
                )}
                {block.type === 'cta' && (
                  <button className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs">
                    {block.ctaText || 'Get Started'}
                  </button>
                )}
              </div>
            ))}

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setPreviewModalPage(null)}
                className="px-5 py-2 bg-slate-800 text-white font-bold text-xs rounded-xl"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
