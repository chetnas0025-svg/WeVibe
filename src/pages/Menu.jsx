import React, { useState } from 'react';
import { Search, Star, Filter, Coffee, Utensils, IceCream, Sun } from 'lucide-react';

export default function Menu() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { name: 'All', icon: Filter },
    { name: 'Signature Beverages', icon: Coffee },
    { name: 'Gourmet Mains', icon: Utensils },
    { name: 'Artisanal Desserts', icon: IceCream },
    { name: 'Breakfast & Bakery', icon: Sun },
  ];

  const menuItems = [
    {
      id: 1,
      name: 'Signature Pink Burger',
      category: 'Gourmet Mains',
      price: '₹349',
      image: '/assets/pink-burger.png',
      desc: 'Artisanal pink beetroot brioche bun with smoked double cheese patty, caramelized onions & house special sauce.',
      rating: 4.9,
      veg: false,
      tag: 'Bestseller'
    },
    {
      id: 2,
      name: 'Ocean Blue Curacao Mocktail',
      category: 'Signature Beverages',
      price: '₹229',
      image: '/assets/blue-curacao.png',
      desc: 'Refreshing citrus mocktail layered with natural blue curacao, sparkling soda, mint & maraschino cherry.',
      rating: 4.8,
      veg: true,
      tag: 'Chef Choice'
    },
    {
      id: 3,
      name: 'Kitty Blossom Waffle',
      category: 'Artisanal Desserts',
      price: '₹289',
      image: '/assets/kitty-waffle.png',
      desc: 'Fluffy Belgian waffle topped with strawberry chocolate drizzle, whipped cream, sprinkles & berry gelato.',
      rating: 5.0,
      veg: true,
      tag: 'Sweet Delight'
    },
    {
      id: 4,
      name: 'Rose Gold Hazelnut Latte',
      category: 'Signature Beverages',
      price: '₹199',
      image: '/assets/hero-bg.png',
      desc: 'Single-origin espresso blended with roasted hazelnut syrup, steamed milk & edible gold dust.',
      rating: 4.7,
      veg: true,
      tag: 'Popular'
    },
    {
      id: 5,
      name: 'Truffle Mushroom Crostini',
      category: 'Breakfast & Bakery',
      price: '₹279',
      image: '/assets/pink-burger.png',
      desc: 'Crispy sourdough crostini topped with sautéed wild mushrooms, black truffle oil & shaved parmesan.',
      rating: 4.8,
      veg: true,
      tag: 'New'
    },
    {
      id: 6,
      name: 'Velvet Berry Pancake Stack',
      category: 'Breakfast & Bakery',
      price: '₹259',
      image: '/assets/kitty-waffle.png',
      desc: 'Triple fluffy soufflé pancakes layered with fresh raspberries, maple syrup & vanilla bean cream.',
      rating: 4.9,
      veg: true,
      tag: 'Trending'
    }
  ];

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <span className="text-xs uppercase tracking-widest text-gold-dark font-bold">Artisanal Offerings</span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-espresso-900">Explore Our Menu</h1>
        <p className="max-w-xl mx-auto text-espresso-800/70 text-base">
          Crafted with organic ingredients, passion, and culinary perfection.
        </p>
        <div className="w-16 h-1 bg-gold rounded-full mx-auto" />
      </div>

      {/* Controls: Search & Category Filter Pills */}
      <div className="space-y-6">
        
        {/* Search Bar */}
        <div className="max-w-md mx-auto relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search menu items (e.g. Burger, Latte, Waffle)..."
            className="w-full pl-11 pr-4 py-3.5 rounded-full bg-white border border-gold/30 text-espresso-900 placeholder-espresso-800/40 text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 shadow-sm transition-all"
          />
          <Search className="w-5 h-5 text-gold-dark absolute left-4 top-3.5" />
        </div>

        {/* Category Pills */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-espresso-900 text-gold-light shadow-md scale-105'
                    : 'bg-white text-espresso-800/80 border border-gold/20 hover:border-gold hover:bg-cream-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-gold' : 'text-gold-dark'}`} />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Menu Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gold/20 p-8">
          <p className="text-espresso-800/70 text-lg">No menu items found matching "{searchQuery}".</p>
          <button
            onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
            className="mt-4 px-6 py-2.5 rounded-full bg-gold text-white font-medium text-sm"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl overflow-hidden border border-gold/20 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="relative h-60 overflow-hidden bg-cream-100">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-espresso-900/80 backdrop-blur-md text-gold-light text-xs font-semibold">
                  {item.tag}
                </span>
                <span className="absolute top-4 right-4 px-3.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-gold-dark font-bold text-sm shadow-md">
                  {item.price}
                </span>
              </div>

              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-gold-dark font-semibold">
                      {item.category}
                    </span>
                    <span className={`w-3 h-3 rounded-full ${item.veg ? 'bg-emerald-500' : 'bg-rose-500'}`} title={item.veg ? 'Vegetarian' : 'Non-Vegetarian'} />
                  </div>
                  <h3 className="font-serif font-bold text-xl text-espresso-900 mt-1">{item.name}</h3>
                  <p className="text-espresso-800/70 text-sm mt-2 leading-relaxed">{item.desc}</p>
                </div>

                <div className="pt-4 border-t border-cream-200 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-gold font-bold text-sm">
                    <Star className="w-4 h-4 fill-gold text-gold" />
                    <span>{item.rating}</span>
                  </div>
                  <button className="px-4 py-1.5 rounded-full bg-gold-light/20 text-espresso-800 font-medium text-xs border border-gold/30 hover:border-gold hover:bg-gold hover:text-white transition-colors">
                    Order at Table
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
