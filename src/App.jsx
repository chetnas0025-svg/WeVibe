import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import CustomCursor from './components/CustomCursor';

import Home from './pages/Home';
import Menu from './pages/Menu';
import Reserve from './pages/Reserve';
import Admin from './pages/Admin';

export default function App() {
  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-cream-50 text-espresso-800 font-sans selection:bg-gold-light selection:text-espresso-900">
          <CustomCursor />
          <Header />
          <CartDrawer />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/reserve" element={<Reserve />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </CartProvider>
  );
}
