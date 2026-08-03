import React, { useState } from 'react';
import { X, ShoppingBag, Trash2, Plus, Minus, Utensils, Truck, CreditCard, Banknote, Sparkles, MessageSquare, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import PaymentModal from './PaymentModal';

export default function CartDrawer() {
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, clearCart, totalPrice, totalItemCount } = useCart();

  const [orderType, setOrderType] = useState('table'); // 'table' | 'delivery'
  const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' | 'cash'
  const [tableNo, setTableNo] = useState('T-01');
  const [address, setAddress] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  if (!isCartOpen) return null;

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();

    if (phone.length !== 10 || !/^\d{10}$/.test(phone)) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    if (orderType === 'delivery' && !address.trim()) {
      alert("Please enter your home delivery address.");
      return;
    }

    if (paymentMethod === 'online') {
      // Trigger Payment Gateway Screen
      setIsPaymentModalOpen(true);
    } else {
      // Direct Cash Checkout
      triggerWhatsAppOrder('PAY-ON-DELIVERY');
    }
  };

  const triggerWhatsAppOrder = (txnRef = 'CASH') => {
    const orderId = 'WV-ORD-' + Math.floor(100000 + Math.random() * 900000);
    const dest = orderType === 'table' ? `Table ${tableNo} (Dine-in)` : address;

    const itemsSummary = cartItems
      .map((item) => `  • ${item.name} x${item.quantity} = ₹${(parseInt(item.price.replace(/[^0-9]/g, '') || '0', 10) * item.quantity)}`)
      .join('\n');

    const paymentText = paymentMethod === 'online'
      ? `Online Payment Verified ✅ (Txn ID: ${txnRef})`
      : 'Cash / Pay at Counter';

    const waText = encodeURIComponent(
      `🌸✨ *WE VIBES CAFE — NEW GOURMET ORDER* ✨🌸\n\n` +
      `Hello We Vibes Team! I would love to place this order:\n\n` +
      `📋 *ORDER ID:* ${orderId}\n\n` +
      `🛍️ *SELECTED ITEMS:*\n${itemsSummary}\n\n` +
      `💰 *TOTAL AMOUNT:* ₹${totalPrice}\n` +
      `📌 *ORDER TYPE:* ${orderType === 'table' ? '🍽️ Order at Table (' + tableNo + ')' : '🚚 Home Delivery'}\n` +
      `💳 *PAYMENT STATUS:* ${paymentText}\n\n` +
      `👤 *CUSTOMER DETAILS:*\n` +
      `• Name: ${name || 'Valued Guest'}\n` +
      `• Phone: ${phone}\n` +
      (email ? `• Email: ${email}\n` : '') +
      `• Destination: ${dest}\n` +
      (notes ? `• Special Notes: ${notes}\n` : '') +
      `\n💖 *GRATEFUL MESSAGE:*\n` +
      `"Thank you so much for taking my order! I am super excited to taste your handcrafted creations at We Vibes Cafe! 🌸☕✨"`
    );

    window.open(`https://wa.me/918950191495?text=${waText}`, '_blank');
    setIsCartOpen(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
        {/* Backdrop */}
        <div
          onClick={() => setIsCartOpen(false)}
          className="absolute inset-0 bg-espresso-950/60 backdrop-blur-sm transition-opacity"
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <div className="w-screen max-w-md bg-white border-l border-gold/30 shadow-2xl flex flex-col justify-between animate-scaleUp">
            
            {/* Header */}
            <div className="p-6 border-b border-cream-200 flex items-center justify-between bg-espresso-900 text-cream-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold-light font-bold">
                  <ShoppingBag className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-xl text-white">Your Food Cart</h2>
                  <p className="text-xs text-gold-light">{totalItemCount} {totalItemCount === 1 ? 'Item' : 'Items'} selected</p>
                </div>
              </div>

              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-full hover:bg-white/10 text-cream-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List or Empty State */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cartItems.length === 0 ? (
                <div className="text-center py-16 space-y-4">
                  <div className="w-20 h-20 rounded-full bg-cream-100 text-gold-dark flex items-center justify-center mx-auto shadow-inner">
                    <ShoppingBag className="w-10 h-10" />
                  </div>
                  <h3 className="font-serif font-bold text-xl text-espresso-900">Your Cart is Empty</h3>
                  <p className="text-xs text-espresso-800/70 max-w-xs mx-auto">
                    Browse our gourmet menu and tap "+ Add to Cart" on your favorite dishes!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-cream-50 border border-gold/20 flex items-center justify-between gap-3 shadow-sm hover:border-gold/50 transition-all"
                    >
                      <img
                        src={item.image || '/assets/pink-burger.png'}
                        alt={item.name}
                        className="w-14 h-14 rounded-xl object-cover border border-gold/30 shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif font-bold text-sm text-espresso-900 truncate">{item.name}</h4>
                        <p className="text-xs font-bold text-gold-dark mt-0.5">{item.price}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-7 h-7 rounded-lg bg-white border border-gold/30 flex items-center justify-center font-bold text-espresso-800 hover:bg-cream-200"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-bold text-xs w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-7 h-7 rounded-lg bg-white border border-gold/30 flex items-center justify-center font-bold text-espresso-800 hover:bg-cream-200"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 transition-colors"
                        title="Remove Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {/* Checkout Options Form */}
                  <form onSubmit={handleCheckoutSubmit} className="pt-4 border-t border-cream-200 space-y-4">
                    <span className="text-xs uppercase tracking-wider font-bold text-gold-dark block">
                      Order Options & Payment Selection
                    </span>

                    {/* 1. Order Type Pill */}
                    <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-cream-100">
                      <button
                        type="button"
                        onClick={() => setOrderType('table')}
                        className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                          orderType === 'table' ? 'bg-espresso-900 text-gold-light shadow' : 'text-espresso-800/70'
                        }`}
                      >
                        <Utensils className="w-3.5 h-3.5 text-gold" /> Order at Table
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrderType('delivery')}
                        className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                          orderType === 'delivery' ? 'bg-espresso-900 text-gold-light shadow' : 'text-espresso-800/70'
                        }`}
                      >
                        <Truck className="w-3.5 h-3.5 text-gold" /> Home Delivery
                      </button>
                    </div>

                    {/* 2. Payment Method Pill */}
                    <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-cream-100">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('online')}
                        className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                          paymentMethod === 'online' ? 'bg-emerald-700 text-white shadow' : 'text-espresso-800/70'
                        }`}
                      >
                        <CreditCard className="w-3.5 h-3.5" /> Online Payment
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cash')}
                        className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                          paymentMethod === 'cash' ? 'bg-emerald-700 text-white shadow' : 'text-espresso-800/70'
                        }`}
                      >
                        <Banknote className="w-3.5 h-3.5" /> Cash on Delivery
                      </button>
                    </div>

                    {/* Inputs */}
                    {orderType === 'table' ? (
                      <div>
                        <label className="text-[11px] font-bold text-espresso-900">Select Table Number *</label>
                        <select
                          value={tableNo}
                          onChange={(e) => setTableNo(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-cream-50 border border-gold/30 text-xs focus:outline-none focus:border-gold"
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
                        <label className="text-[11px] font-bold text-espresso-900">Delivery Address *</label>
                        <input
                          type="text"
                          required
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="House No, Landmark, Sector..."
                          className="w-full px-3 py-2 rounded-xl bg-cream-50 border border-gold/30 text-xs focus:outline-none focus:border-gold"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-espresso-900">Your Name</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Rahul Sharma"
                          className="w-full px-3 py-2 rounded-xl bg-cream-50 border border-gold/30 text-xs focus:outline-none focus:border-gold"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-espresso-900">10-Digit Phone *</label>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          pattern="[0-9]{10}"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. 9876543210"
                          className="w-full px-3 py-2 rounded-xl bg-cream-50 border border-gold/30 text-xs focus:outline-none focus:border-gold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-espresso-900">Cooking Notes (Optional)</label>
                      <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="e.g. Extra cheese dip, medium spicy..."
                        className="w-full px-3 py-2 rounded-xl bg-cream-50 border border-gold/30 text-xs focus:outline-none focus:border-gold"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2 transform hover:scale-105 transition-all animate-glow"
                    >
                      <MessageSquare className="w-5 h-5 fill-white text-white" />
                      <span>{paymentMethod === 'online' ? 'Proceed to Online Payment Gateway' : 'Confirm Order via WhatsApp'}</span>
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Footer Total */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-cream-200 bg-cream-50 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-espresso-800/60 block">Total Cart Value</span>
                  <span className="font-serif font-bold text-2xl text-gold-dark">₹{totalPrice}</span>
                </div>
                <button
                  onClick={clearCart}
                  className="text-xs text-rose-600 font-semibold hover:underline"
                >
                  Clear Cart
                </button>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Payment Gateway Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        totalPrice={totalPrice}
        onPaymentSuccess={(txnId) => triggerWhatsAppOrder(txnId)}
      />
    </>
  );
}
