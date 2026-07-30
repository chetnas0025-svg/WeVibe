import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Phone, Mail, User, Heart, Sparkles, CheckCircle2, MessageSquare } from 'lucide-react';

export default function Reserve() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    date: '',
    time: '12:00',
    guests: '2',
    occasion: 'Casual Dining',
    notes: ''
  });

  const [minDate, setMinDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  useEffect(() => {
    const today = new Date().toLocaleDateString('en-CA');
    setMinDate(today);
    setFormData(prev => ({ ...prev, date: today }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.phone.length !== 10 || !/^\d{10}$/.test(formData.phone)) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      alert("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const newBooking = {
        id: 'WV-' + Math.floor(100000 + Math.random() * 900000),
        ...formData,
        created_at: new Date().toISOString()
      };

      // Save to localStorage for My Account view
      const existingBookings = JSON.parse(localStorage.getItem('wevibes_user_bookings') || '[]');
      existingBookings.unshift(newBooking);
      localStorage.setItem('wevibes_user_bookings', JSON.stringify(existingBookings));

      // Record to PostgreSQL database endpoint
      try {
        await fetch('/api/reservations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            date: formData.date,
            time: formData.time,
            party_size: parseInt(formData.guests, 10),
            occasion_note: `${formData.occasion}${formData.notes ? ' - ' + formData.notes : ''}`,
            status: 'confirmed'
          })
        });
      } catch (dbErr) {
        console.warn("Local DB sync notice:", dbErr.message);
      }

      setConfirmedBooking(newBooking);
    } catch (err) {
      console.error("Booking error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (confirmedBooking) {
    const waText = encodeURIComponent(
      `Hello We Vibes Cafe! 🌸\nI would like to confirm my table reservation:\n\n` +
      `• Booking ID: ${confirmedBooking.id}\n` +
      `• Name: ${confirmedBooking.name}\n` +
      `• Contact: ${confirmedBooking.phone}\n` +
      `• Email: ${confirmedBooking.email}\n` +
      `• Date: ${confirmedBooking.date}\n` +
      `• Time: ${confirmedBooking.time}\n` +
      `• Guests: ${confirmedBooking.guests} Person(s)\n` +
      `• Occasion: ${confirmedBooking.occasion}`
    );

    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-8 animate-fadeIn">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xl">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-3">
          <span className="text-xs uppercase tracking-widest text-gold-dark font-bold">Reservation Reserved</span>
          <h1 className="font-serif text-4xl font-bold text-espresso-900">See You Soon at We Vibes!</h1>
          <p className="text-espresso-800/70 text-base max-w-md mx-auto">
            Your table reservation has been saved! Click below to send your reservation directly to our WhatsApp.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-gold/30 shadow-lg text-left space-y-4 max-w-md mx-auto">
          <div className="flex justify-between items-center pb-3 border-b border-cream-200">
            <span className="text-xs text-gold-dark font-bold uppercase">Booking ID</span>
            <span className="font-mono font-bold text-espresso-900">{confirmedBooking.id}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-espresso-800/60">Guest Name</p>
              <p className="font-semibold text-espresso-900">{confirmedBooking.name}</p>
            </div>
            <div>
              <p className="text-xs text-espresso-800/60">Guests</p>
              <p className="font-semibold text-espresso-900">{confirmedBooking.guests} Person(s)</p>
            </div>
            <div>
              <p className="text-xs text-espresso-800/60">Date</p>
              <p className="font-semibold text-espresso-900">{confirmedBooking.date}</p>
            </div>
            <div>
              <p className="text-xs text-espresso-800/60">Time</p>
              <p className="font-semibold text-espresso-900">{confirmedBooking.time}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <a
            href={`https://wa.me/918950191495?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-xl flex items-center justify-center gap-2 transform hover:scale-105 transition-all"
          >
            <MessageSquare className="w-5 h-5" />
            <span>Confirm Reservation via WhatsApp</span>
          </a>
          <button
            onClick={() => { setConfirmedBooking(null); setFormData(prev => ({ ...prev, name: '', notes: '' })); }}
            className="px-6 py-4 rounded-full bg-espresso-800 hover:bg-espresso-900 text-gold-light font-semibold text-sm shadow-md"
          >
            Book Another Table
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs uppercase tracking-widest text-gold-dark font-bold">Priority Dining</span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-espresso-900">Reserve a Table</h1>
        <p className="max-w-xl mx-auto text-espresso-800/70 text-base">
          Direct table booking with instant WhatsApp confirmation. Hours: <strong>10:00 AM – 10:00 PM</strong>.
        </p>
        <div className="w-16 h-1 bg-gold rounded-full mx-auto" />
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gold/30 shadow-xl space-y-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Row 1: Name & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-espresso-900 flex items-center gap-2">
                <User className="w-4 h-4 text-gold-dark" /> Your Full Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-4 py-3 rounded-xl bg-cream-50 border border-gold/30 text-espresso-900 text-sm focus:outline-none focus:border-gold focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-espresso-900 flex items-center gap-2">
                <Phone className="w-4 h-4 text-gold-dark" /> 10-Digit Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                required
                maxLength={10}
                pattern="[0-9]{10}"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. 9876543210"
                className="w-full px-4 py-3 rounded-xl bg-cream-50 border border-gold/30 text-espresso-900 text-sm focus:outline-none focus:border-gold focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Row 2: Email Address & Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-espresso-900 flex items-center gap-2">
                <Mail className="w-4 h-4 text-gold-dark" /> Email Address *
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. rahul@example.com"
                className="w-full px-4 py-3 rounded-xl bg-cream-50 border border-gold/30 text-espresso-900 text-sm focus:outline-none focus:border-gold focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-espresso-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gold-dark" /> Select Date *
              </label>
              <input
                type="date"
                name="date"
                required
                min={minDate}
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-cream-50 border border-gold/30 text-espresso-900 text-sm focus:outline-none focus:border-gold focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Row 3: Time & Guests */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-espresso-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-gold-dark" /> Select Time (10 AM – 10 PM) *
              </label>
              <input
                type="time"
                name="time"
                required
                min="10:00"
                max="22:00"
                value={formData.time}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-cream-50 border border-gold/30 text-espresso-900 text-sm focus:outline-none focus:border-gold focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-espresso-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-gold-dark" /> Number of Guests *
              </label>
              <select
                name="guests"
                value={formData.guests}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-cream-50 border border-gold/30 text-espresso-900 text-sm focus:outline-none focus:border-gold focus:bg-white transition-all"
              >
                {[...Array(20)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} {i === 0 ? 'Guest' : 'Guests'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4: Occasion & Special Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-espresso-900">Occasion (Optional)</label>
              <select
                name="occasion"
                value={formData.occasion}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-cream-50 border border-gold/30 text-espresso-900 text-sm focus:outline-none focus:border-gold focus:bg-white transition-all"
              >
                <option value="Casual Dining">Casual Dining</option>
                <option value="Birthday Celebration">Birthday Celebration</option>
                <option value="Anniversary">Anniversary</option>
                <option value="Business Meeting">Business Meeting</option>
                <option value="Romantic Date">Romantic Date</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-espresso-900">Special Notes / Seating Request</label>
              <input
                type="text"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="e.g. Window booth preferred, silent corner..."
                className="w-full px-4 py-3 rounded-xl bg-cream-50 border border-gold/30 text-espresso-900 placeholder-espresso-800/40 text-sm focus:outline-none focus:border-gold focus:bg-white transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-full bg-gradient-to-r from-gold via-gold-dark to-gold hover:from-gold-dark hover:to-gold text-white font-bold text-base shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            <span>{loading ? 'Confirming Table...' : 'Confirm Table & Open WhatsApp'}</span>
          </button>
        </form>
      </div>

    </div>
  );
}
