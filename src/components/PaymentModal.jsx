import React, { useState } from 'react';
import { X, CreditCard, QrCode, CheckCircle, ShieldCheck, Lock, ArrowRight, Smartphone, Sparkles, Loader } from 'lucide-react';

export default function PaymentModal({ isOpen, onClose, totalPrice, orderDetails, onPaymentSuccess }) {
  const [method, setMethod] = useState('upi'); // 'upi' | 'card' | 'gpay'
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');

  const [processing, setProcessing] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [txnId, setTxnId] = useState('');

  if (!isOpen) return null;

  const handlePay = (e) => {
    e.preventDefault();

    if (method === 'upi' && upiId && !upiId.includes('@')) {
      alert("Please enter a valid UPI ID (e.g. username@upi or mobile@gpay).");
      return;
    }

    if (method === 'card') {
      if (cardNumber.length < 16) {
        alert("Please enter a valid 16-digit card number.");
        return;
      }
      if (!expiry || !cvv) {
        alert("Please enter card expiry date and CVV.");
        return;
      }
    }

    setProcessing(true);

    setTimeout(() => {
      const generatedTxn = 'TXN-' + Math.floor(10000000 + Math.random() * 90000000);
      setTxnId(generatedTxn);
      setProcessing(false);
      setPaymentDone(true);
    }, 1500);
  };

  const handleFinalize = () => {
    onPaymentSuccess(txnId);
    setPaymentDone(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso-950/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-white border border-gold/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative animate-scaleUp">
        
        {/* Close Cross */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-cream-100 hover:bg-cream-200 text-espresso-800 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {paymentDone ? (
          /* Payment Success View */
          <div className="text-center space-y-6 py-4 animate-scaleUp">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xl">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-xs uppercase tracking-widest text-emerald-700 font-bold">Payment Verified</span>
              <h3 className="font-serif font-bold text-2xl text-espresso-900">Payment Successful!</h3>
              <p className="text-xs text-espresso-800/70">
                Transaction reference code recorded cleanly.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-cream-50 border border-emerald-200 text-left text-xs space-y-2">
              <div className="flex justify-between border-b border-cream-200 pb-2 font-bold text-espresso-900">
                <span>Transaction ID</span>
                <span className="font-mono text-emerald-700">{txnId}</span>
              </div>
              <div className="flex justify-between text-espresso-800/80">
                <span>Amount Paid</span>
                <span className="font-serif font-bold text-gold-dark text-sm">₹{totalPrice}</span>
              </div>
              <div className="flex justify-between text-espresso-800/80">
                <span>Payment Mode</span>
                <span className="font-medium uppercase">{method}</span>
              </div>
            </div>

            <button
              onClick={handleFinalize}
              className="w-full py-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2 transform hover:scale-105 transition-all animate-glow"
            >
              <span>Continue & Open WhatsApp Receipt</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Payment Form View */
          <div className="space-y-6">
            
            {/* Header */}
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Secure 256-Bit Encrypted Payment
              </div>
              <h3 className="font-serif font-bold text-2xl text-espresso-900 pt-2">Online Payment</h3>
              <p className="text-xs text-espresso-800/70">
                Total Payable Amount: <span className="font-serif font-bold text-gold-dark text-base">₹{totalPrice}</span>
              </p>
            </div>

            {/* Payment Method Selector Pills */}
            <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-cream-100">
              <button
                type="button"
                onClick={() => setMethod('upi')}
                className={`py-2.5 rounded-xl font-bold text-xs flex flex-col items-center gap-1 transition-all ${
                  method === 'upi' ? 'bg-espresso-900 text-gold-light shadow' : 'text-espresso-800/70'
                }`}
              >
                <QrCode className="w-4 h-4 text-gold" />
                <span>UPI / QR</span>
              </button>
              <button
                type="button"
                onClick={() => setMethod('gpay')}
                className={`py-2.5 rounded-xl font-bold text-xs flex flex-col items-center gap-1 transition-all ${
                  method === 'gpay' ? 'bg-espresso-900 text-gold-light shadow' : 'text-espresso-800/70'
                }`}
              >
                <Smartphone className="w-4 h-4 text-gold" />
                <span>GPay / Apps</span>
              </button>
              <button
                type="button"
                onClick={() => setMethod('card')}
                className={`py-2.5 rounded-xl font-bold text-xs flex flex-col items-center gap-1 transition-all ${
                  method === 'card' ? 'bg-espresso-900 text-gold-light shadow' : 'text-espresso-800/70'
                }`}
              >
                <CreditCard className="w-4 h-4 text-gold" />
                <span>Card</span>
              </button>
            </div>

            <form onSubmit={handlePay} className="space-y-4">
              
              {/* UPI & QR Code Mode */}
              {method === 'upi' && (
                <div className="space-y-4">
                  {/* Simulated QR Code Box */}
                  <div className="p-4 rounded-2xl bg-cream-50 border border-gold/30 text-center space-y-2">
                    <p className="text-xs font-bold text-espresso-900">Scan QR Code with PhonePe, Paytm, or GPay</p>
                    <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl border border-gold/40 flex flex-col items-center justify-center shadow-inner">
                      <div className="w-full h-full border-2 border-dashed border-espresso-900 rounded-lg flex flex-col items-center justify-center p-2 text-center">
                        <QrCode className="w-12 h-12 text-espresso-900 mb-1" />
                        <span className="text-[9px] font-mono font-bold text-gold-dark">UPI: wevibes@upi</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-espresso-800/60 block">Accepted: GPay • PhonePe • Paytm • BHIM</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-espresso-900">Or Enter VPA / UPI ID</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. mobile@gpay or username@ybl"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 border border-gold/30 text-xs focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>
              )}

              {/* Instant App Launch Mode */}
              {method === 'gpay' && (
                <div className="space-y-3">
                  <p className="text-xs text-espresso-800/70 text-center">Select your preferred UPI Payment App:</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={handlePay}
                      className="p-3 rounded-2xl bg-cream-50 border border-gold/30 hover:border-gold font-bold text-xs text-espresso-900 flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span>🟢 Google Pay</span>
                    </button>
                    <button
                      type="button"
                      onClick={handlePay}
                      className="p-3 rounded-2xl bg-cream-50 border border-gold/30 hover:border-gold font-bold text-xs text-espresso-900 flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span>🟣 PhonePe</span>
                    </button>
                    <button
                      type="button"
                      onClick={handlePay}
                      className="p-3 rounded-2xl bg-cream-50 border border-gold/30 hover:border-gold font-bold text-xs text-espresso-900 flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span>🔵 Paytm UPI</span>
                    </button>
                    <button
                      type="button"
                      onClick={handlePay}
                      className="p-3 rounded-2xl bg-cream-50 border border-gold/30 hover:border-gold font-bold text-xs text-espresso-900 flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span>🟠 BHIM UPI</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Credit/Debit Card Mode */}
              {method === 'card' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-espresso-900">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="Name on card"
                      className="w-full px-3.5 py-2 rounded-xl bg-cream-50 border border-gold/30 text-xs focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-espresso-900">16-Digit Card Number</label>
                    <input
                      type="text"
                      maxLength={16}
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="4000 1234 5678 9010"
                      className="w-full px-3.5 py-2 rounded-xl bg-cream-50 border border-gold/30 text-xs font-mono tracking-wider focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-espresso-900">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        maxLength={5}
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        placeholder="12/28"
                        className="w-full px-3 py-2 rounded-xl bg-cream-50 border border-gold/30 text-xs text-center font-mono focus:outline-none focus:border-gold"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-espresso-900">CVV</label>
                      <input
                        type="password"
                        maxLength={3}
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        placeholder="123"
                        className="w-full px-3 py-2 rounded-xl bg-cream-50 border border-gold/30 text-xs text-center font-mono focus:outline-none focus:border-gold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Pay Button */}
              <button
                type="submit"
                disabled={processing}
                className="w-full py-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2 transform hover:scale-105 transition-all"
              >
                {processing ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Verifying & Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay ₹{totalPrice} Now</span>
                  </>
                )}
              </button>
            </form>

          </div>
        )}

      </div>
    </div>
  );
}
