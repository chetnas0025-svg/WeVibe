import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Utensils, Calendar, User, LogIn, Menu as MenuIcon, X, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Explore Menu', path: '/menu' },
    { name: 'Reserve Table', path: '/reserve' },
    { name: 'My Account', path: '/account' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gold-dark/10 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center text-white font-serif font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
              WV
            </div>
            <div>
              <span className="font-serif font-bold text-2xl tracking-tight text-espresso-800 group-hover:text-gold transition-colors">
                We Vibes
              </span>
              <span className="block text-[10px] uppercase tracking-widest text-gold-dark font-medium -mt-1">
                Artisanal Cafe
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-full font-medium text-sm transition-all relative ${
                    isActive
                      ? 'text-gold-dark font-semibold bg-gold-light/20 shadow-sm'
                      : 'text-espresso-800/80 hover:text-espresso-800 hover:bg-cream-100'
                  }`
                }
              >
                {({ isActive }) => (
                  <span className="flex items-center gap-1.5">
                    {item.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-gold-dark rounded-full"></span>
                    )}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right Action Controls */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/account"
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-light/20 text-espresso-800 border border-gold/30 hover:border-gold transition-colors text-sm font-medium"
                >
                  <User className="w-4 h-4 text-gold-dark" />
                  <span>{user.name || user.username}</span>
                </Link>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-5 py-2 rounded-full bg-espresso-800 hover:bg-espresso-900 text-gold-light font-medium text-sm shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            )}

            <Link
              to="/reserve"
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-gold to-gold-dark hover:from-gold-dark hover:to-gold text-white font-medium text-sm shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Table</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-espresso-800 hover:bg-cream-100 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-cream-200 px-4 pt-2 pb-6 space-y-3 shadow-xl">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-2.5 rounded-xl text-base font-medium transition-colors ${
                  isActive
                    ? 'bg-gold-light/20 text-gold-dark font-bold'
                    : 'text-espresso-800/80 hover:bg-cream-100'
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
          <div className="pt-4 border-t border-cream-200 flex flex-col gap-2">
            {user ? (
              <Link
                to="/account"
                onClick={() => setMobileOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-cream-100 text-espresso-800 font-medium"
              >
                My Account ({user.username})
              </Link>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-espresso-800 text-gold-light font-medium"
              >
                Sign In (user123)
              </Link>
            )}
            <Link
              to="/reserve"
              onClick={() => setMobileOpen(false)}
              className="w-full text-center py-2.5 rounded-xl bg-gold text-white font-semibold"
            >
              Book a Table
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
