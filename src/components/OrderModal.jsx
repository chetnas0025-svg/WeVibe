import React, { useState, useEffect } from 'react';
import { X, Utensils, Truck, Phone, Mail, User, MapPin, Sparkles, Plus, Minus, CheckCircle, MessageSquare } from 'lucide-react';

export default function OrderModal({ isOpen, onClose, item, initialType = 'table' }) {
  const [orderType, setOrderType] = useState('table'); // 'table' | 'delivery'
  const [quantity, setQuantity] = useState(1);
  const [tableNo, setTableNo] = useState('T-01');
  const [address, setAddress] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setOrderType(initialType);
      setQuantity(1);
      setConfirmedOrder(null);
    }
  }, [isOpen, item, initialType]);

  if (!isOpen || !item) return null;

  const priceNum = parseInt(item.price.replace(/[^0-9]/g, '') || '199', 10);
  const totalPrice = priceNum * quantity;

  const handleConfirmOrder = async (e) => {
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

      // Save to localStorage for My Account view
      const existingOrders = JSON.parse(localStorage.getItem('wevibes_user_orders') || '[]');
      existingOrders.unshift(orderData);
      localStorage.setItem('wevibes_user_orders', JSON.stringify(existingOrders));

      setConfirmedOrder(orderData);
    } catch (err) {
      alert("Order creation error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (confirmedOrder) {
    const waText = encodeURIComponent(
      `Hello We Vibes Cafe! 🌸\nI would like to place an order:\n\n` +
      `• Order ID: ${confirmedOrder.id}\n` +
      `• Item: ${confirmedOrder.item} (Qty: ${confirmedOrder.quantity})\n` +
      `• Total Amount: ${confirmedOrder.totalPrice}\n` +
      `• Order Type: ${confirmedOrder.orderType}\n` +
      `• Customer Name: ${confirmedOrder.name}\n` +
      `• Contact Phone: ${confirmedOrder.phone}\n` +
      `• Location/Address: ${confirmedOrder.address}\n` +
      (confirmedOrder.notes ? `• Special Notes: ${confirmedOrder.notes}` : '')
    );

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso-950/70 backdrop-blur-md animate-fadeIn">
        <div className="bg-white border border-gold/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-6 animate-scaleUp">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
            <CheckCircle className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <span className="text-xs uppercase tracking-widest text-gold-dark font-bold">Fast Order Placed</span>
            <h3 className="font-serif font-bold text-2xl text-espresso-900">Order Confirmed!</h3>
            <p className="text-xs text-espresso-800/70">
              Your order has been recorded. Click below to send directly to WhatsApp.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-cream-50 border border-gold/20 text-left text-xs space-y-2">
            <div className="flex justify-between font-bold text-espresso-900 border-b border-cream-200 pb-2">
              <span>Order ID: {confirmedOrder.id}</span>
              <span className="text-gold-dark font-serif text-sm">{confirmedOrder.totalPrice}</span>
            </div>
            <p><strong>Item:</strong> {confirmedOrder.item} x{confirmedOrder.quantity}</p>
            <p><strong>Type:</strong> {confirmedOrder.orderType}</p>
            <p><strong>Customer:</strong> {confirmedOrder.name} ({confirmedOrder.phone})</p>
            <p><strong>Location:</strong> {confirmedOrder.address}</p>
          </div>

          <div className="flex flex-col gap-2.5">
            <a
              href={`https://wa.me/918950191495?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transform hover:scale-105 transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Confirm Order on WhatsApp</span>
            </a>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-full bg-espresso-800 text-gold-light font-bold text-sm hover:bg-espresso-900"
            >
              Close Window
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso-950/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-white border border-gold/30 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto animate-scaleUp">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-cream-100 hover:bg-cream-200 text-espresso-800 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Item Summary Card */}
        <div className="flex items-center gap-4 border-b border-cream-200 pb-4 mb-5">
          <img
            src={item.image || '/assets/pink-burger.png'}
            alt={item.name}
            className="w-16 h-16 rounded-2xl object-cover border border-gold/30 shadow-sm"
          />
          <div>
            <span className="text-[10px] uppercase font-bold text-gold-dark tracking-wider">{item.category}</span>
            <h3 className="font-serif font-bold text-lg text-espresso-900">{item.name}</h3>
            <p className="font-bold text-gold-dark text-sm">{item.price}</p>
          </div>
        </div>

        {/* Order Type Toggle Pills */}
        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-cream-100 mb-6">
          <button
            type="button"
            onClick={() => setOrderType('table')}
            className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              orderType === 'table' ? 'bg-espresso-900 text-gold-light shadow-md scale-105' : 'text-espresso-800/70 hover:text-espresso-900'
            }`}
          >
            <Utensils className="w-4 h-4 text-gold" /> Order at Table
          </button>
          <button
            type="button"
            onClick={() => setOrderType('delivery')}
            className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              orderType === 'delivery' ? 'bg-espresso-900 text-gold-light shadow-md scale-105' : 'text-espresso-800/70 hover:text-espresso-900'
            }`}
          >
            <Truck className="w-4 h-4 text-gold" /> Home Delivery
          </button>
        </div>

        <form onSubmit={handleConfirmOrder} className="space-y-4">
          
          {/* Quantity Selector */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-cream-50 border border-gold/20">
            <span className="text-xs font-bold text-espresso-900">Quantity</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-full bg-white border border-gold/30 flex items-center justify-center font-bold hover:bg-gold-light/20"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-bold text-sm w-4 text-center">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-full bg-white border border-gold/30 flex items-center justify-center font-bold hover:bg-gold-light/20"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Customer Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-espresso-900">Your Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 border border-gold/30 text-xs focus:outline-none focus:border-gold focus:bg-white"
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 border border-gold/30 text-xs focus:outline-none focus:border-gold focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-espresso-900">Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. rahul@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 border border-gold/30 text-xs focus:outline-none focus:border-gold focus:bg-white"
            />
          </div>

          {orderType === 'table' ? (
            <div>
              <label className="text-xs font-bold text-espresso-900">Select Table Number *</label>
              <select
                value={tableNo}
                onChange={(e) => setTableNo(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 border border-gold/30 text-xs focus:outline-none focus:border-gold"
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
              <label className="text-xs font-bold text-espresso-900">Full Delivery Address *</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House No, Street, Landmark..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 border border-gold/30 text-xs focus:outline-none focus:border-gold focus:bg-white"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-espresso-900">Special Cooking Request (Optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Less spicy, extra cheese dip..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 border border-gold/30 text-xs focus:outline-none focus:border-gold"
            />
          </div>

          {/* Action Footer */}
          <div className="pt-3 flex items-center justify-between border-t border-cream-200">
            <div>
              <span className="text-[10px] uppercase text-espresso-800/60 font-bold block">Total Amount</span>
              <span className="font-serif font-bold text-xl text-gold-dark">₹{totalPrice}</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3.5 rounded-full bg-gradient-to-r from-gold via-gold-dark to-gold hover:from-gold-dark hover:to-gold text-white font-bold text-xs shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2 animate-glow"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Processing...' : 'Confirm & Open WhatsApp'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
