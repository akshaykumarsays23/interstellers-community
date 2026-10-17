'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/store';
import { INTERSTELLERS_LOGO } from '@/lib/data';
import { WELCOME_PAGE_IMAGES } from '@/lib/welcomeImages';
import {
  UserPlus,
  Info,
  Check,
  Sparkles,
  ArrowRight,
  Clock,
  RefreshCw,
  ShieldCheck,
  Mail,
  KeyRound,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';

export const AuthLandingView: React.FC = () => {
  const {
    login,
    sendVerificationCode,
    verifyLoginCode,
    pendingApprovalUser,
    setPendingApprovalUser,
    checkMyApprovalStatus,
  } = useApp();

  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [authStep, setAuthStep] = useState<'input' | 'code'>('input');
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'signin' | 'register'>('signin');
  const [authError, setAuthError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [otpToken, setOtpToken] = useState<string | null>(null);

  // Random welcome image — picked once on mount, client-side only (no SSR/hydration mismatch)
  const [welcomeImage, setWelcomeImage] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (WELCOME_PAGE_IMAGES.length === 0) return;

    const STORAGE_KEY = 'interstellers_last_welcome_img';
    const last = sessionStorage.getItem(STORAGE_KEY) ?? '';

    // Build candidate list excluding the last shown image (if more than one available)
    const candidates =
      WELCOME_PAGE_IMAGES.length > 1
        ? WELCOME_PAGE_IMAGES.filter((img) => img !== last)
        : WELCOME_PAGE_IMAGES;

    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    sessionStorage.setItem(STORAGE_KEY, chosen);
    setWelcomeImage(chosen);
  }, []);

  const handleOpenAuth = (type: 'signin' | 'register') => {
    setModalType(type);
    setAuthStep('input');
    setAuthError(null);
    setSuccessMessage(null);
    setNameInput('');
    setEmailInput('');
    setCodeInput('');
    setOtpToken(null);
    setShowModal(true);
  };

  // Step 1: Send 6-digit code to Gmail
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);
    setSuccessMessage(null);

    const cleanEmail = emailInput.trim().replace(/[\.\s]+$/, '');
    if (!cleanEmail) {
      setAuthError('Please enter a valid Gmail address');
      setIsLoading(false);
      return;
    }

    const cleanName = nameInput.trim() || cleanEmail.split('@')[0];
    const res = await sendVerificationCode(cleanEmail, cleanName, modalType);

    setIsLoading(false);
    if (!res.success) {
      setAuthError(res.error || 'Failed to send code');
    } else {
      setSuccessMessage(`A 6-digit login code has been sent to your Gmail (${cleanEmail})`);
      if (res.otpToken) {
        setOtpToken(res.otpToken);
      }
      if (res.code) {
        setCodeInput(res.code);
      }
      setAuthStep('code');
    }
  };

  // Step 2: Verify 6-digit code
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);

    const cleanEmail = emailInput.trim().replace(/[\.\s]+$/, '');
    const cleanName = nameInput.trim() || cleanEmail.split('@')[0];
    const cleanCode = codeInput.trim();

    if (cleanCode.length !== 6) {
      setAuthError('Please enter a valid 6-digit verification code');
      setIsLoading(false);
      return;
    }

    const res = await verifyLoginCode(cleanEmail, cleanCode, cleanName, otpToken || undefined);
    setIsLoading(false);

    if (!res.success) {
      setAuthError(res.error || 'Invalid verification code. Please check and try again.');
    } else {
      setShowModal(false);
      setOtpToken(null);
    }
  };

  // Host Admin PIN Login for Akshay (requires PIN 1230)
  const handleQuickHostLogin = () => {
    setModalType('signin');
    setEmailInput('akshaycricketer1230@gmail.com');
    setNameInput('Akshay Kumar');
    setAuthStep('code');
    setAuthError(null);
    setSuccessMessage(null);
    setCodeInput('');
    setShowModal(true);
  };

  // Check if pending user was approved by Akshay
  const handleCheckStatus = async () => {
    if (!pendingApprovalUser) return;
    setIsLoading(true);
    await checkMyApprovalStatus();
    setIsLoading(false);
  };

  return (
    <div className="bg-background text-on-surface font-sans h-screen w-screen overflow-hidden flex selection:bg-primary-container selection:text-on-primary-container">
      <main className="w-full h-full flex flex-col md:flex-row">
        {/* Left Pane: Cosmic Space Branding & Random Welcome Image */}
        <section className="hidden md:flex md:w-[50%] lg:w-[48%] bg-[#080918] text-white flex-col justify-between border-r border-purple-900/30 relative overflow-hidden shrink-0">
          {/* ── Random Welcome Image (full-pane background) ── */}
          {welcomeImage ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={welcomeImage}
                src={welcomeImage}
                alt="Interstellers Welcome"
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(true)}
                className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              />
              {/* Dark gradient overlay so text stays readable */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#080918]/90 via-[#080918]/40 to-[#080918]/20 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#080918]/30 to-transparent pointer-events-none" />
            </>
          ) : (
            /* Fallback: ambient cosmic lights while image loads or if list is empty */
            <>
              <div className="absolute top-[-20%] left-[-20%] w-[90%] h-[90%] rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={INTERSTELLERS_LOGO}
                alt="Interstellers Logo"
                className="absolute inset-0 m-auto w-[70%] max-w-[380px] h-auto object-contain opacity-30"
              />
            </>
          )}

          {/* ── Content overlay ── */}
          <div className="relative z-10 flex flex-col justify-between h-full p-8 lg:p-14">
            {/* Logo badge at top */}
            <div className="mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={INTERSTELLERS_LOGO}
                alt="Interstellers Logo"
                className="w-full max-w-[260px] lg:max-w-[320px] h-auto object-contain rounded-2xl drop-shadow-[0_0_50px_rgba(168,85,247,0.45)] hover:scale-[1.02] transition-transform duration-300"
              />
            </div>

            {/* Core Quote */}
            <div className="my-auto">
              <blockquote className="font-heading font-bold text-2xl lg:text-3xl text-purple-300 mb-5 max-w-md leading-snug drop-shadow-lg">
                &ldquo;Time is never coming back, remember time is never...&rdquo;
              </blockquote>
              <div className="w-20 h-1.5 bg-purple-500 rounded-full mb-4 shadow-[0_0_12px_rgba(168,85,247,0.8)]" />
              <p className="text-xs sm:text-sm text-slate-300 max-w-sm leading-relaxed drop-shadow">
                Connect with friends, collaborate across galactic spaces, and experience real-time community communication.
              </p>
            </div>

            {/* Footer */}
            <div className="mt-auto">
              <p className="text-xs text-slate-400 font-medium">
                &copy; 2026 Interstellers. Professional Networking.
              </p>
            </div>
          </div>
        </section>

        {/* Right Pane: Authentication or Pending Holding Screen */}
        <section className="w-full md:w-[50%] lg:w-[52%] bg-surface-container-lowest h-full flex items-center justify-center p-6 sm:p-10 relative overflow-y-auto custom-scrollbar">
          {/* Mobile Logo */}
          <div className="absolute top-4 left-4 md:hidden bg-[#080918] p-1 rounded-xl border border-purple-500/30 shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={INTERSTELLERS_LOGO}
              alt="Interstellers Logo"
              className="h-16 sm:h-20 w-auto rounded-lg object-contain"
            />
          </div>

          {/* PENDING APPROVAL HOLDING LOBBY */}
          {pendingApprovalUser ? (
            <div className="w-full max-w-md flex flex-col gap-6 z-10 my-auto py-10 animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-surface-container-lowest rounded-2xl border border-primary/30 shadow-floating p-6 sm:p-8 flex flex-col gap-5 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-amber-400 to-primary" />

                <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mx-auto ring-8 ring-amber-50 dark:ring-amber-900/20">
                  <Clock className="w-8 h-8 animate-spin [animation-duration:8s]" />
                </div>

                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-semibold border border-emerald-500/20 mx-auto">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Gmail Code Verified</span>
                  </div>
                  <h2 className="font-heading font-bold text-xl text-on-surface">
                    Awaiting Host Approval
                  </h2>
                  <p className="text-xs text-on-surface-variant max-w-xs mx-auto">
                    Hello <strong className="text-on-surface">{pendingApprovalUser.name}</strong> ({pendingApprovalUser.email}), your verified registration has been placed in the queue.
                  </p>
                </div>

                <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/40 space-y-2 text-left text-xs">
                  <div className="flex items-center gap-2 text-primary font-semibold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Host Verification in Progress</span>
                  </div>
                  <p className="text-on-surface-variant leading-relaxed">
                    Account activation requires approval from <strong className="text-on-surface">Akshay</strong> before you can access the platform. Please wait while Akshay reviews your access request.
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={handleCheckStatus}
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-primary hover:bg-primary-hover text-on-primary font-semibold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  >
                    <RefreshCw className={isLoading ? 'w-4 h-4 animate-spin' : 'w-4 h-4'} />
                    <span>{isLoading ? 'Checking Approval...' : 'Check Approval Status'}</span>
                  </button>

                  <button
                    onClick={() => setPendingApprovalUser(null)}
                    className="w-full py-2.5 px-4 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors"
                  >
                    Return to Sign In
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* STANDARD AUTH CARD */
            <div className="w-full max-w-md flex flex-col gap-6 z-10 my-auto py-10">
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-floating p-6 sm:p-8 flex flex-col gap-6">
                {/* Header with Centered Brand Logo */}
                <div className="text-center space-y-2 flex flex-col items-center">
                  <div className="p-2 bg-[#080918] rounded-2xl border border-purple-500/30 shadow-lg shadow-purple-500/10 mb-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={INTERSTELLERS_LOGO}
                      alt="Interstellers"
                      className="h-16 sm:h-20 w-auto object-contain rounded-lg"
                    />
                  </div>
                  <div>
                    <h1 className="font-heading font-bold text-2xl text-on-surface">
                      Welcome to Interstellers
                    </h1>
                    <p className="text-xs sm:text-sm text-on-surface-variant">
                      Join the professional galaxy community
                    </p>
                  </div>
                </div>

                {/* Sign In Section */}
                <div className="flex flex-col gap-2">
                  <h2 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider pl-1">
                    Existing Users
                  </h2>
                  <button
                    onClick={() => handleOpenAuth('signin')}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2.5 bg-surface-container hover:bg-surface-container-high transition-all text-on-surface font-semibold text-sm py-3 px-4 rounded-xl border border-outline-variant/60 relative overflow-hidden group shadow-xs active:scale-[0.98]"
                  >
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    <span>Sign in with Gmail Code</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 opacity-60">
                  <div className="flex-1 h-[1px] bg-outline-variant" />
                  <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
                    or new user
                  </span>
                  <div className="flex-1 h-[1px] bg-outline-variant" />
                </div>

                {/* Sign Up Section */}
                <div className="flex flex-col gap-3 bg-surface-container-low p-4 rounded-xl border border-primary/20 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                  <h2 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    Create Account
                  </h2>
                  <button
                    onClick={() => handleOpenAuth('register')}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover transition-all text-on-primary font-semibold text-sm py-3 px-4 rounded-xl shadow-xs active:scale-[0.98]"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Register with Gmail</span>
                  </button>

                  {/* Host Approval Banner */}
                  <div className="flex items-start gap-2 bg-surface-container p-3 rounded-lg border border-outline-variant/40 text-on-surface-variant text-xs">
                    <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <p className="leading-tight">
                      Account activation requires approval from <strong className="text-on-surface">Akshay</strong> before you can access the platform.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* 2-STEP GMAIL VERIFICATION MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest border border-outline-variant/80 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/40">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary text-on-primary">
                  {authStep === 'input' ? <Mail className="w-4 h-4" /> : <KeyRound className="w-4 h-4" />}
                </div>
                <h3 className="font-heading font-bold text-base text-on-surface">
                  {authStep === 'input'
                    ? modalType === 'register'
                      ? 'Register with Gmail'
                      : 'Sign In with Gmail'
                    : 'Enter 6-Digit Verification Code'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container text-sm"
              >
                ✕
              </button>
            </div>

            {/* STEP 1: Email Input Form */}
            {authStep === 'input' ? (
              <form onSubmit={handleSendCode} className="space-y-3.5">
                {modalType === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      required
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck={false}
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-bright text-xs sm:text-sm text-on-surface focus:border-primary outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                    Gmail Address
                  </label>
                  <input
                    type="email"
                    required
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-bright text-xs sm:text-sm text-on-surface focus:border-primary outline-none"
                  />
                </div>

                <div className="p-2.5 bg-surface-container rounded-xl text-[11px] text-on-surface-variant flex items-start gap-2">
                  <KeyRound className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <span>
                    A secure 6-digit login code will be generated for your Gmail account.
                  </span>
                </div>

                {authError && (
                  <p className="text-xs text-error font-medium">{authError}</p>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNameInput('');
                      setEmailInput('');
                      setCodeInput('');
                      setShowModal(false);
                    }}
                    className="flex-1 py-2.5 rounded-xl border border-outline-variant text-xs font-semibold text-on-surface-variant hover:bg-surface-container"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-xs font-semibold text-on-primary flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <span>{isLoading ? 'Sending...' : 'Send Login Code'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            ) : (
              /* STEP 2: Code Entry Form */
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div className="p-3 bg-surface-container rounded-xl border border-outline-variant/40 space-y-1.5 text-left">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                    <Mail className="w-3.5 h-3.5" />
                    <span>Gmail Verification Code</span>
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    We sent a 6-digit verification code to <strong className="text-on-surface font-mono">{emailInput}</strong>. Please check your inbox or spam folder.
                  </p>
                  {codeInput && (
                    <div className="mt-2 p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Your Verification Code: <strong className="font-mono text-white text-sm bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/40">{codeInput}</strong> (Auto-filled)</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                    Enter 6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    autoFocus
                    required
                    autoComplete="off"
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="• • • • • •"
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-bright text-center font-mono text-xl tracking-[0.4em] text-on-surface focus:border-primary outline-none"
                  />
                </div>

                {authError && (
                  <p className="text-xs text-error font-medium">{authError}</p>
                )}

                <div className="p-2.5 bg-surface-container rounded-xl text-[11px] text-on-surface-variant flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <span>
                    After verification, new registrations will be submitted for Akshay&apos;s host approval.
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthStep('input');
                      setAuthError(null);
                    }}
                    className="text-xs font-semibold text-on-surface-variant hover:text-primary flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Change Email</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendCode}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Resend Code
                  </button>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-outline-variant text-xs font-semibold text-on-surface-variant hover:bg-surface-container"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || codeInput.length !== 6}
                    className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 text-xs font-semibold text-on-primary flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <span>{isLoading ? 'Verifying...' : 'Verify & Proceed'}</span>
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
