'use client';

import React, { useState, useRef } from 'react';
import { useApp } from '@/lib/store';
import { Avatar } from '@/components/common/Avatar';
import {
  User,
  Bell,
  Lock,
  Palette,
  Check,
  Camera,
  Upload,
  Shield,
  Sparkles,
  Volume2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileImage,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const SettingsView: React.FC = () => {
  const { currentUser, settings, updateSettings, updateProfile } = useApp();

  const [name, setName] = useState(currentUser.name);
  const [bio, setBio] = useState(currentUser.bio);
  const [role, setRole] = useState(currentUser.role);
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser.avatar);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Curated formal, legal passport-style studio headshots
  const formalPassportOptions = [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop', // Male formal suit headshot
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop', // Female formal executive headshot
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop', // Male studio headshot
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop', // Female studio portrait
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop', // Corporate formal headshot
  ];

  // Handle uploading real image file from local computer/device
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError(null);
    setUploadSuccess(null);

    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size exceeds 5MB. Please choose a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setSelectedAvatar(result);
        setUploadSuccess('Passport photo loaded from file. Click "Save Changes" to update your profile.');
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to read file from disk. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      bio,
      role,
      avatar: selectedAvatar,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <header className="mb-6">
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-on-surface mb-1">
          Settings & Profile Management
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant">
          Manage your verified interstellar identity, legal photo verification, and preferences.
        </p>
      </header>

      {/* Profile Information Section */}
      <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 p-6 shadow-card space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-outline-variant/40">
          <div className="p-1.5 rounded-lg bg-primary text-on-primary">
            <User className="w-4 h-4" />
          </div>
          <h2 className="font-heading font-semibold text-base text-on-surface">
            Legal Profile & Identification
          </h2>
        </div>

        {/* Legal Passport Photo Guidelines Notice */}
        <div className="p-4 bg-gradient-to-r from-primary/10 via-social-blue/10 to-transparent rounded-2xl border border-primary/25 space-y-3">
          <div className="flex items-center gap-2 text-primary font-bold text-xs sm:text-sm">
            <Shield className="w-4 h-4 text-social-blue" />
            <span>Official Photo Policy: Legal Passport Photos Only</span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Interstellers is a verified professional network. All profile pictures must be standard **formal passport-style headshots**. Selfies, casual mirror photos, filters, and group pictures are strictly prohibited.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Formal front-facing headshot (plain/neutral background)</span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-300">
              <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>No selfies, sunglasses, hats, or casual filters</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleProfileSave} className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Avatar Uploader & Selector */}
            <div className="flex flex-col items-center gap-3 shrink-0 mx-auto sm:mx-0">
              <div className="relative group">
                <Avatar
                  src={selectedAvatar}
                  name={name}
                  size="2xl"
                  className="ring-4 ring-primary/30 shadow-lg object-cover"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-primary hover:bg-primary-hover text-on-primary w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95"
                  title="Upload passport photo from your computer/device"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Upload Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary text-xs font-semibold border border-outline-variant/60 transition-colors shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload from Files</span>
              </button>

              {/* Preset Formal Studio Headshots */}
              <div className="text-center pt-2">
                <span className="text-[11px] text-on-surface-variant font-medium block mb-1.5">
                  Or select legal preset:
                </span>
                <div className="flex gap-2 justify-center flex-wrap max-w-[180px]">
                  {formalPassportOptions.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedAvatar(opt);
                        setUploadSuccess('Formal preset selected.');
                      }}
                      className={cn(
                        'w-8 h-8 rounded-full overflow-hidden border-2 transition-all shadow-xs',
                        selectedAvatar === opt ? 'border-primary scale-110 ring-2 ring-primary/40' : 'border-outline-variant opacity-70 hover:opacity-100'
                      )}
                      title={`Formal headshot preset ${idx + 1}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={opt} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Form Inputs */}
            <div className="flex-1 w-full space-y-4">
              {uploadError && (
                <div className="p-3 bg-error-container text-on-error-container rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadSuccess && (
                <div className="p-3 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{uploadSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                    Official Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-surface-container rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-on-surface border border-outline-variant/40 focus:border-primary outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                    Account Handle
                  </label>
                  <input
                    type="text"
                    disabled
                    value={`@${currentUser.handle}`}
                    className="w-full bg-surface-container-high/60 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-on-surface-variant border border-outline-variant/40 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                    Professional Role / Title
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-surface-container rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-on-surface border border-outline-variant/40 focus:border-primary outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                    Registered Gmail
                  </label>
                  <input
                    type="email"
                    disabled
                    value={settings.email}
                    className="w-full bg-surface-container-high/60 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-on-surface-variant border border-outline-variant/40 cursor-not-allowed font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                  Professional Bio & Motto
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share your background and interstellar goals..."
                  className="w-full bg-surface-container rounded-xl p-3 text-xs sm:text-sm text-on-surface border border-outline-variant/40 focus:border-primary outline-none transition-colors custom-scrollbar"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                {savedSuccess ? (
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5 animate-in fade-in">
                    <Check className="w-4 h-4" />
                    <span>Profile & Passport Photo updated successfully!</span>
                  </span>
                ) : <div />}

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-on-primary text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </section>

      {/* Preferences & Appearance */}
      <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 p-6 shadow-card space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-outline-variant/40">
          <div className="p-1.5 rounded-lg bg-social-blue/20 text-social-blue">
            <Palette className="w-4 h-4" />
          </div>
          <h2 className="font-heading font-semibold text-base text-on-surface">
            Theme & Appearance
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => updateSettings({ theme: 'light' })}
            className={cn(
              'p-4 rounded-xl border text-left flex items-center justify-between transition-all',
              settings.theme === 'light'
                ? 'border-primary bg-primary-fixed/20 shadow-xs'
                : 'border-outline-variant/40 hover:bg-surface-container'
            )}
          >
            <div>
              <p className="font-semibold text-xs text-on-surface">Light Theme</p>
              <p className="text-[11px] text-on-surface-variant">Clean and bright daylight mode</p>
            </div>
            {settings.theme === 'light' && <Check className="w-4 h-4 text-primary" />}
          </button>

          <button
            type="button"
            onClick={() => updateSettings({ theme: 'dark' })}
            className={cn(
              'p-4 rounded-xl border text-left flex items-center justify-between transition-all',
              settings.theme === 'dark'
                ? 'border-primary bg-primary-fixed/20 shadow-xs'
                : 'border-outline-variant/40 hover:bg-surface-container'
            )}
          >
            <div>
              <p className="font-semibold text-xs text-on-surface">Dark Cosmic</p>
              <p className="text-[11px] text-on-surface-variant">Deep space dark aesthetic</p>
            </div>
            {settings.theme === 'dark' && <Check className="w-4 h-4 text-primary" />}
          </button>
        </div>
      </section>
    </div>
  );
};
