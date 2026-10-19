'use client';

import React, { useState } from 'react';
import { Post } from '@/lib/types';
import { useApp } from '@/lib/store';
import { Avatar } from '@/components/common/Avatar';
import { Badge } from '@/components/common/Badge';
import { ImageModal } from '@/components/common/ImageModal';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Send,
  CheckCircle2,
  Sparkles,
  Lock,
  Maximize2,
  Edit3,
  Trash2,
  X,
  Upload,
  Save,
  ImageIcon,
  Video,
  Film
} from 'lucide-react';
import { cn, formatPostDate, formatMessageDate } from '@/lib/utils';

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const {
    toggleLikePost,
    toggleBookmarkPost,
    addCommentToPost,
    voteInPoll,
    currentUser,
    updatePost,
    deletePost
  } = useApp();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [copied, setCopied] = useState(false);
  const [postActionError, setPostActionError] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [localReactions, setLocalReactions] = useState<Record<string, number>>({
    '❤️': post.isLiked ? 1 : 0,
    '🚀': 0,
    '🔥': 0,
    '🌌': 0,
    '👾': 0,
    '✨': 0,
  });
  const [myReaction, setMyReaction] = useState<string | null>(post.isLiked ? '❤️' : null);

  // Edit Post State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [editMediaUrl, setEditMediaUrl] = useState(post.mediaUrl || '');
  const isPostOwner = post.author.id === currentUser.id;

  const handleOpenEditModal = () => {
    setEditContent(post.content);
    setEditMediaUrl(post.mediaUrl || '');
    setIsEditModalOpen(true);
    setIsMenuOpen(false);
  };

  const handleReact = (emoji: string) => {
    setLocalReactions((prev) => {
      const next = { ...prev };
      if (myReaction === emoji) {
        // Un-react
        next[emoji] = Math.max(0, (next[emoji] || 0) - 1);
        setMyReaction(null);
        if (emoji === '❤️' && post.isLiked) {
          toggleLikePost(post.id).catch((error) => setPostActionError(error.message));
        }
      } else {
        // Switch from old reaction
        if (myReaction) {
          next[myReaction] = Math.max(0, (next[myReaction] || 0) - 1);
          if (myReaction === '❤️' && post.isLiked) {
            toggleLikePost(post.id).catch((error) => setPostActionError(error.message));
          }
        }
        next[emoji] = (next[emoji] || 0) + 1;
        setMyReaction(emoji);
        if (emoji === '❤️' && !post.isLiked) {
          toggleLikePost(post.id).catch((error) => setPostActionError(error.message));
        }
      }
      return next;
    });
    setShowReactionPicker(false);
  };

  const handleSavePostEdit = async () => {
    try {
      await updatePost(post.id, editContent, editMediaUrl || null);
      setPostActionError(null);
      setIsEditModalOpen(false);
    } catch (error) {
      setPostActionError(error instanceof Error ? error.message : 'Post could not be updated.');
    }
  };

  const handleShare = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await addCommentToPost(post.id, newComment);
      setNewComment('');
      setPostActionError(null);
    } catch (error) {
      setPostActionError(error instanceof Error ? error.message : 'Comment could not be saved.');
    }
  };

  return (
    <article className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 p-5 sm:p-6 lg:p-7 shadow-card transition-all hover:shadow-card-hover mb-6">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar
            src={post.author.avatar}
            name={post.author.name}
            status={post.author.status}
            showStatus
            size="md"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-heading font-semibold text-sm text-on-surface hover:text-primary transition-colors cursor-pointer">
                {post.author.name}
              </h3>
              {post.author.isVerified && (
                <CheckCircle2 className="w-3.5 h-3.5 text-social-blue fill-social-blue/20" />
              )}
            </div>
            <p className="text-xs text-on-surface-variant flex items-center gap-1.5">
              <span>{post.author.role || `@${post.author.handle}`}</span>
              <span>•</span>
              <span>{formatPostDate(post.createdAt, post.timestamp)}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                <Lock className="w-2.5 h-2.5 text-emerald-500" />
                Locked
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 relative">
          {post.tags && post.tags.length > 0 && (
            <Badge variant="cosmic" size="sm" className="hidden sm:inline-flex">
              {post.tags[0]}
            </Badge>
          )}

          {isPostOwner && <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors"
              title="Post actions"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-8 z-30 w-52 bg-surface-container-lowest border border-outline-variant/60 rounded-xl shadow-xl p-1.5 space-y-1 animate-in fade-in duration-150">
                <button
                  onClick={handleOpenEditModal}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-container hover:text-primary rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Edit3 className="w-4 h-4 text-primary" />
                  <span>Edit Post</span>
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    deletePost(post.id).catch((error) => setPostActionError(error.message));
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-error hover:bg-error/10 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Post</span>
                </button>
              </div>
            )}
          </div>}
        </div>
      </div>

      {postActionError && (
        <p role="alert" className="mb-3 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
          {postActionError}
        </p>
      )}

      {/* Post Body Content */}
      <div className="text-sm sm:text-base text-on-surface leading-relaxed space-y-3 mb-4">
        <p className="whitespace-pre-line">{post.content}</p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {post.tags.map((tag, idx) => (
              <span key={idx} className="text-xs text-primary font-medium hover:underline cursor-pointer">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Embedded Media */}
        {post.mediaUrl && (() => {
          const isVideo =
            post.mediaType === 'video' ||
            /\.(mp4|webm|ogg|mov)($|\?)/i.test(post.mediaUrl) ||
            post.mediaUrl.includes('Video%20Project%201.mp4') ||
            post.mediaUrl.includes('Video Project 1.mp4');

          if (isVideo) {
            return (
              <div className="relative rounded-2xl overflow-hidden border border-cyan-500/40 bg-black shadow-[0_0_30px_rgba(0,240,255,0.18)] mt-3">
                <div className="absolute top-2.5 left-3 z-10 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-cyan-400/50 text-[10px] font-mono font-bold text-cyan-300 flex items-center gap-1.5 shadow-md pointer-events-none">
                  <Video className="w-3 h-3 text-cyan-400 animate-pulse" />
                  <span>Public Video Message</span>
                </div>
                <video
                  src={post.mediaUrl}
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full max-h-[520px] rounded-2xl object-contain bg-black"
                >
                  <source src={post.mediaUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            );
          }

          return (
            <>
              <div
                onClick={() => setIsImageModalOpen(true)}
                className="relative rounded-xl overflow-hidden border border-outline-variant/40 max-h-[520px] shadow-xs mt-2 group cursor-zoom-in"
                title="Click to open full-screen zoomable view"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.mediaUrl}
                  alt="Post attachment"
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/75 text-emerald-300 text-[10px] font-medium flex items-center gap-1 backdrop-blur-xs border border-emerald-500/30 z-10">
                  <Lock className="w-2.5 h-2.5 text-emerald-400" />
                  <span>Locked Photo</span>
                </div>
                <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <span className="px-3.5 py-1.5 rounded-full bg-black/80 text-white text-xs font-semibold backdrop-blur-md border border-white/20 flex items-center gap-1.5 shadow-xl">
                    <Maximize2 className="w-4 h-4 text-emerald-400" />
                    Click to Expand & Zoom
                  </span>
                </div>
              </div>

              <ImageModal
                isOpen={isImageModalOpen}
                src={post.mediaUrl}
                alt={post.content || 'Post image'}
                authorName={post.author.name}
                onClose={() => setIsImageModalOpen(false)}
              />
            </>
          );
        })()}

        {/* Interactive Poll Component */}
        {post.poll && (
          <div className="bg-surface-container rounded-xl p-4 border border-outline-variant/40 space-y-2.5 mt-3">
            <p className="font-semibold text-xs text-on-surface flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              {post.poll.question}
            </p>
            <div className="space-y-2">
              {post.poll.options.map((option) => {
                const percentage =
                  post.poll!.totalVotes > 0
                    ? Math.round((option.votes / post.poll!.totalVotes) * 100)
                    : 0;
                const isSelected = post.poll!.userVotedOptionId === option.id;

                return (
                  <button
                    key={option.id}
                    onClick={() => voteInPoll(post.id, option.id).catch((error) => setPostActionError(error.message))}
                    className={cn(
                      'relative w-full p-2.5 rounded-lg border text-left text-xs transition-all overflow-hidden flex items-center justify-between',
                      isSelected
                        ? 'border-primary bg-primary/10 font-bold text-primary'
                        : 'border-outline-variant/50 hover:bg-surface-container-high text-on-surface'
                    )}
                  >
                    {/* Progress Bar Background */}
                    <div
                      className={cn(
                        'absolute top-0 bottom-0 left-0 transition-all duration-500 opacity-20',
                        isSelected ? 'bg-primary' : 'bg-on-surface-variant'
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                    <span className="relative z-10 flex items-center gap-2">
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-primary" />}
                      {option.text}
                    </span>
                    <span className="relative z-10 font-mono text-[11px] text-on-surface-variant">
                      {percentage}% ({option.votes})
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-on-surface-variant/70 text-right">
              {post.poll.totalVotes} total votes
            </p>
          </div>
        )}
      </div>

      {/* Post Actions Bar */}
      <div className="pt-3 border-t border-outline-variant/40 space-y-2 text-xs text-on-surface-variant">
        {/* Active reaction summary chips */}
        {Object.entries(localReactions).some(([, v]) => v > 0) && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {Object.entries(localReactions)
              .filter(([, count]) => count > 0)
              .map(([emoji, count]) => (
                <button
                  key={emoji}
                  onClick={() => handleReact(emoji)}
                  className={cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all border',
                    myReaction === emoji
                      ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300 shadow-[0_0_8px_rgba(0,240,255,0.25)]'
                      : 'bg-surface-container border-outline-variant/30 hover:bg-surface-container-high',
                  )}
                >
                  <span>{emoji}</span>
                  <span className="font-semibold">{count}</span>
                </button>
              ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Emoji Reaction Picker */}
            <div className="relative">
              <button
                onClick={() => setShowReactionPicker((v) => !v)}
                onBlur={() => setTimeout(() => setShowReactionPicker(false), 150)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all select-none',
                  myReaction
                    ? 'text-pink-400 bg-pink-500/20 font-bold border border-pink-500/40 shadow-[0_0_12px_rgba(244,63,94,0.35)]'
                    : 'hover:bg-pink-500/10 hover:text-pink-300',
                )}
                aria-label="React to post"
              >
                <span className="text-base leading-none">{myReaction || '❤️'}</span>
                <span>{post.likes + Object.values(localReactions).reduce((a, b) => a + b, 0)}</span>
              </button>

              {showReactionPicker && (
                <div className="absolute bottom-full left-0 mb-2 z-30 flex items-center gap-1 p-2 bg-surface-container-lowest border border-cyan-500/30 rounded-2xl shadow-xl backdrop-blur-md animate-reaction-pop">
                  {['❤️', '🚀', '🔥', '🌌', '👾', '✨'].map((emoji) => (
                    <button
                      key={emoji}
                      onMouseDown={() => handleReact(emoji)}
                      className={cn(
                        'w-9 h-9 rounded-xl text-xl flex items-center justify-center transition-all hover:scale-125 hover:bg-surface-container',
                        myReaction === emoji && 'bg-cyan-500/20 ring-2 ring-cyan-400/50 scale-110',
                      )}
                      aria-label={'React ' + emoji}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Comments Toggle */}
            <button
              onClick={() => setShowComments(!showComments)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all',
                showComments
                  ? 'text-cyan-300 bg-cyan-500/20 font-bold border border-cyan-400/40 shadow-[0_0_12px_rgba(0,240,255,0.35)]'
                  : 'hover:bg-cyan-500/10 hover:text-cyan-300'
              )}
            >
              <MessageCircle className="w-4 h-4 text-cyan-400" />
              <span>{post.commentsCount}</span>
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-purple-500/15 hover:text-purple-300 transition-colors"
            >
              <Share2 className="w-4 h-4 text-purple-400" />
              <span>{copied ? 'Copied link!' : post.sharesCount}</span>
            </button>

          </div>

          {/* Bookmark */}
          <button
            onClick={() => toggleBookmarkPost(post.id)}
            className={cn(
              'p-2 rounded-lg transition-all',
              post.isBookmarked
                ? 'text-amber-300 bg-amber-500/20 border border-amber-400/40 shadow-[0_0_12px_rgba(251,191,36,0.35)]'
                : 'hover:bg-amber-500/10 hover:text-amber-300'
            )}
            title="Save post"
          >
            <Bookmark className={cn('w-4 h-4', post.isBookmarked && 'fill-amber-400 text-amber-300 drop-shadow-[0_0_8px_#fbbf24]')} />
          </button>
        </div>
      </div>

      {/* Comments Drawer */}
      {showComments && (
        <div className="mt-3 pt-3 border-t border-outline-variant/30 space-y-3 animate-in fade-in duration-150">
          {/* New Comment Input */}
          <form onSubmit={handleCommentSubmit} className="flex gap-2 items-center">
            <Avatar src={currentUser.avatar} name={currentUser.name} size="xs" />
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 bg-surface-container rounded-full px-3.5 py-1.5 text-xs text-on-surface border border-outline-variant/40 focus:border-primary outline-none"
            />
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="p-1.5 rounded-full bg-primary text-on-primary disabled:opacity-40 hover:bg-primary-hover shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Comment List */}
          {post.comments && post.comments.length > 0 ? (
            <div className="space-y-2 pt-1 max-h-60 overflow-y-auto custom-scrollbar">
              {post.comments.map((comment) => (
                <div key={comment.id} className="flex gap-2.5 items-start text-xs">
                  <Avatar src={comment.author.avatar} name={comment.author.name} size="xs" />
                  <div className="flex-1 bg-surface-container-low rounded-xl p-2.5 border border-outline-variant/30">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-semibold text-on-surface">{comment.author.name}</span>
                      <span className="text-[10px] text-on-surface-variant">{formatMessageDate(comment.timestamp)}</span>
                    </div>
                    <p className="text-on-surface text-xs leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-center text-on-surface-variant py-2">
              No comments yet. Be the first to share your thoughts!
            </p>
          )}
        </div>
      )}

      {/* Edit Post & Add Music Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-surface-container-lowest border border-outline-variant/60 rounded-2xl shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
              <h3 className="font-heading font-bold text-base text-on-surface flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-primary" />
                <span>Edit Post & Add Music Vibe</span>
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface">Post Content:</label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={4}
                className="w-full bg-surface-bright rounded-xl p-3 text-sm text-on-surface border border-outline-variant/50 focus:border-primary outline-none"
              />
            </div>

            {/* Media URL Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface">Photo / Media URL:</label>
              <input
                type="text"
                value={editMediaUrl}
                onChange={(e) => setEditMediaUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-surface-bright rounded-lg px-3 py-2 text-xs text-on-surface border border-outline-variant/50 focus:border-primary outline-none"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant/30">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePostEdit}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-on-primary text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};
