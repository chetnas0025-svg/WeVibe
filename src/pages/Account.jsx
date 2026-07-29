import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Calendar, Clock, MapPin, Heart, Shield, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userBookings, setUserBookings] = useState([]);

  useEffect(() => {
    const savedBookings = JSON.parse(localStorage.getItem('wevibes_user_bookings') || '[]');
    setUserBookings(savedBookings);
  }, []);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-gold-light/20 text-gold-dark flex items-center justify-center mx-auto">
          <User className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-3xl font-bold text-espresso-900">My Account Access</h2>
        <p className="text-espresso-800/70 text-sm">
          Please sign in to view your profile, active reservations, and saved favorite dishes.
        </p>
        <div className="pt-2 flex flex-col gap-3">
          <Link
            to="/login"
            className="w-full py-3.5 rounded-full bg-espresso-800 hover:bg-espresso-900 text-gold-light font-bold text-sm shadow-md"
          >
            Sign In (user123 / pass123)
          </Link>
          <Link
            to="/reserve"
            className="w-full py-3.5 rounded-full bg-gold text-white font-bold text-sm shadow-md"
          >
            Make a Reservation
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-8 border border-gold/20 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold to-gold-dark text-white font-serif font-bold text-3xl flex items-center justify-center shadow-lg">
            {user.name ? user.name.charAt(0) : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl font-bold text-espresso-900">{user.name || user.username}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-gold-light/30 text-gold-dark text-xs font-bold">
                VIP Member
              </span>
            </div>
            <p className="text-sm text-espresso-800/70">{user.email || 'user@wevibes.com'}</p>
            <p className="text-xs text-espresso-800/50 mt-1">Member since: {user.joinedDate || 'July 2026'}</p>
          </div>
        </div>

        <button
          onClick={() => { logout(); navigate('/'); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-cream-100 hover:bg-red-50 text-espresso-800 hover:text-red-600 font-medium text-sm border border-gold/20 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Bookings History */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif font-bold text-2xl text-espresso-900">Your Table Reservations</h2>
          <Link to="/reserve" className="text-gold-dark hover:text-gold font-bold text-sm">
            + New Reservation
          </Link>
        </div>

        {userBookings.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white border border-gold/20 text-center space-y-3">
            <p className="text-espresso-800/70 text-sm">No active reservations found.</p>
            <Link
              to="/reserve"
              className="inline-block px-6 py-2.5 rounded-full bg-gold text-white font-medium text-sm shadow"
            >
              Book a Table Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userBookings.map((b) => (
              <div key={b.id} className="bg-white rounded-3xl p-6 border border-gold/30 shadow-md space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-cream-200">
                  <span className="font-mono font-bold text-xs text-gold-dark">{b.id}</span>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Verified
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-espresso-800/60">Date</p>
                    <p className="font-semibold text-espresso-900 flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-gold-dark" /> {b.date}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-espresso-800/60">Time</p>
                    <p className="font-semibold text-espresso-900 flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-gold-dark" /> {b.time}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-espresso-800/60">Party Size</p>
                    <p className="font-semibold text-espresso-900">{b.guests} Guests</p>
                  </div>
                  <div>
                    <p className="text-xs text-espresso-800/60">Occasion</p>
                    <p className="font-semibold text-espresso-900">{b.occasion || 'Casual'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
