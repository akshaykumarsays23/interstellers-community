'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { Avatar } from '@/components/common/Avatar';
import { Image as ImageIcon, Sparkles, Send, Tag, Smile, X } from 'lucide-react';

interface PostComposerProps {
  onSuccess?: () => void;
}

export const PostComposer: React.FC<PostComposerProps> = ({ onSuccess }) => {
  const { currentUser, createPost } = useApp();
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [selectedTag, setSelectedTag] = useState('#CommunityUpdate');
  const [isPosting, setIsPosting] = useState(false);

  const availableTags = ['#CommunityUpdate', '#Productivity', '#AI', '#DesignSystem', '#CoreEngineering', '#CosmicHub'];

  const sampleImages = [
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsPosting(true);
    setTimeout(() => {
      createPost(content, mediaUrl || undefined, mediaUrl ? 'image' : undefined, [selectedTag]);
      setContent('');
      setMediaUrl('');
      setShowMediaInput(false);
      setIsPosting(false);
      onSuccess?.();
    }, 400);
  };

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 p-4 sm:p-5 shadow-card transition-shadow hover:shadow-card-hover mb-6">
      <div className="flex gap-3 items-start">
        <Avatar src={currentUser.avatar} name={currentUser.name} status="online" showStatus size="md" />

        <div className="flex-1 min-w-0">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share an interplanetary update, release note, or idea..."
            rows={3}
            className="w-full bg-surface-container-low/60 rounded-xl p-3 text-sm text-on-surface placeholder:text-on-surface-variant border border-outline-variant/30 focus:border-primary focus:bg-surface-bright focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
          />

          {/* Media URL Input Drawer */}
          {showMediaInput && (
            <div className="mt-3 p-3 bg-surface-container-low rounded-xl border border-outline-variant/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-on-surface">Attach Media URL</span>
                <button
                  type="button"
                  onClick={() => {
                    setShowMediaInput(false);
                    setMediaUrl('');
                  }}
                  className="text-on-surface-variant hover:text-error"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <input
                type="url"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="Paste image URL (e.g. https://...)"
                className="w-full bg-surface-bright rounded-lg px-3 py-1.5 text-xs text-on-surface border border-outline-variant/60 focus:border-primary outline-none"
              />
              <div className="flex items-center gap-2 pt-1 overflow-x-auto">
                <span className="text-[11px] text-on-surface-variant shrink-0">Quick presets:</span>
                {sampleImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setMediaUrl(img)}
                    className="text-[11px] px-2 py-0.5 rounded bg-surface-container hover:bg-primary-fixed hover:text-primary text-on-surface-variant shrink-0"
                  >
                    Image {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Media Preview */}
          {mediaUrl && (
            <div className="mt-3 relative rounded-xl overflow-hidden max-h-48 border border-outline-variant/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mediaUrl} alt="Attached preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setMediaUrl('')}
                className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Controls Bar */}
          <div className="mt-3 pt-3 border-t border-outline-variant/30 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setShowMediaInput(!showMediaInput)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
              >
                <ImageIcon className="w-4 h-4 text-social-blue" />
                <span className="hidden sm:inline">Photo</span>
              </button>

              <div className="relative">
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-on-surface-variant bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 outline-none transition-colors"
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
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-40 text-on-primary text-xs font-semibold shadow-xs transition-all active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isPosting ? 'Broadcasting...' : 'Publish'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
