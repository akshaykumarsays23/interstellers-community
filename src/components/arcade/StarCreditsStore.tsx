'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { ShoppingBag, Award, CheckCircle2, Sparkles, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export const StarCreditsStore: React.FC = () => {
  const { shopItems, gamificationState, purchaseCosmetic, equipCosmetic } = useApp();
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleBuy = (itemId: string) => {
    const res = purchaseCosmetic(itemId);
    if (res.success) {
      setFeedbackMsg({ type: 'success', text: '⭐ Item purchased successfully! You can equip it now.' });
    } else {
      setFeedbackMsg({ type: 'error', text: res.error || 'Failed to purchase' });
    }
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleEquip = (item: (typeof shopItems)[0]) => {
    let categoryKey: 'background' | 'frame' | 'nameEffect' | 'chatTheme' = 'background';
    if (item.type === 'background') categoryKey = 'background';
    if (item.type === 'frame') categoryKey = 'frame';
    if (item.type === 'name_effect') categoryKey = 'nameEffect';
    if (item.type === 'chat_theme') categoryKey = 'chatTheme';

    const isAlreadyEquipped = gamificationState.equippedCosmetics[categoryKey] === (item.cssClass || item.id);
    equipCosmetic(categoryKey, isAlreadyEquipped ? undefined : (item.cssClass || item.id));

    setFeedbackMsg({
      type: 'success',
      text: isAlreadyEquipped ? 'Item un-equipped.' : 'Item equipped to profile!',
    });
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-amber-950/40 via-surface-container to-cyan-950/40 border border-amber-500/30">
        <div>
          <h2 className="text-lg font-bold font-heading text-on-surface flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            ⭐ STAR CREDITS COSMETIC VAULT
          </h2>
          <p className="text-xs text-on-surface-variant">Spend your earned Star Credits on exclusive profile frames, backdrops & name effects</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black text-sm shrink-0">
          <Award className="w-5 h-5 text-amber-400 animate-pulse" />
          <span>{gamificationState.starCredits} ⭐ Credits</span>
        </div>
      </div>

      {feedbackMsg && (
        <div
          className={cn(
            'p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 border animate-fadeIn',
            feedbackMsg.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
              : 'bg-rose-950/80 border-rose-500 text-rose-300'
          )}
        >
          {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {shopItems.map((item) => {
          const isOwned = gamificationState.unlockedCosmetics.includes(item.id);

          let catKey: 'background' | 'frame' | 'nameEffect' | 'chatTheme' = 'background';
          if (item.type === 'background') catKey = 'background';
          if (item.type === 'frame') catKey = 'frame';
          if (item.type === 'name_effect') catKey = 'nameEffect';
          if (item.type === 'chat_theme') catKey = 'chatTheme';

          const isEquipped = gamificationState.equippedCosmetics[catKey] === (item.cssClass || item.id);

          return (
            <div
              key={item.id}
              className={cn(
                'p-5 rounded-3xl border transition-all flex flex-col justify-between gap-4 relative overflow-hidden bg-surface-container',
                isEquipped ? 'border-cyan-400 ring-2 ring-cyan-400/30 shadow-lg' : 'border-outline-variant/40 hover:border-amber-500/30'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-surface-container-high border border-white/10 flex items-center justify-center text-2xl shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-on-surface">{item.name}</h4>
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">{item.type}</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-on-surface-variant leading-relaxed">{item.description}</p>

              <div className="flex items-center justify-between pt-3 border-t border-outline-variant/30">
                <div className="text-sm font-black text-amber-400 flex items-center gap-1 font-mono">
                  {item.price} ⭐
                </div>

                {isOwned ? (
                  <button
                    onClick={() => handleEquip(item)}
                    className={cn(
                      'px-4 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5',
                      isEquipped
                        ? 'bg-cyan-500 text-black shadow-md'
                        : 'bg-surface-container-high hover:bg-surface-bright text-on-surface border border-outline-variant/50'
                    )}
                  >
                    {isEquipped ? <Check className="w-3.5 h-3.5" /> : null}
                    {isEquipped ? 'Equipped' : 'Equip Item'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleBuy(item.id)}
                    className="px-4 py-1.5 rounded-xl bg-amber-500 text-black font-extrabold text-xs hover:bg-amber-400 transition-all shadow-md"
                  >
                    Buy Item ⭐
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
