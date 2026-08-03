import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, Globe, Share2, MessageCircle, Send, Heart } from 'lucide-react';

export default function Footer() {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-espresso-900 text-cream-100 pt-16 pb-12 border-t border-gold-dark/20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Brand & About */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center text-white font-serif font-bold text-xl shadow-md">
                WV
              </div>
              <span className="font-serif font-bold text-2xl tracking-tight text-cream-50">
                We Vibes
              </span>
            </div>
            <p className="text-cream-200/70 text-sm leading-relaxed">
              Crafting unforgettable culinary experiences in a luxurious, cozy ambiance. Premium gourmet beverages, signature dishes, and artisanal desserts.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <a href="#" className="w-9 h-9 rounded-full bg-espresso-800 hover:bg-gold text-cream-100 hover:text-espresso-900 flex items-center justify-center transition-colors">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-espresso-800 hover:bg-gold text-cream-100 hover:text-espresso-900 flex items-center justify-center transition-colors">
                <Share2 className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-espresso-800 hover:bg-gold text-cream-100 hover:text-espresso-900 flex items-center justify-center transition-colors">
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-lg text-gold-light tracking-wide">Quick Links</h3>
            <ul className="space-y-2.5 text-sm text-cream-200/70">
              <li>
                <Link to="/" className="hover:text-gold transition-colors flex items-center gap-1.5">
                  <span>•</span> Home
                </Link>
              </li>
              <li>
                <Link to="/menu" className="hover:text-gold transition-colors flex items-center gap-1.5">
                  <span>•</span> Explore Menu
                </Link>
              </li>
              <li>
                <Link to="/reserve" className="hover:text-gold transition-colors flex items-center gap-1.5">
                  <span>•</span> Reserve a Table
                </Link>
              </li>
            </ul>
          </div>

          {/* Hours & Contact */}
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-lg text-gold-light tracking-wide">Hours & Contact</h3>
            <div className="space-y-3 text-sm text-cream-200/70">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-cream-100">Monday – Sunday</p>
                  <p className="text-xs text-gold-light">10:00 AM – 10:00 PM</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-gold shrink-0" />
                <span>+91 89501 91495</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-gold shrink-0" />
                <span>reservations@wevibescafe.com</span>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <span>Civil Lines, Main Boulevard, Sector 14</span>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-lg text-gold-light tracking-wide">Newsletter</h3>
            <p className="text-cream-200/70 text-sm">
              Subscribe to get exclusive secret menu offers and special event invitations.
            </p>
            {subscribed ? (
              <div className="p-3.5 rounded-xl bg-gold/20 border border-gold/40 text-gold-light text-sm font-medium">
                ✨ Thank you for subscribing!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-2.5 rounded-xl bg-espresso-800 border border-gold-dark/30 text-cream-100 placeholder-cream-200/40 text-sm focus:outline-none focus:border-gold transition-colors pr-10"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1.5 p-1.5 rounded-lg bg-gold hover:bg-gold-dark text-espresso-900 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-espresso-800 text-center text-xs text-cream-200/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} We Vibes Cafe. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for exquisite dining
          </p>
        </div>
      </div>
    </footer>
  );
}
