import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile } from '../types';
import { StorageService } from '../services/storage';
import { verifyTwoFactorCode } from '../utils/crypto';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLoginSuccess: (user: UserProfile, isAdmin: boolean) => void;
  initialMode?: 'login' | 'signup' | 'admin_login';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'admin_step1' | 'admin_step2'>(
    initialMode === 'admin_login' ? 'admin_step1' : initialMode
  );

  // Form Fields
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  // Auto-detect referral code from URL parameter e.g. ?ref=DCOIN-ABCD
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const refParam = params.get('ref');
      if (refParam) {
        setReferralCode(refParam.toUpperCase());
        if (mode === 'login') {
          setMode('signup');
        }
      }
    }
  }, [mode]);

  useEffect(() => {
    if (initialMode === 'admin_login') {
      setMode('admin_step1');
    } else {
      setMode(initialMode);
    }
    setErrorMsg('');
    setInfoMsg('');
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  // Handle Standard Login (Detects role and routes accordingly)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (!emailOrUsername.trim() || !password.trim()) {
      setErrorMsg('Please enter your email or username, and password.');
      return;
    }

    const result = StorageService.loginUser(emailOrUsername.trim(), password.trim());
    if (!result.success || !result.user) {
      setErrorMsg(result.error || 'Invalid credentials.');
      return;
    }

    const authenticatedUser = result.user;

    // If user is Admin, challenge with 2FA step before granting admin session
    if (authenticatedUser.role === 'admin') {
      setEmail(authenticatedUser.email);
      setMode('admin_step2');
      return;
    }

    // Regular user login -> routes directly to User Dashboard
    onLoginSuccess(authenticatedUser, false);
    onClose();
    confetti({ particleCount: 35, spread: 60 });
  };

  // Handle Signup with MANDATORY referral code
  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (!username.trim() || !email.trim() || !password.trim()) {
      setErrorMsg('All fields are required.');
      return;
    }

    if (!referralCode.trim()) {
      setErrorMsg('A valid Referral Code is required to create a mining account.');
      return;
    }

    const result = StorageService.registerUser({
      username: username.trim(),
      email: email.trim(),
      password: password.trim(),
      referralCode: referralCode.trim(),
    });

    if (!result.success || !result.user) {
      setErrorMsg(result.error || 'Registration failed.');
      return;
    }

    // New user successfully created and credited to referrer
    onLoginSuccess(result.user, false);
    onClose();

    confetti({
      particleCount: 80,
      spread: 75,
      colors: ['#f59e0b', '#22c55e', '#3b82f6'],
    });
  };

  // Handle Forgot Password
  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }
    setInfoMsg(`Password recovery instructions sent to ${email}. Check your inbox.`);
  };

  // Handle Admin Portal Step 1
  const handleAdminStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter master administrator credentials.');
      return;
    }

    const result = StorageService.loginUser(email.trim(), password.trim());
    if (!result.success || !result.user) {
      setErrorMsg('Admin account not found or invalid master password.');
      return;
    }

    if (result.user.role !== 'admin') {
      setErrorMsg('Access denied. This account does not possess administrator credentials.');
      return;
    }

    // Proceed to mandatory 2-Step Authenticator verification
    setMode('admin_step2');
  };

  // Handle Admin Portal Step 2 (Google Authenticator TOTP)
  const handleAdminStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!verifyTwoFactorCode(twoFactorCode)) {
      setErrorMsg('Invalid 6-digit Authenticator code. Try 123456 or your Google Authenticator code.');
      return;
    }

    const registry = StorageService.getUsersRegistry();
    const adminUser = registry.find((u) => u.role === 'admin') || {
      id: 'usr_admin_root',
      username: 'Admin',
      email: email.trim() || 'admin@dcoine.network',
      referralCode: 'DCOIN-ROOT',
      role: 'admin' as const,
      twoFactorEnabled: true,
      isMerchant: true,
      merchantSecurityPledge: 5000,
      kycStatus: 'verified' as const,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      createdAt: Date.now(),
      lockedMinedBalance: 0,
    };

    StorageService.saveUser(adminUser);
    onLoginSuccess(adminUser, true);
    onClose();

    confetti({
      particleCount: 80,
      spread: 80,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-2">
            <img src="/logo.png" alt="Dcoine" className="w-10 h-10 object-contain drop-shadow" />
          </div>
          <h2 className="text-xl font-extrabold text-white">
            {mode === 'login' && 'Sign In to Dcoine'}
            {mode === 'signup' && 'Create Mining Account'}
            {mode === 'forgot' && 'Reset Password'}
            {mode === 'admin_step1' && 'Administrator Portal'}
            {mode === 'admin_step2' && 'Google Authenticator 2FA'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'signup' && 'Mandatory referral code required to participate in 24h cloud mining'}
            {mode === 'admin_step2' && 'Enter the 6-digit verification code from your Google Authenticator app'}
            {mode === 'login' && 'Access your multi-chain vault, 24h mining sessions, and P2P escrow'}
            {mode === 'admin_step1' && 'Protected control console for system administrators only'}
          </p>
        </div>

        {/* Error / Info messages */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}
        {infoMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>{infoMsg}</span>
          </div>
        )}

        {/* 1. LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="text-xs text-slate-300 block mb-1">Email or Username</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  placeholder="Username or email address"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <label className="text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-amber-400 hover:underline text-[11px] cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition mt-2 cursor-pointer"
            >
              Sign In to Account
            </button>

            <div className="pt-2 text-center text-xs text-slate-400">
              Don&apos;t have an account yet?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-amber-400 font-semibold hover:underline cursor-pointer"
              >
                Sign Up for Mining
              </button>
            </div>

            {/* Discreet Admin Portal Link */}
            <div className="pt-3 border-t border-slate-800/80 text-center">
              <button
                type="button"
                onClick={() => {
                  setMode('admin_step1');
                  setErrorMsg('');
                }}
                className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center justify-center gap-1 mx-auto cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Administrator Portal (Master 2FA)</span>
              </button>
            </div>
          </form>
        )}

        {/* 2. SIGNUP FORM (WITH MANDATORY REFERRAL CODE ATTRIBUTION) */}
        {mode === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-3">
            <div>
              <label className="text-xs text-slate-300 block mb-1">Choose Username *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. SatoshiMiner"
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* MANDATORY REFERRAL CODE INPUT */}
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-amber-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Mandatory Referral Code</span>
                </label>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Required</span>
              </div>
              <input
                type="text"
                required
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                placeholder="e.g. DCOIN-ROOT"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-amber-300 uppercase placeholder-slate-600 focus:outline-none focus:border-amber-400"
              />
              <span className="text-[10px] text-slate-400 block leading-tight">
                Mandatory for Proof-of-Engagement registration. Connects you to an inviter and activates your +10% hashrate boost.
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-xs shadow-md transition mt-2 cursor-pointer"
            >
              Sign Up &amp; Unlock Mining Pool
            </button>

            <div className="pt-1 text-center text-xs text-slate-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-amber-400 font-semibold hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* 3. FORGOT PASSWORD */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgot} className="space-y-3.5">
            <div>
              <label className="text-xs text-slate-300 block mb-1">Registered Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
            >
              Send Reset Token
            </button>
            <button
              type="button"
              onClick={() => setMode('login')}
              className="w-full text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              Back to Sign In
            </button>
          </form>
        )}

        {/* 4. ADMIN LOGIN STEP 1 */}
        {mode === 'admin_step1' && (
          <form onSubmit={handleAdminStep1} className="space-y-3.5">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
              Step 1 of 2: Verify Master Administrator Email and Password.
            </div>
            <div>
              <label className="text-xs text-slate-300 block mb-1">Admin Email / Username</label>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@dcoine.network"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 block mb-1">Master Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-red-500 hover:bg-red-400 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Continue to 2-Step Verification</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setMode('login')}
              className="w-full text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              Back to Standard Login
            </button>
          </form>
        )}

        {/* 5. ADMIN LOGIN STEP 2 (GOOGLE AUTHENTICATOR 2FA) */}
        {mode === 'admin_step2' && (
          <form onSubmit={handleAdminStep2} className="space-y-4 text-center">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 text-left">
              <strong>Step 2 of 2: Google Authenticator 2FA</strong>
              <p className="mt-1 text-slate-300">
                Please enter the 6-digit verification code from your Google Authenticator app for account{' '}
                <strong>{email || 'admin@dcoine.network'}</strong>.
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">Google Authenticator Code</label>
              <input
                type="text"
                required
                maxLength={6}
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                placeholder="123456"
                className="w-full text-center py-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xl tracking-widest text-amber-400 focus:outline-none focus:border-amber-500"
                autoFocus
              />
              <span className="text-[11px] text-slate-500 block mt-1">
                Enter your 6-digit app code (or 123456 in demo mode)
              </span>
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-red-500 hover:bg-red-400 text-white font-bold text-xs shadow-lg shadow-red-500/25 transition cursor-pointer"
            >
              Verify Code &amp; Enter Admin Control Console
            </button>
            <button
              type="button"
              onClick={() => setMode('login')}
              className="text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
