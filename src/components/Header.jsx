import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Coffee, ShoppingBag, Menu, X, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItemCount, setIsCartOpen } = useCart();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Explore Menu', path: '/menu' },
    { name: 'Reserve Table', path: '/reserve' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gold/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gold via-gold-dark to-gold-rose flex items-center justify-center text-white font-serif font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
              WV
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-2xl tracking-tight text-espresso-900 leading-none">
                We Vibes
              </span>
              <span className="text-[10px] uppercase tracking-widest text-gold-dark font-medium mt-0.5">
                Artisanal Cafe
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 bg-cream-100/70 p-1.5 rounded-full border border-gold/20">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `px-6 py-2 rounded-full font-medium text-sm transition-all duration-300 ${
                    isActive
                      ? 'bg-espresso-900 text-gold-light shadow-md font-semibold scale-105'
                      : 'text-espresso-800 hover:text-espresso-950 hover:bg-white/60'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Cart Drawer Trigger Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative px-5 py-2.5 rounded-full bg-gradient-to-r from-gold to-gold-dark hover:from-gold-dark hover:to-gold text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 transform hover:scale-105 animate-glow"
            >
              <ShoppingBag className="w-4 h-4 text-white" />
              <span className="hidden sm:inline">My Cart</span>
              {totalItemCount > 0 && (
                <span className="ml-1 w-5 h-5 rounded-full bg-espresso-900 text-gold-light text-[11px] font-bold flex items-center justify-center shadow">
                  {totalItemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-espresso-800 hover:bg-cream-100 transition-colors"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gold/20 px-4 pt-3 pb-6 space-y-3 animate-fadeIn">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                  isActive
                    ? 'bg-espresso-900 text-gold-light font-bold'
                    : 'text-espresso-800 hover:bg-cream-100'
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}
