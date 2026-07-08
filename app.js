/* ==========================================================================
   PINK & BLUE CAFE — INTERACTIVE APPLICATION CONTROLLER & SUPABASE BACKEND
   ========================================================================== */

// Configure Supabase credentials
// Note: Keep these as placeholders. Cafe owners or developers can update these to go live.
const SUPABASE_URL = "https://your-supabase-url.supabase.co"; 
const SUPABASE_ANON_KEY = "your-supabase-anon-key";

document.addEventListener('DOMContentLoaded', () => {
  
  // State variables
  let menuData = null;
  let activeCategoryId = 'all';

  // DOM Elements
  const header = document.querySelector('.header');
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const searchInput = document.getElementById('menu-search');
  const clearSearchBtn = document.getElementById('clear-search');
  const categoryTabs = document.getElementById('category-tabs');
  const activeMarkerLine = document.getElementById('active-marker-line');
  const menuDisplayArea = document.getElementById('menu-display-area');
  const blossomContainer = document.getElementById('blossom-container');
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightbox-image');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxDesc = document.getElementById('lightbox-desc');
  const lightboxClose = document.getElementById('lightbox-close');
  const bookingForm = document.getElementById('booking-form');
  const contactForm = document.getElementById('contact-form');
  const newsletterForm = document.getElementById('newsletter-form');
  const confirmModal = document.getElementById('confirm-modal');
  const confirmDetailsText = document.getElementById('confirm-details-text');
  const whatsappConfirmLink = document.getElementById('whatsapp-confirm-link');
  const closeConfirmBtn = document.getElementById('close-confirm-btn');
  const confettiContainer = document.getElementById('confetti-container');
  const reducedMotionToggle = document.getElementById('reduced-motion-toggle');

  /* ==========================================================================
     0. SUPABASE CLIENT INITIALIZATION
     ========================================================================== */
  let supabase = null;


  /* ==========================================================================
     0A. PRELOADER HIDE LOGIC
     ========================================================================== */
  window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
      preloader.classList.add('fade-out');
      setTimeout(() => {
        preloader.remove();
      }, 600);
    }
  });

  // Safety fallback for preloader if load event takes too long
  setTimeout(() => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
      preloader.classList.add('fade-out');
      setTimeout(() => {
        preloader.remove();
      }, 600);
    }
  }, 3000);

  /* ==========================================================================
     1. ACCESSIBILITY & PREFERS-REDUCED-MOTION
     ========================================================================== */
  const savedMotionPreference = localStorage.getItem('reduced-motion');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (savedMotionPreference === 'true' || (savedMotionPreference === null && prefersReduced)) {
    enableReducedMotion();
  }

  function enableReducedMotion() {
    document.body.classList.add('reduced-motion');
    if (reducedMotionToggle) {
      reducedMotionToggle.querySelector('span').textContent = 'Enable Animations';
      const icon = reducedMotionToggle.querySelector('i');
      if (icon) icon.setAttribute('data-lucide', 'sparkles-off');
    }
    localStorage.setItem('reduced-motion', 'true');
    // Clear petals
    blossomContainer.innerHTML = '';
  }

  function disableReducedMotion() {
    document.body.classList.remove('reduced-motion');
    if (reducedMotionToggle) {
      reducedMotionToggle.querySelector('span').textContent = 'Disable Animations';
      const icon = reducedMotionToggle.querySelector('i');
      if (icon) icon.setAttribute('data-lucide', 'sparkles');
    }
    localStorage.setItem('reduced-motion', 'false');
    // Re-init petals
    initBlossomPetals();
  }

  if (reducedMotionToggle) {
    reducedMotionToggle.addEventListener('click', () => {
      if (document.body.classList.contains('reduced-motion')) {
        disableReducedMotion();
      } else {
        enableReducedMotion();
      }
      if (window.lucide) window.lucide.createIcons();
    });
  }

  /* ==========================================================================
     1B. ANIMATED CURSOR TRAIL (PETALS)
     ========================================================================== */
  let lastTrailTime = 0;
  document.addEventListener('mousemove', (e) => {
    if (document.body.classList.contains('reduced-motion')) return;
    if (window.innerWidth <= 992) return; // Desktop only
    
    const now = Date.now();
    if (now - lastTrailTime < 60) return; // Limit density to 60ms
    lastTrailTime = now;

    const trailPetal = document.createElement('div');
    trailPetal.classList.add('cursor-petal');
    trailPetal.style.left = `${e.clientX - 5}px`;
    trailPetal.style.top = `${e.clientY - 5}px`;
    
    const size = Math.random() * 6 + 6; // 6px to 12px
    trailPetal.style.width = `${size}px`;
    trailPetal.style.height = `${size}px`;
    
    const colors = ['#F2A6C4', '#FADDE8', '#E6007E', '#FFB7D5'];
    trailPetal.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    
    // Set random offset path variables
    const dx = (Math.random() - 0.5) * 80;
    const dy = Math.random() * 50 + 20; // Float downwards
    trailPetal.style.setProperty('--dx', `${dx}px`);
    trailPetal.style.setProperty('--dy', `${dy}px`);
    
    document.body.appendChild(trailPetal);
    
    setTimeout(() => {
      trailPetal.remove();
    }, 1000);
  });

  /* ==========================================================================
     2. NAVIGATION & HEADER SCROLL EFFECT
     ========================================================================== */
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    
    // Auto-highlight nav links during scroll
    let currentSectionId = '';
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
      const top = section.offsetTop - 120;
      const height = section.offsetHeight;
      if (window.scrollY >= top && window.scrollY < top + height) {
        currentSectionId = section.getAttribute('id');
      }
    });

    if (currentSectionId) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSectionId}`) {
          link.classList.add('active');
        }
      });
    }
  });

  // Mobile navigation curtain toggle
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
    });
  }

  // Close Mobile Menu on Link Click
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu.classList.contains('active')) {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
      }
    });
  });

  /* ==========================================================================
     3. FLOATING CHERRY BLOSSOM PETALS
     ========================================================================== */
  function initBlossomPetals() {
    if (document.body.classList.contains('reduced-motion')) return;
    
    blossomContainer.innerHTML = '';
    const petalCount = 18;
    
    for (let i = 0; i < petalCount; i++) {
      createPetal(true);
    }

    // Periodically spawn new petals to keep falling loop organic
    setInterval(() => {
      if (document.body.classList.contains('reduced-motion')) return;
      if (blossomContainer.children.length < 25) {
        createPetal(false);
      }
    }, 4000);
  }

  function createPetal(isInitial = false) {
    const petal = document.createElement('div');
    petal.classList.add('petal');
    
    const size = Math.random() * 8 + 8; // Size between 8px and 16px
    petal.style.width = `${size}px`;
    petal.style.height = `${size}px`;
    
    // Position
    petal.style.left = `${Math.random() * 100}vw`;
    
    const startY = isInitial ? (Math.random() * -100) : -20;
    petal.style.top = `${startY}px`;
    
    // Random transparency and pink shades
    const pinkShades = ['#F2A6C4', '#FADDE8', '#E6007E', '#FFB7D5'];
    petal.style.backgroundColor = pinkShades[Math.floor(Math.random() * pinkShades.length)];
    petal.style.opacity = Math.random() * 0.4 + 0.5;

    // Speeds and offsets
    const duration = Math.random() * 8 + 6; // 6s to 14s
    const delay = isInitial ? (Math.random() * -8) : 0;
    const swingRange = Math.random() * 60 + 30; // degrees
    
    petal.style.transition = 'none';
    
    // Animate falling using JS step frames to avoid complex dynamically generated keyframe styles
    let posY = startY;
    let posX = parseFloat(petal.style.left);
    let rotation = Math.random() * 360;
    const speedY = Math.random() * 1 + 0.8;
    const speedX = Math.random() * 0.5 - 0.25;
    const spinSpeed = Math.random() * 1 - 0.5;
    const wobbleSpeed = Math.random() * 0.02 + 0.01;
    let angle = Math.random() * Math.PI;

    blossomContainer.appendChild(petal);

    function fallStep() {
      if (document.body.classList.contains('reduced-motion') || !petal.parentNode) {
        if (petal.parentNode) petal.remove();
        return;
      }

      posY += speedY;
      angle += wobbleSpeed;
      const currentX = posX + Math.sin(angle) * (swingRange / 10) + (speedX * posY / 10);
      rotation += spinSpeed;

      petal.style.top = `${posY}px`;
      petal.style.left = `${currentX}px`;
      petal.style.transform = `rotate(${rotation}deg) skewX(${Math.sin(angle) * 10}deg)`;

      // Remove offscreen
      if (posY > window.innerHeight + 20 || currentX < -20 || currentX > window.innerWidth + 20) {
        petal.remove();
      } else {
        requestAnimationFrame(fallStep);
      }
    }

    // Stagger execution slightly
    setTimeout(() => {
      requestAnimationFrame(fallStep);
    }, delay * 1000);
  }

  initBlossomPetals();

  /* ==========================================================================
     4. SIGNATURE CARDS 3D TILT EFFECT
     ========================================================================== */
  function initCardTilts() {
    const cards = document.querySelectorAll('.tilt-card');
    
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        if (document.body.classList.contains('reduced-motion')) return;
        
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left; // x position within card
        const y = e.clientY - rect.top;  // y position within card
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Calculate tilt degrees (max 8 degrees tilt)
        const tiltX = ((centerY - y) / centerY) * 8;
        const tiltY = ((x - centerX) / centerX) * 8;
        
        card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      });
    });
  }

  initCardTilts();

  /* ==========================================================================
     5. DYNAMIC MENU LOGIC (FETCH & RENDER)
     ========================================================================== */
  async function loadMenu() {
    try {
      if (supabase) {
        console.log("Supabase Client initialized. Fetching live database records...");
        
        // Fetch Categories
        const { data: dbCategories, error: catError } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });
          
        if (catError) throw catError;

        // Fetch Menu Items
        const { data: dbItems, error: itemsError } = await supabase
          .from('menu_items')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });
          
        if (itemsError) throw itemsError;

        // Translate SQL records to local JSON format
        const categoryMap = dbCategories.map(cat => {
          const catItems = dbItems.filter(item => item.category_id === cat.id).map(item => {
            let priceVal = item.price_medium;
            
            const catNameLower = cat.name.toLowerCase();
            if (catNameLower.includes('pizza')) {
              priceVal = {};
              if (item.price_small) priceVal["S"] = item.price_small;
              if (item.price_medium) priceVal["M"] = item.price_medium;
              if (item.price_large) priceVal["L"] = item.price_large;
            } else if (catNameLower.includes('drinks')) {
              priceVal = {};
              if (item.price_medium) priceVal["M"] = item.price_medium;
              if (item.price_large) priceVal["L"] = item.price_large;
              if (item.price_xxxl) priceVal["XXXL"] = item.price_xxxl;
            } else if (catNameLower.includes('coffee')) {
              priceVal = {};
              if (item.price_medium) priceVal["M"] = item.price_medium;
              if (item.price_large) priceVal["L"] = item.price_large;
            } else if (catNameLower.includes('pasta')) {
              if (item.price_medium && item.price_large) {
                priceVal = {
                  "Standard": item.price_medium,
                  "Roasted Cheese": item.price_large
                };
              } else {
                priceVal = item.price_medium || item.price_small || item.price_large;
              }
            } else {
              priceVal = item.price_medium || item.price_small || item.price_large;
            }

            return {
              name: item.name,
              price: priceVal,
              veg: item.is_veg,
              mustTry: item.is_must_try,
              spicy: item.is_spicy,
              description: item.description,
              imageUrl: item.image_url
            };
          });

          let addOns = null;
          if (cat.name.toLowerCase().includes('pizza')) {
            addOns = [
              { "name": "Extra Cheese", "price": 50 },
              { "name": "Cheese Burst", "price": 75 },
              { "name": "Cheese Blanket", "price": 110 },
              { "name": "Any Extra Dip", "price": 30 }
            ];
          }

          return {
            id: cat.id,
            name: cat.name,
            items: catItems,
            addOns: addOns
          };
        });

        menuData = { categories: categoryMap };
        
        // Dynamic settings loading
        await loadGlobalSettings();
        
        // Dynamic gallery loading
        await loadGalleryAssets();

      } else {
        console.log("Supabase Client unconfigured. Falling back to local static JSON.");
        const response = await fetch('menu.json');
        if (!response.ok) throw new Error('Failed to load menu.json');
        menuData = await response.json();
      }
      
      // Dynamic offers loading
      await loadActiveOffers();
      
      renderCategoryTabs();
      renderMenu();
      initCardTilts();
    } catch (error) {
      console.error('Menu load error:', error);
      menuDisplayArea.innerHTML = `<div class="menu-error"><p><i data-lucide="alert-circle"></i> We had trouble loading our menu. Please reload the page or contact us directly.</p></div>`;
      if (window.lucide) window.lucide.createIcons();
    }
  }

  // Live Settings loader
  async function loadGlobalSettings() {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('cafe_settings')
        .select('*')
        .limit(1)
        .single();
        
      if (error) throw error;
      if (!data) return;

      // Update phone href and numbers
      const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
      phoneLinks.forEach(link => {
        link.setAttribute('href', `tel:${data.phone}`);
        link.textContent = data.phone;
      });

      // Update address texts
      const addressTexts = document.querySelectorAll('.contact-details-box p, .footer-col-contact p');
      addressTexts.forEach(p => {
        if (p.innerHTML.includes('Address:')) {
          p.innerHTML = `<strong>Address:</strong> ${data.address}`;
        }
      });

      // Update map embed URL
      const mapIframe = document.querySelector('.location-map iframe');
      if (mapIframe && data.map_embed_url) {
        mapIframe.setAttribute('src', data.map_embed_url);
      }

      // Update whatsapp action links
      const waActionLink = document.querySelector('a[href*="wa.me"]');
      if (waActionLink && data.whatsapp_number) {
        const cleanNumber = data.whatsapp_number.replace(/[^0-9]/g, '');
        waActionLink.setAttribute('href', `https://wa.me/${cleanNumber}?text=Hi%20Pink%20and%20Blue%20Cafe%21%20I%20would%20like%20to%20place%20an%20order%20for%20pickup.`);
      }

      // Update operational hours dynamically from settings hours_json
      const hoursElements = document.querySelectorAll('.contact-line p');
      hoursElements.forEach(p => {
        if (p.innerHTML.includes('Hours:')) {
          const hours = data.hours_json;
          p.innerHTML = `<strong>Hours:</strong> Open Daily from ${hours.mon || '11:00 AM to 10:15 PM'}`;
        }
      });
      
    } catch (e) {
      console.warn("Global settings loading error:", e);
    }
  }

  // Live Gallery loader
  async function loadGalleryAssets() {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
        
      if (error) throw error;
      if (!data || data.length === 0) return;

      const galleryGrid = document.getElementById('gallery-grid');
      if (!galleryGrid) return;
      
      let galleryHTML = '';
      data.forEach((img, index) => {
        galleryHTML += `
          <div class="gallery-item scroll-reveal active" data-src="${img.image_url}" data-title="${img.caption || 'Pink & Blue Cafe'}" data-desc="Gallery Capture">
            <img src="${img.image_url}" alt="${img.caption || 'Pink & Blue Cafe Image'}">
            <div class="gallery-overlay">
              <i data-lucide="zoom-in" class="zoom-icon"></i>
              <div class="gallery-info-text">
                <h3>${img.caption || 'Pink & Blue Cafe'}</h3>
                <p>Gallery Image</p>
              </div>
            </div>
          </div>
        `;
      });
      
      galleryGrid.innerHTML = galleryHTML;
      
      // Re-trigger lightbox click bindings on new gallery elements
      const newItems = galleryGrid.querySelectorAll('.gallery-item');
      newItems.forEach(item => {
        item.addEventListener('click', () => {
          const src = item.getAttribute('data-src');
          const title = item.getAttribute('data-title');
          const desc = item.getAttribute('data-desc');
          
          if (src && lightbox) {
            lightboxImage.setAttribute('src', src);
            lightboxImage.setAttribute('alt', title || 'Cafe view');
            lightboxTitle.textContent = title || 'Pink & Blue Cafe';
            lightboxDesc.textContent = desc || 'Romantic Ambience';
            
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
          }
        });
      });

      if (window.lucide) window.lucide.createIcons();
    } catch (e) {
      console.warn("Gallery assets loading error:", e);
    }
  }

  function renderCategoryTabs() {
    if (!menuData || !menuData.categories) return;

    let tabsHTML = `<button class="tab-btn active" data-category="all">All Specialties</button>`;
    
    menuData.categories.forEach(cat => {
      tabsHTML += `<button class="tab-btn" data-category="${cat.id}">${cat.name}</button>`;
    });

    categoryTabs.innerHTML = tabsHTML;
    
    // Add Click Listeners to Tabs
    const tabs = categoryTabs.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeCategoryId = tab.getAttribute('data-category');
        
        // Redraw Highlighter Stroke
        updateTabHighlighter(tab);
        
        // Trigger render
        renderMenu();
      });
    });

    // Initial highlighter positions after font render
    setTimeout(() => {
      const activeTab = categoryTabs.querySelector('.tab-btn.active');
      if (activeTab) updateTabHighlighter(activeTab);
    }, 300);
  }

  function updateTabHighlighter(tab) {
    if (!tab || !activeMarkerLine) return;
    
    const containerRect = categoryTabs.getBoundingClientRect();
    const tabRect = tab.getBoundingClientRect();
    const scrollLeft = categoryTabs.scrollLeft;

    // Apply exact width and left positions matching the tab size relative to the row
    activeMarkerLine.style.width = `${tabRect.width}px`;
    activeMarkerLine.style.left = `${tabRect.left - containerRect.left + scrollLeft}px`;

    // Ensure active tab is scrolled into view smoothly on mobile screens
    categoryTabs.scrollTo({
      left: tabRect.left - containerRect.left + scrollLeft - (containerRect.width / 2) + (tabRect.width / 2),
      behavior: 'smooth'
    });
  }

  function renderMenu() {
    if (!menuData || !menuDisplayArea) return;
    
    const searchQuery = searchInput.value.toLowerCase().trim();
    menuDisplayArea.innerHTML = '';
    
    let renderedCount = 0;

    menuData.categories.forEach(category => {
      // Filter out categories if not activeCategoryId
      if (activeCategoryId !== 'all' && activeCategoryId !== category.id && !searchQuery) {
        return;
      }

      // Filter matching items
      const matchingItems = category.items.filter(item => {
        const matchesName = item.name.toLowerCase().includes(searchQuery);
        const matchesDesc = item.description && item.description.toLowerCase().includes(searchQuery);
        return matchesName || matchesDesc;
      });

      if (matchingItems.length === 0) return;

      renderedCount += matchingItems.length;

      // Create Category Box
      const catCard = document.createElement('div');
      catCard.classList.add('menu-category-card', 'scroll-reveal', 'active'); // Force active to see immediately
      
      let itemsListHTML = '';
      
      matchingItems.forEach(item => {
        let priceHTML = '';
        
        if (typeof item.price === 'object') {
          // Sized pricing (S/M/L or M/L/XXXL)
          priceHTML = `<div class="sizes-price-grid">`;
          for (const [size, cost] of Object.entries(item.price)) {
            priceHTML += `
              <div class="size-price-bubble">
                <span class="size-label">${size}</span>
                <span class="size-cost">₹<span class="price-animate" data-target="${cost}">0</span></span>
              </div>
            `;
          }
          priceHTML += `</div>`;
        } else {
          // Standard single pricing
          priceHTML = `<span class="single-price">₹<span class="price-animate" data-target="${item.price}">0</span></span>`;
        }

        // Badges
        let badgeHTML = '';
        if (item.mustTry) {
          badgeHTML += `<span class="item-badge must-try"><i data-lucide="crown" style="width:12px;height:12px"></i> Must-Try</span>`;
        }
        if (item.spicy) {
          badgeHTML += `<span class="item-badge spicy"><i data-lucide="flame" style="width:12px;height:12px"></i> Spicy</span>`;
        }

        itemsListHTML += `
          <div class="menu-item-row">
            <div class="menu-item-top">
              <div class="menu-item-name-group">
                <span class="veg-badge" style="padding: 2px 4px; font-size: 0.7rem;"><span class="dot"></span></span>
                <h4 class="menu-item-name">${item.name}</h4>
                ${badgeHTML}
              </div>
              <div class="menu-item-price-wrapper">
                ${priceHTML}
              </div>
            </div>
            ${item.description ? `<p class="menu-item-desc">${item.description}</p>` : ''}
          </div>
        `;
      });

      // Special box for Pizza Addons if it's the pizza category
      let addonsHTML = '';
      if (category.id === 'pizza' && category.addOns) {
        addonsHTML = `
          <div class="pizza-addons-block">
            <h4>✨ Pizza Add-ons</h4>
            <div class="pizza-addons-grid">
        `;
        category.addOns.forEach(addon => {
          addonsHTML += `
            <div class="addon-item">
              <span class="addon-name">${addon.name}</span>
              <span class="addon-price">+₹${addon.price}</span>
            </div>
          `;
        });
        addonsHTML += `</div></div>`;
      }

      catCard.innerHTML = `
        <div class="menu-category-title-bar">
          <h3>${category.name}</h3>
        </div>
        <div class="menu-items-list">
          ${itemsListHTML}
        </div>
        ${addonsHTML}
      `;

      menuDisplayArea.appendChild(catCard);
    });

    if (renderedCount === 0) {
      menuDisplayArea.innerHTML = `
        <div class="menu-no-results">
          <i data-lucide="search-slash" style="width: 48px; height: 48px; color: var(--primary-pink); margin-bottom: 12px;"></i>
          <h3>No matches found</h3>
          <p>We couldn't find anything matching "${searchQuery}". Try looking for another tasty treat!</p>
        </div>
      `;
    }

    // Refresh icons inside dynamically injected nodes
    if (window.lucide) window.lucide.createIcons();
  }

  // Search input events
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      if (searchInput.value.length > 0) {
        clearSearchBtn.classList.add('active');
      } else {
        clearSearchBtn.classList.remove('active');
      }
      renderMenu();
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      clearSearchBtn.classList.remove('active');
      renderMenu();
      searchInput.focus();
    });
  }

  async function initApplication() {
    let currentUrl = SUPABASE_URL;
    let currentAnonKey = SUPABASE_ANON_KEY;

    try {
      const response = await fetch('supabase_config.json');
      if (response.ok) {
        const config = await response.json();
        if (config.SUPABASE_URL && config.SUPABASE_ANON_KEY) {
          currentUrl = config.SUPABASE_URL;
          currentAnonKey = config.SUPABASE_ANON_KEY;
          console.log("Supabase config loaded successfully from supabase_config.json");
        }
        if (config.SENTRY_DSN && typeof window.Sentry !== 'undefined') {
          window.Sentry.init({
            dsn: config.SENTRY_DSN,
            tracesSampleRate: 1.0
          });
          console.log("Sentry tracking initialized.");
        }
      }
    } catch (e) {
      console.log("No supabase_config.json found or failed to parse. Using default config.");
    }

    const isSupabaseConfigured = currentUrl && currentUrl !== "https://your-supabase-url.supabase.co";
    
    if (typeof window.supabase !== 'undefined' && isSupabaseConfigured) {
      supabase = window.supabase.createClient(currentUrl, currentAnonKey);
    }

    await loadMenu();
  }

  initApplication();

  /* ==========================================================================
     6. SCROLL-TRIGGERED REVEAL OBSERVER
     ========================================================================== */
  const revealElements = document.querySelectorAll('.scroll-reveal');
  
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          // Once revealed, no need to observe again unless needed
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback if browser does not support IntersectionObserver
    revealElements.forEach(el => el.classList.add('active'));
  }

  /* ==========================================================================
     7. GALLERY LIGHTBOX MODAL
     ========================================================================== */
  const galleryItems = document.querySelectorAll('.gallery-item');
  
  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const src = item.getAttribute('data-src');
      const title = item.getAttribute('data-title');
      const desc = item.getAttribute('data-desc');
      
      if (src && lightbox) {
        lightboxImage.setAttribute('src', src);
        lightboxImage.setAttribute('alt', title || 'Cafe view');
        lightboxTitle.textContent = title || 'Pink & Blue Cafe';
        lightboxDesc.textContent = desc || 'Romantic Ambience';
        
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Lock body scroll
      }
    });
  });

  function closeLightbox() {
    if (lightbox) {
      lightbox.classList.remove('active');
      document.body.style.overflow = ''; // Unlock scroll
      setTimeout(() => {
        lightboxImage.setAttribute('src', '');
      }, 300);
    }
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  // Key press close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeLightbox();
      closeConfirmModal();
    }
  });

  /* ==========================================================================
     8. RESERVATIONS & HEART CONFETTI DISPATCH (Supabase Insert)
     ========================================================================== */
  if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Honeypot spam check
      const honeypot = document.getElementById('booking-honeypot').value;
      if (honeypot) {
        console.warn("Honeypot triggered. Booking blocked.");
        bookingForm.reset();
        return;
      }
      
      const name = document.getElementById('booking-name').value.trim();
      const phone = document.getElementById('booking-phone').value.trim();
      const date = document.getElementById('booking-date').value;
      const time = document.getElementById('booking-time').value;
      const guests = document.getElementById('booking-guests').value;
      const occasion = document.getElementById('booking-occasion').value;
      const notes = document.getElementById('booking-notes').value.trim();

      // Trigger Visual Confetti
      triggerHeartConfetti();

      // Insert to Supabase DB if enabled
      if (supabase) {
        try {
          const { error } = await supabase
            .from('reservations')
            .insert([{
              name: name,
              phone: phone,
              date: date,
              time: time,
              party_size: parseInt(guests, 10),
              occasion_note: `${occasion}${notes ? ' - ' + notes : ''}`,
              status: 'new'
            }]);
            
          if (error) throw error;
          console.log("Reservation successfully recorded in database!");
        } catch (dbErr) {
          console.error("Database reservation insert failed:", dbErr);
        }
      }

      // Formulate WhatsApp message text
      const messageText = `Hi Pink & Blue Cafe! 💖 I'd like to request a table reservation:
      
✨ Name: ${name}
📞 Phone: ${phone}
📅 Date: ${date}
⏰ Time: ${time}
👥 Guests: ${guests}
🎉 Occasion: ${occasion}
📝 Notes: ${notes || 'None'}`;

      const encodedText = encodeURIComponent(messageText);
      const whatsappURL = `https://wa.me/919991110124?text=${encodedText}`;

      // Update link and text in confirmation popup
      if (whatsappConfirmLink) whatsappConfirmLink.setAttribute('href', whatsappURL);
      if (confirmDetailsText) {
        confirmDetailsText.innerHTML = `Thank you <strong>${name}</strong>! We've prepared booking details for <strong>${guests} guests</strong> on <strong>${date}</strong> at <strong>${time}</strong>. Click below to instantly send this request via WhatsApp.`;
      }

      // Display Modal
      if (confirmModal) confirmModal.classList.add('active');
    });
  }

  function triggerHeartConfetti() {
    if (document.body.classList.contains('reduced-motion')) return;
    
    confettiContainer.innerHTML = '';
    const heartCount = 35;
    
    for (let i = 0; i < heartCount; i++) {
      const heart = document.createElement('div');
      heart.classList.add('confetti-heart');
      
      // Random coordinates and sizes
      heart.style.left = `${Math.random() * 100}%`;
      heart.style.top = `${Math.random() * -20}%`;
      
      const scale = Math.random() * 0.7 + 0.5;
      heart.style.transform = `rotate(45deg) scale(${scale})`;
      
      // Vary color shades
      const colors = ['#E6007E', '#F2A6C4', '#D9A441', '#FF4081', '#FFFFFF'];
      heart.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      
      const duration = Math.random() * 2 + 1.5; // 1.5s to 3.5s
      const delay = Math.random() * 0.3;
      
      heart.style.animation = `floatConfetti ${duration}s cubic-bezier(0.1, 0.8, 0.3, 1) ${delay}s forwards`;
      
      confettiContainer.appendChild(heart);
      
      // Garbage collect hearts
      setTimeout(() => {
        heart.remove();
      }, (duration + delay) * 1000);
    }
  }

  function closeConfirmModal() {
    if (confirmModal) {
      confirmModal.classList.remove('active');
      bookingForm.reset();
    }
  }

  if (closeConfirmBtn) closeConfirmBtn.addEventListener('click', closeConfirmModal);
  if (confirmModal) {
    confirmModal.addEventListener('click', (e) => {
      if (e.target === confirmModal) closeConfirmModal();
    });
  }
  if (whatsappConfirmLink) {
    whatsappConfirmLink.addEventListener('click', () => {
      // Auto close after brief timeout so user returns to a clean form
      setTimeout(closeConfirmModal, 800);
    });
  }

  /* ==========================================================================
     8B. CONTACT MESSAGE SUBMIT (Supabase Insert)
     ========================================================================== */
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Honeypot spam check
      const honeypot = document.getElementById('contact-honeypot').value;
      if (honeypot) {
        console.warn("Honeypot triggered. Inquiry blocked.");
        contactForm.reset();
        return;
      }
      
      const name = document.getElementById('contact-name').value.trim();
      const contactInfo = document.getElementById('contact-info').value.trim();
      const message = document.getElementById('contact-message').value.trim();
      
      const btn = contactForm.querySelector('button[type="submit"]');
      const originalText = btn.innerHTML;
      btn.innerHTML = `<i data-lucide="loader" class="animate-spin" style="width:16px;height:16px"></i> Sending...`;
      if (window.lucide) window.lucide.createIcons();
      
      if (supabase) {
        try {
          const { error } = await supabase
            .from('contact_submissions')
            .insert([{
              name: name,
              email_or_phone: contactInfo,
              message: message,
              status: 'unread'
            }]);
            
          if (error) throw error;
          
          btn.innerHTML = `<i data-lucide="check"></i> Sent Successfully!`;
          btn.style.backgroundColor = "#2e7d32";
          btn.style.borderColor = "#2e7d32";
          contactForm.reset();
          
          setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.backgroundColor = '';
            btn.style.borderColor = '';
            if (window.lucide) window.lucide.createIcons();
          }, 3000);
          
        } catch (err) {
          console.error("Contact insert failed:", err);
          btn.innerHTML = `⚠️ Failed to send`;
          setTimeout(() => { btn.innerHTML = originalText; if (window.lucide) window.lucide.createIcons(); }, 3000);
        }
      } else {
        // Fallback simulate
        setTimeout(() => {
          btn.innerHTML = `<i data-lucide="check"></i> Sent (Mocked Mode)`;
          contactForm.reset();
          setTimeout(() => { btn.innerHTML = originalText; if (window.lucide) window.lucide.createIcons(); }, 3000);
        }, 1000);
      }
    });
  }

  /* ==========================================================================
     8C. NEWSLETTER EMAIL SUBMIT (Supabase Insert)
     ========================================================================== */
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Honeypot check
      const honeypot = document.getElementById('newsletter-honeypot').value;
      if (honeypot) return;
      
      const email = document.getElementById('newsletter-email').value.trim();
      const btn = newsletterForm.querySelector('button[type="submit"]');
      const originalText = btn.innerHTML;
      
      btn.innerHTML = `<i data-lucide="loader" class="animate-spin" style="width:12px;height:12px"></i>`;
      if (window.lucide) window.lucide.createIcons();
      
      if (supabase) {
        try {
          const { error } = await supabase
            .from('newsletter_signups')
            .insert([{ email: email }]);
            
          if (error && error.code !== '23505') throw error; // Ignore duplicate email errors
          
          btn.innerHTML = `<i data-lucide="check"></i>`;
          btn.style.backgroundColor = "#2e7d32";
          newsletterForm.reset();
          
          setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.backgroundColor = '';
            if (window.lucide) window.lucide.createIcons();
          }, 3000);
          
        } catch (err) {
          console.error("Newsletter registration failed:", err);
          btn.innerHTML = `⚠️`;
          setTimeout(() => { btn.innerHTML = originalText; if (window.lucide) window.lucide.createIcons(); }, 3000);
        }
      } else {
        // Simulate fallback
        setTimeout(() => {
          btn.innerHTML = `<i data-lucide="check"></i>`;
          newsletterForm.reset();
          setTimeout(() => { btn.innerHTML = originalText; if (window.lucide) window.lucide.createIcons(); }, 3000);
        }, 800);
      }
    });
  }

  // Load Lucide icons initially
  if (window.lucide) window.lucide.createIcons();

  /* ==========================================================================
     9. PRICE NUMERIC ROLL-UP OBSERVER
     ========================================================================== */
  const priceObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const animPrices = entry.target.querySelectorAll('.price-animate:not(.animated)');
        animPrices.forEach(price => animateSinglePrice(price));
        priceObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1
  });

  function animateSinglePrice(el) {
    if (el.classList.contains('animated')) return;
    
    const target = parseInt(el.getAttribute('data-target'), 10);
    if (isNaN(target)) {
      el.textContent = el.getAttribute('data-target');
      return;
    }

    el.classList.add('animated');
    if (document.body.classList.contains('reduced-motion')) {
      el.textContent = target;
      return;
    }

    let current = 0;
    const duration = 800; // 800ms
    const start = performance.now();

    function step(timestamp) {
      const progress = Math.min((timestamp - start) / duration, 1);
      current = Math.floor(progress * target);
      el.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    }
    requestAnimationFrame(step);
  }

  // Bind observer function so renderMenu can invoke it
  function attachPriceObservers() {
    document.querySelectorAll('.menu-category-card').forEach(card => {
      priceObserver.observe(card);
    });
  }

  // Intercept renderMenu completion and attach
  const originalRenderMenu = renderMenu;
  renderMenu = function() {
    originalRenderMenu();
    attachPriceObservers();
  };

  /* ==========================================================================
     10. SCROLL DYNAMIC BACKGROUND GRADIENT SHIFT
     ========================================================================== */
  const shiftSections = document.querySelectorAll('.story-section, .bestsellers-section, .location-section');
  shiftSections.forEach(section => {
    section.classList.add('bg-gradient-shift');
  });

  const gradientObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('bg-shifted-blue');
      } else {
        entry.target.classList.remove('bg-shifted-blue');
      }
    });
  }, {
    threshold: 0.25,
    rootMargin: '0px 0px -50px 0px'
  });

  shiftSections.forEach(sec => gradientObserver.observe(sec));

  /* ==========================================================================
     11. DYNAMIC OFFERS LOADER & CAROUSEL CONTROLLER
     ========================================================================== */
  async function loadActiveOffers() {
    let offersList = [];
    
    if (supabase) {
      try {
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
          .from('offers')
          .select('*')
          .eq('is_active', true)
          .gte('end_date', today)
          .order('display_order', { ascending: true });
          
        if (error) throw error;
        offersList = data || [];
      } catch (err) {
        console.warn("Offers query warning (falling back to default):", err);
      }
    }
    
    // Fallback default promo if database is unconfigured or returns empty
    if (offersList.length === 0) {
      offersList = [
        {
          id: "default-offer-1",
          title: "Buy 1 Get 1 Free on signature milkshakes!",
          description: "Dine-in special: Order any standard size Woodfired Pizza and get a free Rose Petal Shake or Strawberry Cream Mojito. Show this banner to claim.",
          badge_text: "BOGO DEAL",
          image_url: "assets/kitty-waffle.png"
        },
        {
          id: "default-offer-2",
          title: "Magical 20% OFF on first table booking",
          description: "Use our reservation wizard to secure your window seat today and get an automatic 20% discount on your total bill. Valid all week.",
          badge_text: "20% OFF",
          image_url: "assets/pink-burger.png"
        }
      ];
    }

    renderOffersCarousel(offersList);
    triggerFirstVisitOffersModal(offersList);
  }

  function renderOffersCarousel(offers) {
    const section = document.getElementById('offers-carousel-section');
    const track = document.getElementById('offers-carousel-track');
    const dotsContainer = document.getElementById('offers-dots');
    
    if (!section || !track || !dotsContainer) return;
    
    if (offers.length === 0) {
      section.style.display = 'none';
      return;
    }

    section.style.display = 'block';
    track.innerHTML = '';
    dotsContainer.innerHTML = '';

    offers.forEach((offer, idx) => {
      const slide = document.createElement('div');
      slide.classList.add('offers-carousel-slide');
      
      const badgeHTML = offer.badge_text 
        ? `<span class="offer-slide-badge">${offer.badge_text}</span>` 
        : '';
        
      const imgHTML = offer.image_url 
        ? `<img src="${offer.image_url}" class="offer-slide-image" alt="${offer.title}">` 
        : '';

      slide.innerHTML = `
        ${imgHTML}
        <div class="offer-slide-content">
          ${badgeHTML}
          <h3 class="offer-slide-title">${offer.title}</h3>
          ${offer.description ? `<p class="offer-slide-desc">${offer.description}</p>` : ''}
          <a href="#reservations" class="btn btn-secondary btn-sm btn-bounce" style="margin-top:8px;padding:8px 16px;font-size:0.85rem;"><i data-lucide="calendar"></i> Book Table To Claim</a>
        </div>
      `;
      track.appendChild(slide);

      const dot = document.createElement('div');
      dot.classList.add('carousel-dot');
      if (idx === 0) dot.classList.add('active');
      dot.setAttribute('data-slide', idx);
      dotsContainer.appendChild(dot);
    });

    let currentSlide = 0;
    const slidesCount = offers.length;

    function showSlide(index) {
      currentSlide = (index + slidesCount) % slidesCount;
      track.style.transform = `translateX(-${currentSlide * 100}%)`;
      
      const dots = dotsContainer.querySelectorAll('.carousel-dot');
      dots.forEach((dot, idx) => {
        if (idx === currentSlide) dot.classList.add('active');
        else dot.classList.remove('active');
      });
    }

    const prevBtn = document.getElementById('offers-prev');
    const nextBtn = document.getElementById('offers-next');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        showSlide(currentSlide - 1);
        resetAutoScroll();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        showSlide(currentSlide + 1);
        resetAutoScroll();
      });
    }

    dotsContainer.querySelectorAll('.carousel-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        const idx = parseInt(dot.getAttribute('data-slide'), 10);
        showSlide(idx);
        resetAutoScroll();
      });
    });

    let scrollInterval = setInterval(() => {
      showSlide(currentSlide + 1);
    }, 5000);

    function resetAutoScroll() {
      clearInterval(scrollInterval);
      scrollInterval = setInterval(() => {
        showSlide(currentSlide + 1);
      }, 5000);
    }

    if (window.lucide) window.lucide.createIcons();
  }

  function triggerFirstVisitOffersModal(offers) {
    if (offers.length === 0) return;
    
    if (sessionStorage.getItem('promo-modal-shown') === 'true') return;
    
    const modal = document.getElementById('offers-promo-modal');
    if (!modal) return;

    const firstPromo = offers[0];
    
    const titleEl = document.getElementById('promo-modal-title');
    const descEl = document.getElementById('promo-modal-desc');
    const badgeEl = document.getElementById('promo-modal-badge');
    const closeBtn = document.getElementById('promo-modal-close');
    const actionBtn = document.getElementById('promo-modal-action-btn');

    if (titleEl) titleEl.textContent = firstPromo.title;
    if (descEl) descEl.textContent = firstPromo.description || "Show this screen to your server at Model Town cafe to redeem!";
    if (badgeEl) {
      if (firstPromo.badge_text) {
        badgeEl.textContent = firstPromo.badge_text;
        badgeEl.style.display = 'inline-block';
      } else {
        badgeEl.style.display = 'none';
      }
    }

    setTimeout(() => {
      modal.classList.add('active');
      sessionStorage.setItem('promo-modal-shown', 'true');
    }, 2500);

    if (closeBtn) {
      closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    }
    if (actionBtn) {
      actionBtn.addEventListener('click', () => modal.classList.remove('active'));
    }
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }

});
