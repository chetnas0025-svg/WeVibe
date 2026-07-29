import React, { useState, useRef, useEffect } from 'react';
import { X, CheckCircle, Shield, Loader, ExternalLink } from 'lucide-react';

export default function OtpModal({ isOpen, onClose, onVerify, targetEmail, devOtp, previewUrl }) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    if (isOpen) {
      setDigits(['', '', '', '', '', '']);
      setError('');
      setTimeout(() => {
        if (inputRefs[0].current) inputRefs[0].current.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);
    setError('');

    if (value && index < 5 && inputRefs[index + 1].current) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0 && inputRefs[index - 1].current) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = digits.join('');
    if (code.length < 6) {
      setError('Please enter all 6 digits.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await onVerify(code);
      if (!res.success) {
        setError(res.message || 'Invalid verification code.');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso-950/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-white border border-gold/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-cream-100 hover:bg-cream-200 text-espresso-800 flex items-center justify-center transition-colors"
          aria-label="Close OTP modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-full bg-gold-light/20 text-gold-dark flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-2xl text-espresso-900">Email Verification</h3>
          <p className="text-sm text-espresso-800/70">
            We've dispatched a 6-digit verification code to:<br />
            <strong className="text-gold-dark font-semibold">{targetEmail || 'your email address'}</strong>
          </p>
        </div>

        {/* Ethereal Test Mode Link Helper */}
        {previewUrl && (
          <div className="mb-5 p-3 rounded-xl bg-gold/15 border border-gold/30 text-xs text-espresso-800 text-center">
            ✉️ <strong>Test Mode Preview:</strong>{' '}
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-dark font-bold underline inline-flex items-center gap-1 hover:text-gold"
            >
              Click here to view sent email <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Dev OTP Display Helper if no previewUrl */}
        {devOtp && !previewUrl && (
          <div className="mb-5 p-3 rounded-xl bg-gold-light/20 border border-gold/40 text-xs text-espresso-800 text-center">
            🔧 <strong>Dev Helper Code:</strong> <span className="font-bold text-gold-dark tracking-widest text-sm">{devOtp}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between gap-2 sm:gap-3">
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={inputRefs[idx]}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl border ${
                  error ? 'border-red-400 bg-red-50' : 'border-gold/30 bg-cream-50 focus:border-gold focus:bg-white'
                } focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all`}
              />
            ))}
          </div>

          {error && <p className="text-xs text-red-600 font-medium text-center">{error}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-3 rounded-xl bg-cream-100 hover:bg-cream-200 text-espresso-800 font-medium text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-gold to-gold-dark hover:from-gold-dark hover:to-gold text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Confirm Table
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
