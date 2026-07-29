import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Mail, Key, LogIn, UserPlus, HelpCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register' | 'forgot'
  const [username, setUsername] = useState('user123');
  const [password, setPassword] = useState('pass123');
  
  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Forgot state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    const res = login(username, password);
    if (res.success) {
      navigate('/account');
    } else {
      setError(res.message);
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!regUsername || !regPassword) {
      setError('Please fill in all fields.');
      return;
    }
    const res = register({
      username: regUsername,
      password: regPassword,
      name: regName || regUsername,
      email: regEmail,
      phone: regPhone,
      joinedDate: 'July 2026'
    });
    if (res.success) {
      navigate('/account');
    }
  };

  const handleForgot = (e) => {
    e.preventDefault();
    if (forgotEmail) {
      setForgotSent(true);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-full bg-gold-light/20 text-gold-dark flex items-center justify-center mx-auto mb-2">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-espresso-900">Member Access</h1>
        <p className="text-espresso-800/70 text-sm">
          Welcome to We Vibes Cafe Membership
        </p>
      </div>

      {/* Helper Box for Demo Credentials */}
      <div className="p-4 rounded-2xl bg-gold-light/20 border border-gold/40 text-xs text-espresso-800 space-y-1">
        <p className="font-bold text-gold-dark flex items-center gap-1">
          💡 Demo Credentials Pre-filled:
        </p>
        <p>• Username/ID: <strong className="text-espresso-900">user123</strong></p>
        <p>• Password: <strong className="text-espresso-900">pass123</strong></p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-3xl p-8 border border-gold/30 shadow-xl space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-cream-200">
          <button
            onClick={() => { setActiveTab('login'); setError(''); }}
            className={`flex-1 py-3 font-semibold text-sm border-b-2 transition-colors ${
              activeTab === 'login'
                ? 'border-gold-dark text-gold-dark'
                : 'border-transparent text-espresso-800/60 hover:text-espresso-900'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setActiveTab('register'); setError(''); }}
            className={`flex-1 py-3 font-semibold text-sm border-b-2 transition-colors ${
              activeTab === 'register'
                ? 'border-gold-dark text-gold-dark'
                : 'border-transparent text-espresso-800/60 hover:text-espresso-900'
            }`}
          >
            New Account
          </button>
          <button
            onClick={() => { setActiveTab('forgot'); setError(''); setForgotSent(false); }}
            className={`flex-1 py-3 font-semibold text-sm border-b-2 transition-colors ${
              activeTab === 'forgot'
                ? 'border-gold-dark text-gold-dark'
                : 'border-transparent text-espresso-800/60 hover:text-espresso-900'
            }`}
          >
            Forgot Password
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
            {error}
          </div>
        )}

        {/* SIGN IN FORM */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-espresso-900 uppercase tracking-wider">
                User ID / Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. user123"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-cream-50 border border-gold/30 text-espresso-900 text-sm focus:outline-none focus:border-gold focus:bg-white"
                />
                <User className="w-4 h-4 text-gold-dark absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-espresso-900 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="e.g. pass123"
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
              <span>Sign In to Account</span>
            </button>
          </form>
        )}

        {/* REGISTER FORM */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-espresso-900">Full Name</label>
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-4 py-2.5 rounded-xl bg-cream-50 border border-gold/30 text-espresso-900 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-espresso-900">Choose Username / ID</label>
              <input
                type="text"
                required
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                placeholder="e.g. rahul123"
                className="w-full px-4 py-2.5 rounded-xl bg-cream-50 border border-gold/30 text-espresso-900 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-espresso-900">Email Address</label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="e.g. rahul@example.com"
                className="w-full px-4 py-2.5 rounded-xl bg-cream-50 border border-gold/30 text-espresso-900 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-espresso-900">Choose Password</label>
              <input
                type="password"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-cream-50 border border-gold/30 text-espresso-900 text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-full bg-gold hover:bg-gold-dark text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create My Account</span>
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD FORM */}
        {activeTab === 'forgot' && (
          <form onSubmit={handleForgot} className="space-y-4">
            {forgotSent ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2 text-center">
                <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="font-bold text-sm">Password Reset Email Sent!</p>
                <p>If an account exists for {forgotEmail}, we've sent password reset instructions.</p>
              </div>
            ) : (
              <>
                <p className="text-xs text-espresso-800/70">
                  Enter your registered email address and we will send you a password reset link.
                </p>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-espresso-900">Registered Email</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="e.g. user@wevibes.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-cream-50 border border-gold/30 text-espresso-900 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full bg-espresso-800 hover:bg-espresso-900 text-gold-light font-bold text-sm shadow-md"
                >
                  Send Reset Instructions
                </button>
              </>
            )}
          </form>
        )}

      </div>
    </div>
  );
}
