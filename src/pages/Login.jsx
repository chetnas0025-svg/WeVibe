import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Mail, Phone, LogIn, UserPlus, KeyRound, CheckCircle, ArrowRight, ShieldCheck, ExternalLink, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, register, resetPassword } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register' | 'forgot'
  
  // Login State
  const [identifier, setIdentifier] = useState('user@wevibes.com');
  const [password, setPassword] = useState('pass123');

  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Forgot Password State (with Email OTP)
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
  const [devOtp, setDevOtp] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. Handle Login
  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    const res = login(identifier, password);
    if (res.success) {
      navigate('/account');
    } else {
      setError(res.message);
    }
  };

  // 2. Handle Register (First time email + password creation)
  const handleRegister = (e) => {
    e.preventDefault();
    setError('');

    if (!regEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (regPassword.length < 4) {
      setError("Password must be at least 4 characters long.");
      return;
    }

    const res = register({
      name: regName || regEmail.split('@')[0],
      username: regEmail.split('@')[0],
      email: regEmail,
      phone: regPhone || '9876543210',
      password: regPassword,
      joinedDate: 'July 2026'
    });

    if (res.success) {
      navigate('/account');
    } else {
      setError(res.message);
    }
  };

  // 3. Forgot Password - Step 1: Send Email OTP
  const handleSendForgotOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (!forgotEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });

      const data = await res.json();
      if (data.success) {
        setDevOtp(data.otp);
        setPreviewUrl(data.preview_url || '');
        setForgotStep(2);
      } else {
        setError(data.message || "Failed to send verification code.");
      }
    } catch (err) {
      setError("Server connection issue. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 4. Forgot Password - Step 2: Verify Email OTP
  const handleVerifyForgotOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (forgotOtp.length !== 6 || !/^\d{6}$/.test(forgotOtp)) {
      setError("Please enter the 6-digit verification code sent to your email.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, otp: forgotOtp })
      });

      const data = await res.json();
      if (data.success) {
        setForgotStep(3);
      } else {
        setError(data.message || "Incorrect verification code.");
      }
    } catch (err) {
      setError("Server connection issue. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 5. Forgot Password - Step 3: Create New Password
  const handleSetNewPassword = (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 4) {
      setError("New password must be at least 4 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    const res = resetPassword(forgotEmail, newPassword);
    if (res.success) {
      setForgotStep(4);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-full bg-gold-light/20 text-gold-dark flex items-center justify-center mx-auto mb-2 shadow-md">
          <Lock className="w-7 h-7" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-espresso-900">Member Portal</h1>
        <p className="text-espresso-800/70 text-sm">
          Sign in or create an account for exclusive member rewards
        </p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-3xl p-8 border border-gold/30 shadow-xl space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-cream-200">
          <button
            onClick={() => { setActiveTab('login'); setError(''); }}
            className={`flex-1 py-3 font-bold text-xs sm:text-sm border-b-2 transition-colors ${
              activeTab === 'login'
                ? 'border-gold-dark text-gold-dark'
                : 'border-transparent text-espresso-800/60 hover:text-espresso-900'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setActiveTab('register'); setError(''); }}
            className={`flex-1 py-3 font-bold text-xs sm:text-sm border-b-2 transition-colors ${
              activeTab === 'register'
                ? 'border-gold-dark text-gold-dark'
                : 'border-transparent text-espresso-800/60 hover:text-espresso-900'
            }`}
          >
            Create Account
          </button>
          <button
            onClick={() => { setActiveTab('forgot'); setError(''); setForgotStep(1); setForgotOtp(''); }}
            className={`flex-1 py-3 font-bold text-xs sm:text-sm border-b-2 transition-colors ${
              activeTab === 'forgot'
                ? 'border-gold-dark text-gold-dark'
                : 'border-transparent text-espresso-800/60 hover:text-espresso-900'
            }`}
          >
            Forgot Password
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* 1. SIGN IN FORM */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-espresso-900 uppercase tracking-wider">
                Email Address or 10-Digit Phone
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. user@wevibes.com or 9876543210"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-cream-50 border border-gold/30 text-espresso-900 text-sm focus:outline-none focus:border-gold focus:bg-white"
                />
                <User className="w-4 h-4 text-gold-dark absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-espresso-900 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-cream-50 border border-gold/30 text-espresso-900 text-sm focus:outline-none focus:border-gold focus:bg-white"
                />
                <Lock className="w-4 h-4 text-gold-dark absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-full bg-espresso-800 hover:bg-espresso-900 text-gold-light font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          </form>
        )}

        {/* 2. CREATE ACCOUNT FORM (Email + Create Password) */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-espresso-900">Your Full Name (Optional)</label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-4 py-2.5 rounded-xl bg-cream-50 border border-gold/30 text-espresso-900 text-xs focus:outline-none focus:border-gold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-espresso-900">Email Address *</label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="e.g. rahul@example.com"
                className="w-full px-4 py-2.5 rounded-xl bg-cream-50 border border-gold/30 text-espresso-900 text-xs focus:outline-none focus:border-gold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-espresso-900">10-Digit Phone Number (Optional)</label>
              <input
                type="tel"
                maxLength={10}
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full px-4 py-2.5 rounded-xl bg-cream-50 border border-gold/30 text-espresso-900 text-xs focus:outline-none focus:border-gold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-espresso-900">Create Password *</label>
              <input
                type="password"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Create a password"
                className="w-full px-4 py-2.5 rounded-xl bg-cream-50 border border-gold/30 text-espresso-900 text-xs focus:outline-none focus:border-gold"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-full bg-gold hover:bg-gold-dark text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Account & Sign In</span>
            </button>
          </form>
        )}

        {/* 3. FORGOT PASSWORD FLOW WITH EMAIL OTP */}
        {activeTab === 'forgot' && (
          <div className="space-y-4">
            
            {/* Step 1: Enter Email */}
            {forgotStep === 1 && (
              <form onSubmit={handleSendForgotOtp} className="space-y-4">
                <p className="text-xs text-espresso-800/70 leading-relaxed">
                  Enter your registered Email Address. We will send a 6-digit OTP code to verify your ownership.
                </p>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-espresso-900">Registered Email Address *</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="e.g. rahul@example.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-cream-50 border border-gold/30 text-espresso-900 text-xs focus:outline-none focus:border-gold"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-full bg-espresso-800 hover:bg-espresso-900 text-gold-light font-bold text-sm shadow-md flex items-center justify-center gap-2"
                >
                  {loading ? <Loader className="w-4 h-4 animate-spin" /> : <span>Send Email OTP</span>}
                </button>
              </form>
            )}

            {/* Step 2: Enter Email OTP */}
            {forgotStep === 2 && (
              <form onSubmit={handleVerifyForgotOtp} className="space-y-4">
                <div className="p-3 rounded-xl bg-gold/15 border border-gold/30 text-xs text-espresso-900 text-center">
                  6-Digit OTP sent to: <strong>{forgotEmail}</strong>
                </div>

                {previewUrl && (
                  <div className="p-2.5 rounded-xl bg-gold-light/20 text-xs text-center border border-gold/40">
                    ✉️ <a href={previewUrl} target="_blank" rel="noreferrer" className="text-gold-dark font-bold underline inline-flex items-center gap-1">
                      Click to view email preview <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {devOtp && !previewUrl && (
                  <div className="p-2 rounded-xl bg-cream-100 text-xs text-center font-mono font-bold text-gold-dark">
                    Dev OTP: {devOtp}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-espresso-900">Enter 6-Digit Email OTP *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    placeholder="e.g. 123456"
                    className="w-full px-4 py-3 rounded-xl bg-cream-50 border border-gold/30 text-center text-lg font-bold font-mono text-espresso-900 tracking-widest focus:outline-none focus:border-gold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-full bg-gold hover:bg-gold-dark text-white font-bold text-sm shadow-md flex items-center justify-center gap-2"
                >
                  {loading ? <Loader className="w-4 h-4 animate-spin" /> : <span>Verify OTP</span>}
                </button>
              </form>
            )}

            {/* Step 3: Create New Password */}
            {forgotStep === 3 && (
              <form onSubmit={handleSetNewPassword} className="space-y-4">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Email verified! Create your new password below.</span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-espresso-900">Create New Password *</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-4 py-2.5 rounded-xl bg-cream-50 border border-gold/30 text-espresso-900 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-espresso-900">Confirm New Password *</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-2.5 rounded-xl bg-cream-50 border border-gold/30 text-espresso-900 text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full bg-espresso-800 hover:bg-espresso-900 text-gold-light font-bold text-sm shadow-md"
                >
                  Update Password & Save
                </button>
              </form>
            )}

            {/* Step 4: Success Screen */}
            {forgotStep === 4 && (
              <div className="text-center space-y-4 py-2">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                <p className="font-bold text-espresso-900 text-sm">Password Updated Successfully!</p>
                <button
                  onClick={() => { setActiveTab('login'); setIdentifier(forgotEmail); setPassword(newPassword); }}
                  className="w-full py-3.5 rounded-full bg-espresso-800 hover:bg-espresso-900 text-gold-light font-bold text-sm shadow-md"
                >
                  Sign In with New Password
                </button>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
