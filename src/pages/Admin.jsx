import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Users, Calendar, CheckCircle, RefreshCw, LogOut } from 'lucide-react';

export default function Admin() {
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [email, setEmail] = useState('admin@pinkandbluecafe.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [reservations, setReservations] = useState([]);
  const [fetchingRes, setFetchingRes] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem('local_admin_session');
    if (session) {
      setIsAdminAuth(true);
      fetchReservations();
    }
  }, []);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsAdminAuth(true);
        localStorage.setItem('local_admin_session', JSON.stringify({ email }));
        fetchReservations();
      } else {
        setError(data.message || 'Invalid admin credentials.');
      }
    } catch (err) {
      setError('Connection error. Try local dev login.');
    } finally {
      setLoading(false);
    }
  };

  const fetchReservations = async () => {
    setFetchingRes(true);
    try {
      const res = await fetch('/api/reservations');
      if (res.ok) {
        const data = await res.json();
        setReservations(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch reservations", err);
    } finally {
      setFetchingRes(false);
    }
  };

  const handleLogout = () => {
    setIsAdminAuth(false);
    localStorage.removeItem('local_admin_session');
  };

  if (!isAdminAuth) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-gold-light/20 text-gold-dark flex items-center justify-center mx-auto mb-2">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-espresso-900">Admin Control Panel</h1>
          <p className="text-espresso-800/70 text-sm">Management & Operations System</p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-gold/30 shadow-xl space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-espresso-900">Admin Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-cream-50 border border-gold/30 text-espresso-900 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-espresso-900">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-cream-50 border border-gold/30 text-espresso-900 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-espresso-900 hover:bg-espresso-800 text-gold-light font-bold text-sm shadow-md"
            >
              {loading ? 'Authenticating...' : 'Sign In to Admin Panel'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gold/20 shadow-sm">
        <div>
          <h1 className="font-serif text-3xl font-bold text-espresso-900">Admin Dashboard</h1>
          <p className="text-sm text-espresso-800/70">We Vibes Cafe Live Reservations & Operations</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchReservations}
            disabled={fetchingRes}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-cream-100 hover:bg-cream-200 text-espresso-800 font-medium text-sm transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${fetchingRes ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 hover:bg-red-100 text-red-600 font-medium text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Reservations Table */}
      <div className="bg-white rounded-3xl border border-gold/20 shadow-md overflow-hidden space-y-4 p-6">
        <h2 className="font-serif font-bold text-xl text-espresso-900">Live PostgreSQL Table Reservations</h2>

        {reservations.length === 0 ? (
          <p className="text-espresso-800/60 text-sm py-8 text-center">No reservations found in database.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-espresso-800">
              <thead className="bg-cream-100 text-xs font-semibold uppercase text-espresso-900">
                <tr>
                  <th className="p-3">Customer Name</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Time</th>
                  <th className="p-3">Guests</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {reservations.map((r, idx) => (
                  <tr key={idx} className="hover:bg-cream-50/50">
                    <td className="p-3 font-semibold text-espresso-900">{r.name}</td>
                    <td className="p-3 font-mono text-xs">{r.phone}</td>
                    <td className="p-3 font-mono text-xs">{r.email || 'N/A'}</td>
                    <td className="p-3">{r.date}</td>
                    <td className="p-3">{r.time}</td>
                    <td className="p-3 font-bold">{r.party_size || r.guests}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                        {r.status || 'Confirmed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
