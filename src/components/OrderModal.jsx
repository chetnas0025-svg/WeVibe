import React, { useState, useEffect } from 'react';
import { X, Utensils, Truck, Phone, Mail, User, MapPin, Sparkles, Plus, Minus, CheckCircle, MessageSquare, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function OrderModal({ isOpen, onClose, item, initialType = 'table' }) {
  const { user } = useAuth();

  const [orderType, setOrderType] = useState('table');
  const [quantity, setQuantity] = useState(1);
  const [tableNo, setTableNo] = useState('T-01');
  const [address, setAddress] = useState('Civil Lines, Main Boulevard, Sector 14');
  const [name, setName] = useState(user?.name || 'Rahul Sharma');
  const [phone, setPhone] = useState(user?.phone || '9876543210');
  const [email, setEmail] = useState(user?.email || 'user@wevibes.com');
  const [notes, setNotes] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setOrderType(initialType);
      setQuantity(1);
      setConfirmedOrder(null);
      if (user) {
        setName(user.name || 'Rahul Sharma');
        setPhone(user.phone || '9876543210');
        setEmail(user.email || 'user@wevibes.com');
      }
    }
  }, [isOpen, item, initialType, user]);

  if (!isOpen || !item) return null;

  const priceNum = parseInt(item.price.replace(/[^0-9]/g, '') || '199', 10);
  const totalPrice = priceNum * quantity;

  // Direct 1-Click Instant WhatsApp Trigger
  const triggerInstantWhatsApp = () => {
    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const dest = orderType === 'table' ? `Table ${tableNo} (Dine-in)` : address;

    const waText = encodeURIComponent(
      `Hello We Vibes Cafe! 🌸\nINSTANT ORDER PLACED:\n\n` +
      `• Order ID: ${orderId}\n` +
      `• Item: ${item.name} (Qty: ${quantity})\n` +
      `• Price: ₹${totalPrice}\n` +
      `• Order Type: ${orderType === 'table' ? 'Table Order (' + tableNo + ')' : 'Home Delivery'}\n` +
      `• Customer: ${name} (${phone})\n` +
      `• Destination: ${dest}\n` +
      (notes ? `• Special Notes: ${notes}` : '')
    );

    const orderData = {
      id: orderId,
      item: item.name,
      quantity,
      totalPrice: `₹${totalPrice}`,
      orderType: orderType === 'table' ? `Table Order (${tableNo})` : 'Home Delivery',
      name,
      phone,
      email,
      address: dest,
      notes,
      created_at: new Date().toISOString()
    };

    const existingOrders = JSON.parse(localStorage.getItem('wevibes_user_orders') || '[]');
    existingOrders.unshift(orderData);
    localStorage.setItem('wevibes_user_orders', JSON.stringify(existingOrders));

    window.open(`https://wa.me/918950191495?text=${waText}`, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso-950/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-white border border-gold/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto animate-scaleUp">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-cream-100 hover:bg-cream-200 text-espresso-800 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Item Card Header */}
        <div className="flex items-center gap-4 border-b border-cream-200 pb-4 mb-5">
          <img
            src={item.image || '/assets/pink-burger.png'}
            alt={item.name}
            className="w-16 h-16 rounded-2xl object-cover border border-gold/30 shadow-md"
          />
          <div>
            <span className="text-[10px] uppercase font-bold text-gold-dark tracking-wider">{item.category}</span>
            <h3 className="font-serif font-bold text-lg text-espresso-900">{item.name}</h3>
            <p className="font-bold text-gold-dark text-sm">{item.price}</p>
          </div>
        </div>

        {/* Mode Toggle */}
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

        <div className="space-y-4">
          
          {/* Quantity Selector */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-cream-50 border border-gold/20">
            <span className="text-xs font-bold text-espresso-900">Quantity</span>
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

          {/* Quick Pre-filled Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-espresso-900">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-cream-50 border border-gold/30 text-xs focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-espresso-900">10-Digit Phone</label>
              <input
                type="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-cream-50 border border-gold/30 text-xs focus:outline-none focus:border-gold"
              />
            </div>
          </div>

          {orderType === 'table' ? (
            <div>
              <label className="text-[11px] font-bold text-espresso-900">Table Number</label>
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
              <label className="text-[11px] font-bold text-espresso-900">Delivery Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-cream-50 border border-gold/30 text-xs focus:outline-none focus:border-gold"
              />
            </div>
          )}

          {/* Instant 1-Click Action Button */}
          <div className="pt-3 border-t border-cream-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-espresso-800/70 font-semibold">Total Price:</span>
              <span className="font-serif font-bold text-xl text-gold-dark">₹{totalPrice}</span>
            </div>

            <button
              onClick={triggerInstantWhatsApp}
              className="w-full py-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 flex items-center justify-center gap-2 animate-glow"
            >
              <Zap className="w-5 h-5 fill-white text-white" />
              <span>1-Click Order via WhatsApp (Instant)</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
