import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Calendar, Utensils, Star, Coffee, ShieldCheck, Heart, ArrowRight } from 'lucide-react';

export default function Home() {
  const signatureDishes = [
    {
      id: 1,
      name: 'Signature Pink Burger',
      category: 'Gourmet Mains',
      price: '₹349',
      image: '/assets/pink-burger.png',
      desc: 'Artisanal pink beetroot brioche bun with smoked double cheese patty, caramelized onions & house special secret sauce.',
      rating: 4.9
    },
    {
      id: 2,
      name: 'Ocean Blue Curacao',
      category: 'Signature Beverages',
      price: '₹229',
      image: '/assets/blue-curacao.png',
      desc: 'Refreshing citrus mocktail layered with natural blue curacao, sparkling soda, fresh mint & maraschino cherry.',
      rating: 4.8
    },
    {
      id: 3,
      name: 'Kitty Blossom Waffle',
      category: 'Artisanal Desserts',
      price: '₹289',
      image: '/assets/kitty-waffle.png',
      desc: 'Fluffy Belgian waffle topped with strawberry chocolate drizzle, whipped cream, sprinkles & organic berry gelato.',
      rating: 5.0
    }
  ];

  const testimonials = [
    {
      name: 'Ananya Sharma',
      role: 'Food Critic & Blogger',
      comment: 'The ambiance at We Vibes is pure magic! The signature pink burger and blue curacao mocktail are absolute showstoppers.',
      rating: 5
    },
    {
      name: 'Rohan Verma',
      role: 'Regular Visitor',
      comment: 'Flawless table reservation experience via email OTP. Great food quality and exceptionally warm hospitality.',
      rating: 5
    },
    {
      name: 'Priya Nair',
      role: 'Event Host',
      comment: 'Hosted my birthday celebration here. The aesthetic dessert plating and seating arrangement were top notch!',
      rating: 5
    }
  ];

  return (
    <div className="space-y-20 pb-20">
      
      {/* HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center bg-espresso-900 text-cream-50 overflow-hidden">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/assets/hero-bg.png"
            alt="We Vibes Cafe Ambiance"
            className="w-full h-full object-cover object-center opacity-35 scale-105 transition-transform duration-1000 hover:scale-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-espresso-900 via-espresso-900/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center space-y-6 pt-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/20 border border-gold/40 text-gold-light text-xs font-semibold uppercase tracking-widest backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" /> Welcome to We Vibes Cafe
          </div>
          
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-tight">
            Where Taste Meets <br />
            <span className="gold-gradient-text italic font-normal">Artisanal Luxury</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-cream-200/80 text-base sm:text-lg leading-relaxed">
            Experience handcrafted gourmet coffee, signature savory creations, and exquisite desserts in a cozy, aesthetic sanctuary.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/reserve"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-gold to-gold-dark hover:from-gold-dark hover:to-gold text-white font-semibold text-base shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              <Calendar className="w-5 h-5" />
              <span>Book a Table</span>
            </Link>
            <Link
              to="/menu"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 text-cream-50 font-medium text-base border border-white/20 backdrop-blur-md transition-all flex items-center justify-center gap-2"
            >
              <Utensils className="w-5 h-5" />
              <span>Explore Menu</span>
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES HIGHLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-white border border-gold/20 shadow-lg hover:shadow-xl transition-all space-y-4 group">
            <div className="w-14 h-14 rounded-2xl bg-gold-light/20 text-gold-dark flex items-center justify-center group-hover:scale-110 transition-transform">
              <Coffee className="w-7 h-7" />
            </div>
            <h3 className="font-serif font-bold text-xl text-espresso-900">Artisanal Coffee</h3>
            <p className="text-espresso-800/70 text-sm leading-relaxed">
              Sourced from single-origin organic coffee beans, freshly roasted & brewed to perfection by master baristas.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-gold/20 shadow-lg hover:shadow-xl transition-all space-y-4 group">
            <div className="w-14 h-14 rounded-2xl bg-gold-light/20 text-gold-dark flex items-center justify-center group-hover:scale-110 transition-transform">
              <Utensils className="w-7 h-7" />
            </div>
            <h3 className="font-serif font-bold text-xl text-espresso-900">Gourmet Creations</h3>
            <p className="text-espresso-800/70 text-sm leading-relaxed">
              From our famous Pink Brioche Burgers to handcrafted artisan desserts, every dish is a visual and culinary delight.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-gold/20 shadow-lg hover:shadow-xl transition-all space-y-4 group">
            <div className="w-14 h-14 rounded-2xl bg-gold-light/20 text-gold-dark flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="font-serif font-bold text-xl text-espresso-900">Instant Verification</h3>
            <p className="text-espresso-800/70 text-sm leading-relaxed">
              Seamless 6-digit Email OTP verification for instant, guaranteed table reservations with no waiting times.
            </p>
          </div>
        </div>
      </section>

      {/* SIGNATURE DISHES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs uppercase tracking-widest text-gold-dark font-bold">Chef's Favorites</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-espresso-900">Signature Menu Specials</h2>
          <div className="w-16 h-1 bg-gold rounded-full mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {signatureDishes.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl overflow-hidden border border-gold/20 shadow-lg hover:shadow-2xl transition-all duration-300 group flex flex-col justify-between"
            >
              <div className="relative h-64 overflow-hidden bg-cream-100">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-gold-dark font-bold text-sm shadow-md">
                  {item.price}
                </div>
              </div>

              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider text-gold-dark font-semibold">
                    {item.category}
                  </span>
                  <h3 className="font-serif font-bold text-xl text-espresso-900 mt-1">{item.name}</h3>
                  <p className="text-espresso-800/70 text-sm mt-2 line-clamp-2">{item.desc}</p>
                </div>

                <div className="pt-4 border-t border-cream-200 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-gold font-bold text-sm">
                    <Star className="w-4 h-4 fill-gold text-gold" />
                    <span>{item.rating}</span>
                  </div>
                  <Link
                    to="/menu"
                    className="text-gold-dark hover:text-gold font-medium text-sm flex items-center gap-1 transition-colors"
                  >
                    View Details <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-espresso-900 text-cream-50 py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
          <div className="text-center space-y-3">
            <span className="text-xs uppercase tracking-widest text-gold-light font-bold">Guest Experiences</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-cream-50">What Our Guests Say</h2>
            <div className="w-16 h-1 bg-gold rounded-full mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <div key={idx} className="p-8 rounded-3xl bg-espresso-800/80 border border-gold-dark/20 space-y-4">
                <div className="flex text-gold">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-gold" />
                  ))}
                </div>
                <p className="text-cream-200/80 text-sm leading-relaxed italic">"{t.comment}"</p>
                <div className="pt-4 border-t border-espresso-700">
                  <p className="font-serif font-bold text-cream-100">{t.name}</p>
                  <p className="text-xs text-gold-light">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-gold-dark via-gold to-gold-dark p-10 sm:p-14 text-white text-center space-y-6 shadow-2xl relative overflow-hidden">
          <h2 className="font-serif text-3xl sm:text-5xl font-bold leading-tight">
            Reserve Your Table at We Vibes Cafe
          </h2>
          <p className="max-w-xl mx-auto text-white/90 text-base sm:text-lg">
            Enjoy instant email verification, priority window seating, and complimentary welcome mocktails.
          </p>
          <Link
            to="/reserve"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-espresso-900 hover:bg-espresso-800 text-gold-light font-bold text-base shadow-xl transition-transform hover:scale-105"
          >
            <Calendar className="w-5 h-5" />
            <span>Book Your Reservation</span>
          </Link>
        </div>
      </section>

    </div>
  );
}
