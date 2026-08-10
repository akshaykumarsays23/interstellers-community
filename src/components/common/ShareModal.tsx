'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { INTERSTELLERS_LOGO } from '@/lib/data';
import {
  Share2,
  Copy,
  Check,
  X,
  Sparkles,
  Globe,
  Wifi,
  Send,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export const ShareModal: React.FC = () => {
  const { isShareModalOpen, setIsShareModalOpen } = useApp();
  const [copiedLive, setCopiedLive] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [copiedNetwork, setCopiedNetwork] = useState(false);

  if (!isShareModalOpen) return null;

  const liveGlobalUrl = 'https://akshayweb.loca.lt';
  const officialDomain = 'https://www.akshayweb.com';
  const networkLink = 'http://192.168.29.34:3000';
  const shareText = `Join me on Interstellers! "Time is never coming back, remember time is never..." Register with your Gmail here: ${liveGlobalUrl}`;

  const copyToClipboard = (text: string, type: 'live' | 'domain' | 'network') => {
    navigator.clipboard.writeText(text);
    if (type === 'live') {
      setCopiedLive(true);
      setTimeout(() => setCopiedLive(false), 2500);
    } else if (type === 'domain') {
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
    } else {
      setCopiedNetwork(true);
      setTimeout(() => setCopiedNetwork(false), 2500);
    }
  };

  const openShare = (platform: 'whatsapp' | 'telegram' | 'twitter' | 'mail') => {
    let url = '';
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(liveGlobalUrl);

    switch (platform) {
      case 'whatsapp':
        url = `https://api.whatsapp.com/send?text=${encodedText}`;
        break;
      case 'telegram':
        url = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodedText}`;
        break;
      case 'mail':
        url = `mailto:?subject=Join%20Interstellers%20Community&body=${encodedText}`;
        break;
    }
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary text-on-primary shadow-xs">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-on-surface">
                Share Interstellers with Friends
              </h3>
              <p className="text-xs text-on-surface-variant">
                Invite friends and members to join your galaxy network
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsShareModalOpen(false)}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quote Banner */}
        <div className="p-3.5 bg-gradient-to-r from-primary/10 via-primary-fixed/20 to-social-blue/10 rounded-xl border border-primary/20 space-y-1">
          <p className="text-xs font-semibold text-primary italic">
            &ldquo;Time is never coming back, remember time is never...&rdquo;
          </p>
          <p className="text-[11px] text-on-surface-variant">
            Send this link to friends so they can register using their Gmail account.
          </p>
        </div>

        {/* Link 1: LIVE GLOBAL INTERNET LINK (Active Worldwide) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-on-surface flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-primary" />
              <span>Live Public Internet Link (Worldwide Access)</span>
            </label>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/20">
              Active Now
            </span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={liveGlobalUrl}
              className="flex-1 bg-surface-container rounded-xl px-3.5 py-2 text-xs font-mono text-primary font-bold border border-primary/30 select-all outline-none"
            />
            <button
              onClick={() => copyToClipboard(liveGlobalUrl, 'live')}
              className="px-4 py-2 bg-primary hover:bg-primary-hover text-on-primary text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
            >
              {copiedLive ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLive ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
          <p className="text-[10px] text-on-surface-variant">
            Password if prompted: <code className="font-mono bg-surface-container px-1.5 py-0.5 rounded text-primary font-bold">49.43.232.229</code>
          </p>
        </div>

        {/* Link 2: Wi-Fi Link */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-on-surface flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5 text-social-blue" />
            <span>Local Wi-Fi Network Link</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={networkLink}
              className="flex-1 bg-surface-container rounded-xl px-3.5 py-2 text-xs font-mono text-on-surface border border-outline-variant/40 select-all outline-none"
            />
            <button
              onClick={() => copyToClipboard(networkLink, 'network')}
              className="px-4 py-2 bg-surface-container-high hover:bg-surface-variant text-on-surface text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors border border-outline-variant/40"
            >
              {copiedNetwork ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
              <span>{copiedNetwork ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Quick Social Share Buttons */}
        <div className="space-y-2 pt-2 border-t border-outline-variant/40">
          <span className="text-xs font-semibold text-on-surface-variant block">
            Share Directly to Friends:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => openShare('whatsapp')}
              className="py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-emerald-500/20 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={() => openShare('telegram')}
              className="py-2 px-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-700 dark:text-sky-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-sky-500/20 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Telegram</span>
            </button>
            <button
              onClick={() => openShare('twitter')}
              className="py-2 px-3 rounded-xl bg-slate-500/10 hover:bg-slate-500/20 text-on-surface text-xs font-semibold flex items-center justify-center gap-1.5 border border-outline-variant/40 transition-colors"
            >
              <span>X (Twitter)</span>
            </button>
            <button
              onClick={() => openShare('mail')}
              className="py-2 px-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold flex items-center justify-center gap-1.5 border border-primary/20 transition-colors"
            >
              <span>Email</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
