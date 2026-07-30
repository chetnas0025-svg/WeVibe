import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Mail, Phone, LogIn, UserPlus, KeyRound, CheckCircle, ArrowRight } from 'lucide-react';
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

  // Forgot Password State
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetStep, setResetStep] = useState(1); // 1: identify, 2: set new password, 3: success

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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

  const handleRegister = (e) => {
    e.preventDefault();
    setError('');

    if (regPhone.length !== 10 || !/^\d{10}$/.test(regPhone)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    if (!regEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (regPassword.length < 4) {
      setError("Password must be at least 4 characters long.");
      return;
    }

    const res = register({
      name: regName || 'Valued Member',
      username: regEmail.split('@')[0] || regPhone,
      email: regEmail,
      phone: regPhone,
      password: regPassword,
      joinedDate: 'July 2026'
    });

    if (res.success) {
      navigate('/account');
    } else {
      setError(res.message);
    }
  };

  const handleIdentifyAccount = (e) => {
    e.preventDefault();
    setError('');
    if (!resetIdentifier.trim()) {
      setError("Please enter your registered email address or 10-digit phone number.");
      return;
    }
    setResetStep(2);
  };

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

    const res = resetPassword(resetIdentifier, newPassword);
    if (res.success) {
      setResetStep(3);
      setSuccessMsg("Password reset successfully! You can now sign in with your new password.");
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
            onClick={() => { setActiveTab('login'); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-3 font-bold text-xs sm:text-sm border-b-2 transition-colors ${
              activeTab === 'login'
                ? 'border-gold-dark text-gold-dark'
                : 'border-transparent text-espresso-800/60 hover:text-espresso-900'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setActiveTab('register'); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-3 font-bold text-xs sm:text-sm border-b-2 transition-colors ${
              activeTab === 'register'
                ? 'border-gold-dark text-gold-dark'
                : 'border-transparent text-espresso-800/60 hover:text-espresso-900'
            }`}
          >
            Create Account
          </button>
          <button
            onClick={() => { setActiveTab('forgot'); setError(''); setSuccessMsg(''); setResetStep(1); }}
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

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            {successMsg}
          </div>
        )}

        {/* 1. SIGN IN FORM */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-espresso-900 uppercase tracking-wider">
                Email Address or 10-Digit Phone Number
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

        {/* 2. CREATE ACCOUNT FORM */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-espresso-900">Your Full Name *</label>
              <input
                type="text"
                required
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
              <label className="text-xs font-bold text-espresso-900">10-Digit Phone Number *</label>
              <input
                type="tel"
                required
                maxLength={10}
                pattern="[0-9]{10}"
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
                placeholder="Create a secure password"
                className="w-full px-4 py-2.5 rounded-xl bg-cream-50 border border-gold/30 text-espresso-900 text-xs focus:outline-none focus:border-gold"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-full bg-gold hover:bg-gold-dark text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register Account</span>
            </button>
          </form>
        )}

        {/* 3. FORGOT PASSWORD FLOW (Step 1 -> Step 2 -> Step 3) */}
        {activeTab === 'forgot' && (
          <div className="space-y-4">
            {resetStep === 1 && (
              <form onSubmit={handleIdentifyAccount} className="space-y-4">
                <p className="text-xs text-espresso-800/70 leading-relaxed">
                  Enter your registered Email Address or 10-Digit Phone Number to reset your password.
                </p>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-espresso-900">Registered Email or Phone *</label>
                  <input
                    type="text"
                    required
                    value={resetIdentifier}
                    onChange={(e) => setResetIdentifier(e.target.value)}
                    placeholder="e.g. user@wevibes.com or 9876543210"
                    className="w-full px-4 py-2.5 rounded-xl bg-cream-50 border border-gold/30 text-espresso-900 text-xs focus:outline-none focus:border-gold"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full bg-espresso-800 hover:bg-espresso-900 text-gold-light font-bold text-sm shadow-md flex items-center justify-center gap-2"
                >
                  <span>Continue</span> <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {resetStep === 2 && (
              <form onSubmit={handleSetNewPassword} className="space-y-4">
                <div className="p-3 rounded-xl bg-gold/15 border border-gold/30 text-xs text-espresso-900">
                  Setting new password for: <strong>{resetIdentifier}</strong>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-espresso-900">Create New Password *</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-4 py-2.5 rounded-xl bg-cream-50 border border-gold/30 text-espresso-900 text-xs focus:outline-none focus:border-gold"
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
                    className="w-full px-4 py-2.5 rounded-xl bg-cream-50 border border-gold/30 text-espresso-900 text-xs focus:outline-none focus:border-gold"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full bg-gold hover:bg-gold-dark text-white font-bold text-sm shadow-md flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Update Password & Save</span>
                </button>
              </form>
            )}

            {resetStep === 3 && (
              <div className="text-center space-y-4">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                <button
                  onClick={() => { setActiveTab('login'); setIdentifier(resetIdentifier); setPassword(newPassword); }}
                  className="w-full py-3.5 rounded-full bg-espresso-800 hover:bg-espresso-900 text-gold-light font-bold text-sm shadow-md"
                >
                  Click Here to Sign In Now
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
