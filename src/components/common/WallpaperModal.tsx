'use client';

import React, { useState, useRef } from 'react';
import { Palette, X, Upload, Check, Image as ImageIcon, RotateCcw, Sparkles } from 'lucide-react';

export const CHAT_WALLPAPER_PRESETS = [
  { id: 'wp_1', name: 'Earth at Night', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200' },
  { id: 'wp_2', name: 'Milky Way Galaxy', url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1200' },
  { id: 'wp_3', name: 'Deep Violet Nebula', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200' },
  { id: 'wp_4', name: 'Cyberpunk Neon', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200' },
  { id: 'wp_5', name: 'Aurora Borealis', url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=1200' },
  { id: 'wp_6', name: 'Starry Deep Space', url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1200' },
  { id: 'wp_7', name: 'Obsidian Glass', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200' },
  { id: 'wp_8', name: 'Solar Eclipse', url: 'https://images.unsplash.com/photo-1532693322450-2cb5c511067d?q=80&w=1200' },
  { id: 'wp_9', name: 'Abstract Cosmic Fluid', url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1200' },
  { id: 'wp_10', name: 'Futuristic Geometry', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200' },
  { id: 'wp_11', name: 'Supernova Flare', url: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1200' },
  { id: 'wp_12', name: 'Dark Mountain Night', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200' },
  { id: 'wp_13', name: 'Deep Ocean Abyss', url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=1200' },
  { id: 'wp_14', name: 'Emerald Matrix Dust', url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=1200' },
  { id: 'wp_15', name: 'Midnight Purple Cloud', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200' },
  { id: 'wp_16', name: 'Golden Horizon Galaxy', url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=1200' },
  { id: 'wp_17', name: 'Space Station Window', url: 'https://images.unsplash.com/photo-1447433589675-4aaa569f3e05?q=80&w=1200' },
  { id: 'wp_18', name: 'Soft Cosmic Glow', url: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?q=80&w=1200' },
  { id: 'wp_19', name: 'Crystal Prism', url: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?q=80&w=1200' },
  { id: 'wp_20', name: 'Electric Indigo Gradient', url: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1200' },
];

interface WallpaperModalProps {
  isOpen: boolean;
  currentWallpaper: string;
  onSelectWallpaper: (url: string) => void;
  onClose: () => void;
}

export const WallpaperModal: React.FC<WallpaperModalProps> = ({
  isOpen,
  currentWallpaper,
  onSelectWallpaper,
  onClose,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setUploadError('Image size must be smaller than 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onSelectWallpaper(dataUrl);
        setUploadError('');
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-surface-container-lowest border border-outline-variant/60 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-outline-variant/60 flex items-center justify-between bg-surface-bright">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-base sm:text-lg text-on-surface">
                Chat Background & Wallpapers
              </h2>
              <p className="text-xs text-on-surface-variant">
                Choose from 20 cosmic presets or upload a custom image from your device
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-on-surface-variant hover:text-error hover:bg-surface-container transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
          {/* Custom Upload Section */}
          <div className="bg-surface-container-low border border-dashed border-primary/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary text-on-primary">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-on-surface">Upload Custom Photo</h3>
                <p className="text-xs text-on-surface-variant">
                  Select any wallpaper from your computer or phone files
                </p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary-hover text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Upload from Files</span>
              </button>

              {currentWallpaper && (
                <button
                  onClick={() => onSelectWallpaper('')}
                  className="px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant text-xs font-semibold transition-colors flex items-center gap-1"
                  title="Reset to Default Dark"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {uploadError && <p className="text-xs text-error font-medium">{uploadError}</p>}

          {/* 20 Preset Wallpapers Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading font-semibold text-sm text-on-surface flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>20 Curated Cosmic Wallpapers</span>
              </h3>
              <span className="text-xs text-on-surface-variant">Click to select</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {CHAT_WALLPAPER_PRESETS.map((preset) => {
                const isSelected = currentWallpaper === preset.url;
                return (
                  <div
                    key={preset.id}
                    onClick={() => onSelectWallpaper(preset.url)}
                    className={`group relative rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer border-2 transition-all shadow-xs ${
                      isSelected
                        ? 'border-primary ring-2 ring-primary/40 scale-[1.03]'
                        : 'border-transparent hover:border-primary/50 hover:scale-[1.02]'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                    <span className="absolute bottom-2 left-2 right-2 text-[10px] font-semibold text-white truncate drop-shadow-md">
                      {preset.name}
                    </span>

                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-outline-variant/60 bg-surface-bright flex items-center justify-between text-xs text-on-surface-variant">
          <span>Wallpaper changes update live for your chat window</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-primary text-on-primary font-semibold text-xs shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
