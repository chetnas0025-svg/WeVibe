import React, { useState, useEffect } from 'react';
import { X, Utensils, Truck, Phone, Mail, User, MapPin, Sparkles, Plus, Minus, CheckCircle, Shield } from 'lucide-react';
import OtpModal from './OtpModal';

export default function OrderModal({ isOpen, onClose, item }) {
  const [orderType, setOrderType] = useState('table'); // 'table' | 'delivery'
  const [quantity, setQuantity] = useState(1);
  const [tableNo, setTableNo] = useState('T-01');
  const [address, setAddress] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [devOtp, setDevOtp] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setConfirmedOrder(null);
    }
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  // Extract base price number from string like '₹349' or '₹129 (M)'
  const priceNum = parseInt(item.price.replace(/[^0-9]/g, '') || '199', 10);
  const totalPrice = priceNum * quantity;

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (phone.length !== 10 || !/^\d{10}$/.test(phone)) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    if (orderType === 'delivery' && !address.trim()) {
      alert("Please enter your delivery address.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone })
      });

      const data = await res.json();
      if (data.success) {
        setDevOtp(data.otp);
        setPreviewUrl(data.preview_url || '');
        setIsOtpOpen(true);
      } else {
        alert(data.message || "Failed to send verification code.");
      }
    } catch (err) {
      alert("Server connection issue. Please check your network.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (enteredOtp) => {
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone, otp: enteredOtp })
      });

      const data = await res.json();
      if (data.success) {
        const orderData = {
          id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
          item: item.name,
          quantity,
          totalPrice: `₹${totalPrice}`,
          orderType: orderType === 'table' ? `Table Order (${tableNo})` : 'Home Delivery',
          name,
          phone,
          email,
          address: orderType === 'delivery' ? address : `Table ${tableNo} (Dine-in)`,
          notes,
          created_at: new Date().toISOString()
        };

        const existingOrders = JSON.parse(localStorage.getItem('wevibes_user_orders') || '[]');
        existingOrders.unshift(orderData);
        localStorage.setItem('wevibes_user_orders', JSON.stringify(existingOrders));

        setConfirmedOrder(orderData);
        setIsOtpOpen(false);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (err) {
      return { success: false, message: 'Server connection error.' };
    }
  };

  if (confirmedOrder) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso-950/60 backdrop-blur-md animate-fadeIn">
        <div className="bg-white border border-gold/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
            <CheckCircle className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <span className="text-xs uppercase tracking-widest text-gold-dark font-bold">Order Confirmed</span>
            <h3 className="font-serif font-bold text-2xl text-espresso-900">Thank You for Your Order!</h3>
            <p className="text-xs text-espresso-800/70">
              Your order has been verified & sent to the kitchen.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-cream-50 border border-gold/20 text-left text-xs space-y-2">
            <div className="flex justify-between font-bold text-espresso-900 border-b border-cream-200 pb-2">
              <span>Order ID: {confirmedOrder.id}</span>
              <span className="text-gold-dark">{confirmedOrder.totalPrice}</span>
            </div>
            <p><strong>Item:</strong> {confirmedOrder.item} x{confirmedOrder.quantity}</p>
            <p><strong>Type:</strong> {confirmedOrder.orderType}</p>
            <p><strong>Customer:</strong> {confirmedOrder.name} ({confirmedOrder.phone})</p>
            <p><strong>Destination:</strong> {confirmedOrder.address}</p>
          </div>

          <div className="flex flex-col gap-2">
            <a
              href={`https://wa.me/918950191495?text=Hello%20We%20Vibes%20Cafe,%20I%20have%20placed%20Order%20${confirmedOrder.id}%20for%20${confirmedOrder.item}%20(Qty:%20${confirmedOrder.quantity}).%20Type:%20${confirmedOrder.orderType}.`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow flex items-center justify-center gap-2"
            >
              Confirm via WhatsApp
            </a>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-full bg-espresso-800 text-gold-light font-bold text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso-950/60 backdrop-blur-md animate-fadeIn">
        <div className="bg-white border border-gold/30 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
          
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-cream-100 hover:bg-cream-200 text-espresso-800 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Item Header */}
          <div className="flex items-center gap-4 border-b border-cream-200 pb-4 mb-5">
            <img
              src={item.image || '/assets/pink-burger.png'}
              alt={item.name}
              className="w-16 h-16 rounded-2xl object-cover border border-gold/30"
            />
            <div>
              <span className="text-[10px] uppercase font-bold text-gold-dark">{item.category}</span>
              <h3 className="font-serif font-bold text-lg text-espresso-900">{item.name}</h3>
              <p className="font-bold text-gold-dark text-sm">{item.price}</p>
            </div>
          </div>

          {/* Order Type Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-cream-100 mb-6">
            <button
              type="button"
              onClick={() => setOrderType('table')}
              className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                orderType === 'table' ? 'bg-espresso-900 text-gold-light shadow-md' : 'text-espresso-800/70 hover:text-espresso-900'
              }`}
            >
              <Utensils className="w-4 h-4" /> Order at Table
            </button>
            <button
              type="button"
              onClick={() => setOrderType('delivery')}
              className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                orderType === 'delivery' ? 'bg-espresso-900 text-gold-light shadow-md' : 'text-espresso-800/70 hover:text-espresso-900'
              }`}
            >
              <Truck className="w-4 h-4" /> Home Delivery
            </button>
          </div>

          <form onSubmit={handleSubmitOrder} className="space-y-4">
            
            {/* Quantity Selector */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-cream-50 border border-gold/20">
              <span className="text-xs font-bold text-espresso-900">Select Quantity</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-full bg-white border border-gold/30 flex items-center justify-center font-bold"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-bold text-sm w-4 text-center">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-full bg-white border border-gold/30 flex items-center justify-center font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-espresso-900">Your Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 border border-gold/30 text-xs focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-espresso-900">10-Digit Phone *</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  pattern="[0-9]{10}"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 border border-gold/30 text-xs focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-espresso-900">Email Address (for Email OTP) *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. rahul@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 border border-gold/30 text-xs focus:outline-none focus:border-gold"
              />
            </div>

            {orderType === 'table' ? (
              <div>
                <label className="text-xs font-bold text-espresso-900">Table Number *</label>
                <select
                  value={tableNo}
                  onChange={(e) => setTableNo(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 border border-gold/30 text-xs"
                >
                  {[...Array(15)].map((_, i) => (
                    <option key={i + 1} value={`T-${i + 1 < 10 ? '0' + (i + 1) : i + 1}`}>
                      Table T-{i + 1 < 10 ? '0' + (i + 1) : i + 1}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="text-xs font-bold text-espresso-900">Delivery Address *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House/Flat No, Building, Landmark..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 border border-gold/30 text-xs"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-espresso-900">Special Cooking Requests (Optional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Less spicy, extra cheese dip..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 border border-gold/30 text-xs"
              />
            </div>

            {/* Total Price & Submit */}
            <div className="pt-2 flex items-center justify-between border-t border-cream-200">
              <div>
                <span className="text-[10px] uppercase text-espresso-800/60 font-bold block">Total Amount</span>
                <span className="font-serif font-bold text-xl text-gold-dark">₹{totalPrice}</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-gold to-gold-dark hover:from-gold-dark hover:to-gold text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{loading ? 'Sending Email OTP...' : 'Send OTP & Confirm Order'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <OtpModal
        isOpen={isOtpOpen}
        onClose={() => setIsOtpOpen(false)}
        onVerify={handleVerifyOtp}
        targetEmail={email}
        devOtp={devOtp}
        previewUrl={previewUrl}
      />
    </>
  );
}
