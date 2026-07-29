import React, { useState } from 'react';
import { Search, Star, Filter, Coffee, Utensils, Flame, Sparkles, Heart, Check, ChevronRight, Truck } from 'lucide-react';
import OrderModal from '../components/OrderModal';

export default function Menu() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);

  // Order modal state
  const [selectedItem, setSelectedItem] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const handleOpenOrder = (item) => {
    setSelectedItem(item);
    setIsOrderModalOpen(true);
  };

  const fullMenuData = [
    // BURGERS
    { id: 'b1', name: 'Pink Paradise Burger', category: 'Burgers', price: '₹159', veg: true, mustTry: true, image: '/assets/pink-burger.png', desc: 'Signature burger with a custom artisanal pink bun, double cheese patty & chef special sauce.' },
    { id: 'b2', name: 'Bombay Party Burger', category: 'Burgers', price: '₹59', veg: true, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80', desc: 'Classic crispy potato patty with tangy mint chutney and sliced onions.' },
    { id: 'b3', name: 'Spicy Paneer Burger', category: 'Burgers', price: '₹129', veg: true, spicy: true, image: '/assets/pink-burger.png', desc: 'Crispy fried paneer slab layered with spicy peri-peri mayo & crunchy lettuce.' },
    { id: 'b4', name: 'Premium Injector Burger', category: 'Burgers', price: '₹149', veg: true, mustTry: true, image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80', desc: 'Loaded cheese burger served with a liquid cheese injector syringe.' },

    // DRINKS & MOCKTAILS
    { id: 'd1', name: 'Blue Curacao Mocktail', category: 'Drinks', price: '₹129', veg: true, mustTry: true, image: '/assets/blue-curacao.png', desc: 'Vibrant blue curacao layered with lime, mint & fizzy sparkling soda.' },
    { id: 'd2', name: 'Mint Watermelon Cooler', category: 'Drinks', price: '₹129', veg: true, mustTry: true, image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80', desc: 'Crushed fresh watermelon with muddled mint leaves & lemon.' },
    { id: 'd3', name: 'Classic Fresh Lime Soda', category: 'Drinks', price: '₹109', veg: true, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80', desc: 'Classic sweet and salted fresh lime cooler.' },
    { id: 'd4', name: 'Virgin Mojito', category: 'Drinks', price: '₹129', veg: true, image: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=600&q=80', desc: 'Muddled lime wedges, fresh mint leaves & chilled Sprite.' },
    { id: 'd5', name: 'Pink Lemonade', category: 'Drinks', price: '₹129', veg: true, image: '/assets/blue-curacao.png', desc: 'Berry-infused sparkling lemonade with mint.' },

    // DESSERTS & WAFFLES
    { id: 'ds1', name: 'Kitty Blossom Waffle', category: 'Desserts', price: '₹249', veg: true, mustTry: true, image: '/assets/kitty-waffle.png', desc: 'Warm Belgian waffle topped with strawberry cream, berry gelato & chocolate drizzle.' },
    { id: 'ds2', name: 'Pink Perry Potter Sundae', category: 'Desserts', price: '₹199', veg: true, image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80', desc: 'Layered strawberry ice cream with magic popping candy and waffle cone.' },
    { id: 'ds3', name: 'London Special Ice Cream', category: 'Desserts', price: '₹199', veg: true, image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=600&q=80', desc: 'Double scoop roasted almond and chocolate gelato.' },
    { id: 'ds4', name: 'Velvet Love Cake', category: 'Desserts', price: '₹219', veg: true, image: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=600&q=80', desc: 'Rich red velvet sponge layered with cream cheese frosting.' },

    // PIZZA
    { id: 'p1', name: 'Margherita Supreme', category: 'Pizza', price: '₹129', veg: true, image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80', desc: 'Classic mozzarella cheese with fresh basil & rich tomato passata.' },
    { id: 'p2', name: 'Greek Paneer Tikka Pizza', category: 'Pizza', price: '₹209', veg: true, mustTry: true, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80', desc: 'Tandoori paneer tikka, onions, capsicum & paprika.' },
    { id: 'p3', name: 'Basil Pesto Gourmet Pizza', category: 'Pizza', price: '₹199', veg: true, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80', desc: 'House pesto base with cherry tomatoes & bocconcini cheese.' },
    { id: 'p4', name: 'Gardenia Veggie Delight', category: 'Pizza', price: '₹199', veg: true, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80', desc: 'Capsicum, onions, sweet corn & ripe tomatoes.' },

    // PASTA
    { id: 'pas1', name: 'Pink Panther Pasta', category: 'Pasta', price: '₹229', veg: true, mustTry: true, image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281288?auto=format&fit=crop&w=600&q=80', desc: 'Combination of cream Alfredo & tangy Arrabbiata red sauce.' },
    { id: 'pas2', name: 'Alfredo White Sauce Pasta', category: 'Pasta', price: '₹189', veg: true, image: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=600&q=80', desc: 'Penne pasta tossed in garlic parmesan white cream sauce.' },
    { id: 'pas3', name: 'Arrabbiata Red Sauce Pasta', category: 'Pasta', price: '₹189', veg: true, spicy: true, image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80', desc: 'Spicy chili tomato sauce with Italian herbs.' },

    // FRIES & QUICK EATS
    { id: 'f1', name: 'Super Fries Platter', category: 'Fries & Quick Eats', price: '₹259', veg: true, mustTry: true, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80', desc: 'Loaded fries topped with melted cheese, jalapenos & olives.' },
    { id: 'f2', name: 'Peri Peri Crispy Fries', category: 'Fries & Quick Eats', price: '₹179', veg: true, spicy: true, image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=600&q=80', desc: 'Crispy skin-on fries dusted with fiery peri peri spice.' },
    { id: 'f3', name: 'Korean Cheese Nachos', category: 'Fries & Quick Eats', price: '₹209', veg: true, image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=600&q=80', desc: 'Crispy corn tortilla chips with Korean gochujang cheese sauce.' },

    // SANDWICHES
    { id: 's1', name: 'Paneer Tikka Grill Sandwich', category: 'Sandwiches', price: '₹169', veg: true, image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80', desc: 'Grilled jumbo sandwich stuffed with spiced paneer & green mint chutney.' },
    { id: 's2', name: 'Corn & Cheese Loaded', category: 'Sandwiches', price: '₹159', veg: true, image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80', desc: 'Golden sweet corn & melted mozzarella in toasted butter bread.' },

    // ASIAN & NOODLES
    { id: 'a1', name: 'Chilli Garlic Noodles', category: 'Asian & Noodles', price: '₹219', veg: true, spicy: true, image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=600&q=80', desc: 'Wok-tossed noodles with garlic, red chilies & crunchy vegetables.' },
    { id: 'a2', name: 'Honey Chilli Potatoes', category: 'Asian & Noodles', price: '₹199', veg: true, image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=600&q=80', desc: 'Crispy potato fingers tossed in sweet honey sesame chili glaze.' },

    // SHAKES & COFFEE
    { id: 'sh1', name: 'Kitkat Choco Blast Shake', category: 'Shakes & Coffee', price: '₹189', veg: true, mustTry: true, image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80', desc: 'Thick chocolate milkshake blended with crispy KitKat bars.' },
    { id: 'sh2', name: 'Hazelnut Cappuccino (Hot)', category: 'Shakes & Coffee', price: '₹149', veg: true, image: '/assets/hero-bg.png', desc: 'Rich espresso with steamed milk foam and roasted hazelnut syrup.' }
  ];

  const categories = ['All', 'Burgers', 'Drinks', 'Desserts', 'Pizza', 'Pasta', 'Fries & Quick Eats', 'Sandwiches', 'Asian & Noodles', 'Shakes & Coffee'];

  const filteredItems = fullMenuData.filter(item => {
    const matchesCat = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVeg = !vegOnly || item.veg;
    return matchesCat && matchesSearch && matchesVeg;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <span className="text-xs uppercase tracking-widest text-gold-dark font-bold flex items-center justify-center gap-1">
          <Sparkles className="w-4 h-4 text-gold" /> Artisanal Culinary Selection
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-espresso-900">Explore Our Full Menu</h1>
        <p className="max-w-xl mx-auto text-espresso-800/70 text-base">
          Every single dish features 100% visible photos, instant Email OTP verification, and dining order options.
        </p>
        <div className="w-16 h-1 bg-gold rounded-full mx-auto" />
      </div>

      {/* Interactive Search & Filter Controls */}
      <div className="space-y-6">
        
        {/* Search & Veg Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items (e.g. Pink Burger, Pizza, Mojito)..."
              className="w-full pl-11 pr-4 py-3.5 rounded-full bg-white border border-gold/30 text-espresso-900 placeholder-espresso-800/40 text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 shadow-sm transition-all"
            />
            <Search className="w-5 h-5 text-gold-dark absolute left-4 top-3.5" />
          </div>

          <button
            onClick={() => setVegOnly(!vegOnly)}
            className={`flex items-center gap-2 px-5 py-3.5 rounded-full font-medium text-xs whitespace-nowrap border transition-all ${
              vegOnly
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-105'
                : 'bg-white text-espresso-800 border-gold/30 hover:border-gold'
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${vegOnly ? 'bg-white' : 'bg-emerald-500'}`} />
            <span>Veg Only</span>
          </button>
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-3 pt-1 no-scrollbar px-2">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-full font-semibold text-xs sm:text-sm whitespace-nowrap transition-all duration-300 ${
                  isActive
                    ? 'bg-espresso-900 text-gold-light shadow-lg scale-105 border border-gold/40'
                    : 'bg-white text-espresso-800/80 border border-gold/20 hover:border-gold hover:bg-cream-100'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Menu Items Grid with Animated Reveal */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gold/20 p-8">
          <p className="text-espresso-800/70 text-lg">No items found for "{searchQuery}".</p>
          <button
            onClick={() => { setSearchQuery(''); setActiveCategory('All'); setVegOnly(false); }}
            className="mt-4 px-6 py-2.5 rounded-full bg-gold text-white font-medium text-sm shadow"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item, idx) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl overflow-hidden border border-gold/20 shadow-md card-hover-effect flex flex-col justify-between group transition-all duration-500 animate-fadeIn"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              {/* Card Image Header */}
              <div className="relative h-60 overflow-hidden bg-cream-100">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  {item.mustTry && (
                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-gold to-gold-dark text-white text-[10px] font-bold uppercase tracking-wider shadow-md animate-pulse">
                      Must Try
                    </span>
                  )}
                  {item.spicy && (
                    <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white text-[10px] font-bold uppercase flex items-center gap-1 shadow-md">
                      <Flame className="w-3 h-3 fill-white" /> Spicy
                    </span>
                  )}
                </div>

                <span className="absolute top-3 right-3 px-3.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-gold-dark font-bold text-sm shadow-md">
                  {item.price}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-wider text-gold-dark font-bold">
                      {item.category}
                    </span>
                    <span className={`w-3 h-3 rounded-full ${item.veg ? 'bg-emerald-500' : 'bg-rose-500'}`} title={item.veg ? '100% Veg' : 'Non-Veg'} />
                  </div>
                  <h3 className="font-serif font-bold text-xl text-espresso-900 mt-1 group-hover:text-gold-dark transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-espresso-800/70 text-xs sm:text-sm mt-1.5 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                {/* Card Action Buttons: Order at Table & Home Delivery */}
                <div className="pt-3 border-t border-cream-200 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => handleOpenOrder(item)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-espresso-900 hover:bg-espresso-800 text-gold-light font-bold text-xs shadow transition-all flex items-center justify-center gap-1.5"
                  >
                    <Utensils className="w-3.5 h-3.5 text-gold" />
                    <span>Order at Table</span>
                  </button>
                  <button
                    onClick={() => handleOpenOrder(item)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-gold/15 hover:bg-gold/25 text-espresso-900 border border-gold/40 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <Truck className="w-3.5 h-3.5 text-gold-dark" />
                    <span>Home Delivery</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Modal Component */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        item={selectedItem}
      />

    </div>
  );
}
