'use client';

import React, { useState, useRef } from 'react';
import { useApp } from '@/lib/store';
import { Avatar } from '@/components/common/Avatar';
import { Image as ImageIcon, Sparkles, Send, Tag, Smile, X, Upload, Lock, Search, Grid, Shuffle, Video, Film } from 'lucide-react';
import { SPACE_IMAGES, SpaceImage } from '@/lib/spaceImages';
import type { Post } from '@/lib/types';
import { generateId } from '@/lib/utils';

interface PostComposerProps {
  onSuccess?: () => void;
}

export const PostComposer: React.FC<PostComposerProps> = ({ onSuccess }) => {
  const { currentUser, createPost } = useApp();
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [postCategory, setPostCategory] = useState<NonNullable<Post['category']>>('text');
  const [performanceTitle, setPerformanceTitle] = useState('');
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [selectedTag, setSelectedTag] = useState('#CommunityUpdate');
  const [isPosting, setIsPosting] = useState(false);
  const postRequestId = useRef<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const availableTags = ['#CommunityUpdate', '#Productivity', '#AI', '#DesignSystem', '#CoreEngineering', '#CosmicHub'];
  const categories = ['All', 'Galaxies', 'Nebulae', 'Planets & Earth', 'Astronauts & Rockets', 'Deep Space & Stars'];

  const filteredSpaceImages = SPACE_IMAGES.filter((img) => {
    const matchesCat = selectedCategory === 'All' || img.category === selectedCategory;
    const matchesSearch = img.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('video/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawUrl = event.target?.result as string;
        if (rawUrl) {
          postRequestId.current = null;
          setMediaUrl(rawUrl);
          setMediaType('video');
        }
      };
      reader.readAsDataURL(file);
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawUrl = event.target?.result as string;
      if (!rawUrl) return;

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL(file.type || 'image/jpeg', 0.85);
        postRequestId.current = null;
        setMediaUrl(dataUrl);
        setMediaType('image');
      };
      img.onerror = () => {
        postRequestId.current = null;
        setMediaUrl(rawUrl);
        setMediaType('image');
      };
      img.src = rawUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handlePickRandomSpaceImage = () => {
    const randomIdx = Math.floor(Math.random() * SPACE_IMAGES.length);
    postRequestId.current = null;
    setMediaUrl(SPACE_IMAGES[randomIdx].url);
    setMediaType('image');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isPosting) return;

    setIsPosting(true);
    setSubmitError(null);
    try {
      const isVideo =
        mediaType === 'video' ||
        /\.(mp4|webm|ogg|mov)($|\?)/i.test(mediaUrl) ||
        mediaUrl.includes('Video%20Project%201.mp4') ||
        mediaUrl.includes('Video Project 1.mp4');

      if (postCategory === 'image' && (!mediaUrl || isVideo)) {
        throw new Error('Image posts need an image attachment.');
      }
      if ((postCategory === 'singing' || postCategory === 'dancing') &&
        (!performanceTitle.trim() || !mediaUrl || !isVideo || content.trim().length < 20)) {
        throw new Error('Performances need a title, at least 20 characters of description, and video media.');
      }
      if (postCategory === 'theory' && content.trim().length < 280) {
        throw new Error('Theory and discussion posts need at least 280 characters.');
      }

      postRequestId.current ||= generateId();
      await createPost(
        content,
        mediaUrl || undefined,
        mediaUrl ? (isVideo ? 'video' : 'image') : undefined,
        [selectedTag],
        postCategory,
        performanceTitle.trim() || undefined,
        postRequestId.current
      );
      setContent('');
      setMediaUrl('');
      setMediaType('image');
      setPostCategory('text');
      setPerformanceTitle('');
      postRequestId.current = null;
      setShowMediaInput(false);
      onSuccess?.();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Post could not be saved.');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div id="post-composer" className="bg-surface-container-lowest rounded-2xl border border-cyan-500/30 p-5 sm:p-6 lg:p-7 shadow-[0_4px_25px_rgba(0,240,255,0.12)] transition-all hover:border-cyan-400/60 hover:shadow-[0_4px_30px_rgba(0,240,255,0.22)] mb-6">
      {/* Hidden File Input for Uploading Photos or Videos from Computer */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*,video/mp4,video/webm"
        className="hidden"
      />

      <div className="flex gap-3 items-start">
        <Avatar src={currentUser.avatar} name={currentUser.name} status="online" showStatus size="md" />

        <div className="flex-1 min-w-0">
          {submitError && (
            <p role="alert" className="mb-2 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
              {submitError}
            </p>
          )}
          <textarea
            id="post-composer-textarea"
            value={content}
            onChange={(e) => {
              if (e.target.value !== content) postRequestId.current = null;
              setContent(e.target.value);
            }}
            placeholder="Share an interplanetary update, release note, or space photo..."
            rows={3}
            className="w-full bg-[#060c24]/80 rounded-xl p-3 text-sm text-on-surface placeholder:text-slate-400 border border-cyan-500/30 focus:border-cyan-400 focus:bg-[#081030] focus:ring-2 focus:ring-cyan-400/30 focus:shadow-[0_0_15px_rgba(0,240,255,0.25)] transition-all outline-none resize-none"
          />
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <label className="text-xs font-semibold text-on-surface-variant">
              Post type
              <select
                value={postCategory}
                onChange={(event) => {
                  postRequestId.current = null;
                  setPostCategory(event.target.value as NonNullable<Post['category']>);
                }}
                className="mt-1 block w-full rounded-lg border border-outline-variant/50 bg-surface-container px-3 py-2 text-sm text-on-surface"
              >
                <option value="text">Text post (100 points)</option>
                <option value="image">Image post (200 points)</option>
                <option value="theory">Substantial theory/discussion (300 points)</option>
                <option value="singing">Cosmic Singer performance (500 points)</option>
                <option value="dancing">Cosmic Dancer performance (500 points)</option>
              </select>
            </label>
            {(postCategory === 'singing' || postCategory === 'dancing') && (
              <label className="text-xs font-semibold text-on-surface-variant">
                Performance title
                <input
                  value={performanceTitle}
                  onChange={(event) => {
                    postRequestId.current = null;
                    setPerformanceTitle(event.target.value);
                  }}
                  maxLength={120}
                  required
                  className="mt-1 block w-full rounded-lg border border-outline-variant/50 bg-surface-container px-3 py-2 text-sm text-on-surface"
                  placeholder="Name your performance"
                />
              </label>
            )}
          </div>
          {(postCategory === 'singing' || postCategory === 'dancing') && (
            <p className="mt-2 text-[11px] text-on-surface-variant">
              Add a video and a description of at least 20 characters. House and engagement points are verified by the server.
            </p>
          )}

          {/* 100 Space Pictures Media Drawer */}
          {showMediaInput && (
            <div className="mt-3 p-3.5 bg-surface-container-low rounded-xl border border-outline-variant/40 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-on-surface flex items-center gap-1.5">
                  <Grid className="w-3.5 h-3.5 text-primary" />
                  100 Space Pictures Gallery & Image URL
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setShowMediaInput(false);
                  }}
                  className="text-on-surface-variant hover:text-error"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Upload & Paste URL Controls */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary-hover flex items-center gap-1.5 shrink-0 shadow-xs transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload from Desktop
                </button>
                <button
                  type="button"
                  onClick={() => {
                    postRequestId.current = null;
                    setMediaUrl('/Video Project 1.mp4');
                    setMediaType('video');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-400/40 text-xs font-semibold hover:border-cyan-300 flex items-center gap-1.5 shrink-0 transition-all shadow-[0_0_10px_rgba(0,240,255,0.15)]"
                >
                  <Video className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  Attach Public Video Message
                </button>
                <button
                  type="button"
                  onClick={handlePickRandomSpaceImage}
                  className="px-3 py-1.5 rounded-lg bg-primary-fixed text-primary text-xs font-semibold hover:bg-primary-fixed/80 flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  Random Space Pic
                </button>
                <input
                  type="url"
                  value={mediaUrl.startsWith('data:') ? '' : mediaUrl}
                  onChange={(e) => {
                    postRequestId.current = null;
                    setMediaUrl(e.target.value);
                    setMediaType('image');
                  }}
                  placeholder="Or paste custom image URL (https://...)"
                  className="flex-1 min-w-[200px] bg-surface-bright rounded-lg px-3 py-1.5 text-xs text-on-surface border border-outline-variant/60 focus:border-primary outline-none"
                />
              </div>

              {/* Categories & Search */}
              <div className="space-y-2 pt-1 border-t border-outline-variant/30">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar py-1">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`text-[11px] px-2.5 py-1 rounded-md shrink-0 transition-colors ${
                          selectedCategory === cat
                            ? 'bg-primary text-on-primary font-semibold'
                            : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full sm:w-44">
                    <Search className="w-3 h-3 text-on-surface-variant absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search 100 space pics..."
                      className="w-full pl-7 pr-2 py-1 text-[11px] bg-surface-bright rounded-lg border border-outline-variant/50 focus:border-primary outline-none"
                    />
                  </div>
                </div>

                {/* 100 Space Pictures Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2 max-h-48 overflow-y-auto custom-scrollbar p-1 bg-surface-bright/50 rounded-lg border border-outline-variant/30">
                  {filteredSpaceImages.map((img) => {
                    const isSelected = mediaUrl === img.url;
                    return (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => {
                          postRequestId.current = null;
                          setMediaUrl(img.url);
                          setMediaType('image');
                        }}
                        className={`group relative rounded-lg overflow-hidden border aspect-video transition-all ${
                          isSelected
                            ? 'border-primary ring-2 ring-primary/40 scale-95'
                            : 'border-outline-variant/40 hover:border-primary hover:scale-[1.03]'
                        }`}
                        title={`${img.title} (${img.category})`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.url} alt={img.title} className="w-full h-full object-cover" loading="lazy" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1">
                          <span className="text-[9px] font-medium text-white truncate w-full leading-tight">
                            #{img.id} {img.title}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="absolute top-1 right-1 bg-primary text-on-primary rounded-full p-0.5 shadow-xs">
                            <Lock className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-on-surface-variant/70 text-right">
                  Showing {filteredSpaceImages.length} of {SPACE_IMAGES.length} interesting space pictures
                </p>
              </div>
            </div>
          )}

          {/* Media Preview with Locked Indicator */}
          {mediaUrl && (() => {
            const isVideoPreview =
              mediaType === 'video' ||
              /\.(mp4|webm|ogg|mov)($|\?)/i.test(mediaUrl) ||
              mediaUrl.includes('Video%20Project%201.mp4') ||
              mediaUrl.includes('Video Project 1.mp4');

            return (
              <div className="mt-3 relative rounded-xl overflow-hidden max-h-56 border border-outline-variant/40 group bg-black">
                {isVideoPreview ? (
                  <video src={mediaUrl} controls className="w-full max-h-56 object-contain bg-black" />
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={mediaUrl} alt="Attached preview" className="w-full h-full object-cover" />
                )}
                <div className="absolute top-2 left-2 px-2.5 py-1 rounded-md bg-black/75 text-emerald-300 text-[11px] font-medium flex items-center gap-1 backdrop-blur-xs border border-emerald-500/30 shadow-xs pointer-events-none">
                  {isVideoPreview ? (
                    <>
                      <Video className="w-3 h-3 text-cyan-400 animate-pulse" />
                      <span>Video Ready & Synced</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3 text-emerald-400" />
                      <span>Photo Ready & Locked</span>
                    </>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    postRequestId.current = null;
                    setMediaUrl('');
                  }}
                  className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black transition-colors z-10"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })()}

          {/* Controls Bar */}
          <div className="mt-3 pt-3 border-t border-outline-variant/30 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
                title="Upload photo from computer"
              >
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>Upload Photo</span>
              </button>

              <button
                type="button"
                onClick={() => setShowMediaInput(!showMediaInput)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-fuchsia-300 hover:text-fuchsia-200 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 border border-fuchsia-500/25 transition-all shadow-[0_0_10px_rgba(217,70,239,0.15)]"
              >
                <ImageIcon className="w-4 h-4 text-fuchsia-400" />
                <span className="hidden sm:inline">100 Space Gallery</span>
              </button>

              <div className="relative">
                <select
                  value={selectedTag}
                  onChange={(e) => {
                    postRequestId.current = null;
                    setSelectedTag(e.target.value);
                  }}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-cyan-200 bg-[#070e28] hover:bg-[#0a1438] border border-cyan-500/30 outline-none transition-colors"
                >
                  {availableTags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!content.trim() || isPosting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-fuchsia-500 hover:shadow-[0_0_20px_rgba(0,240,255,0.5)] disabled:opacity-40 text-white text-xs font-bold shadow-md transition-all active:scale-95"
            >
              <Lock className="w-3.5 h-3.5 text-white/80" />
              <Send className="w-3.5 h-3.5 text-white" />
              <span>{isPosting ? 'Locking & Publishing...' : 'Publish & Lock'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
