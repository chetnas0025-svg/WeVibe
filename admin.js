/* ==========================================================================
   PINK & BLUE CAFE — ADMINISTRATIVE PANEL CONTROLLER (SUPABASE DRIVEN)
   ========================================================================== */

// Configure Supabase credentials
// Note: Keep these as placeholders. Cafe owners or developers can update these to go live.
const SUPABASE_URL = "https://your-supabase-url.supabase.co"; 
const SUPABASE_ANON_KEY = "your-supabase-anon-key";

document.addEventListener('DOMContentLoaded', () => {
  
  // State variables
  let supabase = null;
  let currentSession = null;
  let allCategories = [];
  let editingItem = null;
  let editingCategory = null;
  
  // Offers and Scanning state
  let editingOffer = null;
  let scanSelectedFiles = [];
  let scanDiffItems = []; // holds current items being reviewed
  let dbActiveItems = []; // cache of current database items for diffing
  let geminiApiKey = "";

  // DOM Elements
  const loginContainer = document.getElementById('login-container');
  const loginForm = document.getElementById('admin-login-form');
  const adminApp = document.getElementById('admin-app');
  const logoutBtn = document.getElementById('admin-logout-btn');
  const sidebarButtons = document.querySelectorAll('.sidebar-btn[data-tab]');
  const tabPanels = document.querySelectorAll('.admin-tab-panel');
  const titleHeading = document.getElementById('admin-title-heading');
  const subtitleDesc = document.getElementById('admin-subtitle-desc');
  const headerActions = document.getElementById('header-actions');
  const settingsForm = document.getElementById('cafe-settings-form');

  // Modals
  const menuModal = document.getElementById('menu-modal');
  const menuItemForm = document.getElementById('menu-item-form');
  const closeMenuModalBtn = document.getElementById('btn-close-menu-modal');
  const categoryModal = document.getElementById('category-modal');
  const categoryForm = document.getElementById('category-form');
  const closeCategoryModalBtn = document.getElementById('btn-close-category-modal');
  
  // Offers modal elements
  const offerModal = document.getElementById('offer-modal');
  const offerForm = document.getElementById('offer-form');
  const closeOfferModalBtn = document.getElementById('btn-close-offer-modal');

  // Pricing Form Inputs Toggle
  const priceTypeSelect = document.getElementById('form-item-price-type');
  const pricingFieldSingle = document.getElementById('pricing-field-single');
  const pricingFieldsMulti = document.getElementById('pricing-fields-multi');

  // Scanner DOM Elements
  const scanDragDrop = document.getElementById('scan-drag-drop');
  const scanFileInput = document.getElementById('scan-file-input');
  const scanSelectedFilesContainer = document.getElementById('scan-selected-files');
  const scanStartActions = document.getElementById('scan-start-actions');
  const btnStartAiScan = document.getElementById('btn-start-ai-scan');
  
  const scannerUploadCard = document.getElementById('scanner-upload-card');
  const scannerLoadingCard = document.getElementById('scanner-loading-card');
  const scannerReviewCard = document.getElementById('scanner-review-card');
  const scanDiffTbody = document.getElementById('scan-diff-tbody');
  const btnCancelScanReview = document.getElementById('btn-cancel-scan-review');
  const btnPublishScanChanges = document.getElementById('btn-publish-scan-changes');
  const scanMissingItemsBox = document.getElementById('scan-missing-items-box');
  const scanMissingList = document.getElementById('scan-missing-list');

  /* ==========================================================================
     0. SUPABASE CLIENT INITIALIZATION
     ========================================================================== */

  // Pre-load Lucide icons
  if (window.lucide) window.lucide.createIcons();

  /* ==========================================================================
     1. AUTHENTICATION & LOGIN FLOW
     ========================================================================== */
  async function checkAuthSession() {
    if (!supabase) {
      console.warn("Supabase is unconfigured. Showing mock dashboard interface.");
      loginContainer.style.display = 'none';
      adminApp.style.display = 'block';
      loadMockDashboardData();
      return;
    }

    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      currentSession = data.session;
      if (currentSession) {
        showDashboard();
      } else {
        showLogin();
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      showLogin();
    }
  }

  function showLogin() {
    loginContainer.style.display = 'flex';
    adminApp.style.display = 'none';
  }

  function showDashboard() {
    loginContainer.style.display = 'none';
    adminApp.style.display = 'block';
    
    // Initial data load
    loadTab('tab-menu');
  }

  // Login Submit Form Handler
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      submitBtn.innerHTML = `<i data-lucide="loader" class="animate-spin" style="width:16px;height:16px"></i> Signing In...`;
      if (window.lucide) window.lucide.createIcons();

      if (!supabase) {
        setTimeout(() => {
          showDashboard();
        }, 800);
        return;
      }

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password
        });

        if (error) throw error;
        
        currentSession = data.session;
        showDashboard();
      } catch (err) {
        console.error("Login failed:", err);
        alert(`Authentication Error: ${err.message || 'Incorrect credentials'}`);
        submitBtn.innerHTML = originalText;
        if (window.lucide) window.lucide.createIcons();
      }
    });
  }

  // Logout Click Handler
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      if (supabase) {
        await supabase.auth.signOut();
      }
      currentSession = null;
      showLogin();
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
      console.log("Live Supabase client initialized.");
    } else if (typeof window.LocalDatabaseClient !== 'undefined') {
      supabase = new window.LocalDatabaseClient();
      console.log("Local database client proxy initialized.");
    }

    await checkAuthSession();
  }

  initApplication();

  /* ==========================================================================
     2. TAB NAVIGATION
     ========================================================================== */
  sidebarButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      sidebarButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const tabId = btn.getAttribute('data-tab');
      tabPanels.forEach(p => p.classList.remove('active'));
      
      const targetPanel = document.getElementById(tabId);
      if (targetPanel) targetPanel.classList.add('active');
      
      // Update heading text
      updateHeadingDetails(tabId);

      // Load active data
      loadTab(tabId);
    });
  });

  function updateHeadingDetails(tabId) {
    if (tabId === 'tab-menu') {
      titleHeading.textContent = "Menu Items Manager";
      subtitleDesc.textContent = "Manage dish titles, prices, descriptions, and tag labels.";
      headerActions.innerHTML = `<button class="btn btn-primary btn-sm" id="btn-add-item-trigger"><i data-lucide="plus"></i> Add Menu Item</button>`;
      
      document.getElementById('btn-add-item-trigger').addEventListener('click', () => openMenuItemModal());
    } 
    else if (tabId === 'tab-scan') {
      titleHeading.textContent = "AI Menu Photo Scanner";
      subtitleDesc.textContent = "Analyze printed menu pages using Gemini Vision AI to bulk update items.";
      headerActions.innerHTML = ``;
      resetScannerUI();
    }
    else if (tabId === 'tab-categories') {
      titleHeading.textContent = "Categories Manager";
      subtitleDesc.textContent = "Organize categories, reorder tabs, and enable/disable sections.";
      headerActions.innerHTML = ``;
    } 
    else if (tabId === 'tab-offers') {
      titleHeading.textContent = "Promotional Offers Manager";
      subtitleDesc.textContent = "Publish active promos and discount badges directly on the homepage banner.";
      headerActions.innerHTML = ``;
    }
    else if (tabId === 'tab-gallery') {
      titleHeading.textContent = "Gallery Manager";
      subtitleDesc.textContent = "Upload and manage photos of food and cafe corners.";
      headerActions.innerHTML = ``;
    } 
    else if (tabId === 'tab-reservations') {
      titleHeading.textContent = "Reservations Inbox";
      subtitleDesc.textContent = "View date-night reservation requests, confirm tables, or cancel bookings.";
      headerActions.innerHTML = ``;
    } 
    else if (tabId === 'tab-messages') {
      titleHeading.textContent = "Messages Inbox";
      subtitleDesc.textContent = "Read general inquiries, questions, and contact submissions.";
      headerActions.innerHTML = ``;
    } 
    else if (tabId === 'tab-settings') {
      titleHeading.textContent = "Global Cafe Configurations";
      subtitleDesc.textContent = "Manage hours, phone lines, social details, and maps embedded pins.";
      headerActions.innerHTML = ``;
    }
    
    if (window.lucide) window.lucide.createIcons();
  }

  function loadTab(tabId) {
    if (!supabase) return; 
    
    if (tabId === 'tab-menu') {
      loadMenuItemsData();
    } else if (tabId === 'tab-categories') {
      loadCategoriesData();
    } else if (tabId === 'tab-gallery') {
      loadGalleryData();
    } else if (tabId === 'tab-reservations') {
      loadReservationsData();
    } else if (tabId === 'tab-messages') {
      loadMessagesData();
    } else if (tabId === 'tab-settings') {
      loadSettingsData();
    } else if (tabId === 'tab-offers') {
      loadOffersData();
    }
  }

  /* ==========================================================================
     3. CRUD 1: MENU ITEMS MANAGER
     ========================================================================== */
  async function loadMenuItemsData() {
    try {
      const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });
      
      allCategories = categories || [];
      populateCategorySelects();

      // Load menu items
      const { data: items, error } = await supabase
        .from('menu_items')
        .select('*, categories(name)')
        .order('category_id')
        .order('display_order', { ascending: true });
        
      if (error) throw error;
      
      dbActiveItems = items || []; // cache for scanner diff comparison
      
      const tbody = document.getElementById('menu-items-table-body');
      tbody.innerHTML = '';
      
      if (items.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;">No menu items found. Click 'Add Menu Item' to create one!</td></tr>`;
        return;
      }

      items.forEach(item => {
        let priceStr = '';
        if (item.price_small || item.price_medium || item.price_large || item.price_xxxl) {
          const prices = [];
          if (item.price_small) prices.push(`S: ₹${item.price_small}`);
          if (item.price_medium) prices.push(`M: ₹${item.price_medium}`);
          if (item.price_large) prices.push(`L: ₹${item.price_large}`);
          if (item.price_xxxl) prices.push(`XXXL: ₹${item.price_xxxl}`);
          priceStr = prices.join(' | ');
        } else {
          priceStr = 'Not set';
        }

        const photoImg = item.image_url 
          ? `<img src="${item.image_url}" class="image-preview-thumbnail" alt="${item.name}">`
          : `<span style="color:#94a3b8;font-size:0.75rem;">No Photo</span>`;

        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${photoImg}</td>
          <td><strong>${item.name}</strong>${item.description ? `<p style="font-size:0.75rem;color:#64748b;margin:2px 0 0 0;">${item.description}</p>` : ''}</td>
          <td>${item.categories ? item.categories.name : '<span style="color:#ef4444;">No Cat</span>'}</td>
          <td><span class="status-badge" style="background-color:${item.is_veg ? '#dcfce7;color:#166534;' : '#f1f5f9;color:#475569;'}">${item.is_veg ? 'Veg' : 'Non-Veg'}</span></td>
          <td>${priceStr}</td>
          <td>${item.display_order}</td>
          <td>
            <button class="status-badge btn-toggle-active" data-id="${item.id}" data-active="${item.is_active}" style="cursor:pointer; background-color:${item.is_active ? '#dcfce7;color:#166534;' : '#fee2e2;color:#991b1b;'}">
              ${item.is_active ? 'Active' : 'Inactive'}
            </button>
          </td>
          <td>
            <button class="btn-edit-item" data-id="${item.id}" style="color:var(--navy-dark);margin-right:12px;font-weight:700;cursor:pointer;"><i data-lucide="edit-3" style="width:16px;height:16px;vertical-align:middle;"></i> Edit</button>
            <button class="btn-delete-item" data-id="${item.id}" style="color:#ef4444;font-weight:700;cursor:pointer;"><i data-lucide="trash-2" style="width:16px;height:16px;vertical-align:middle;"></i> Delete</button>
          </td>
        `;
        
        tbody.appendChild(row);
      });
      
      // Bind inline row buttons
      tbody.querySelectorAll('.btn-toggle-active').forEach(b => {
        b.addEventListener('click', () => toggleItemActive(b.getAttribute('data-id'), b.getAttribute('data-active') === 'true'));
      });
      tbody.querySelectorAll('.btn-edit-item').forEach(b => {
        b.addEventListener('click', () => editMenuItem(b.getAttribute('data-id')));
      });
      tbody.querySelectorAll('.btn-delete-item').forEach(b => {
        b.addEventListener('click', () => deleteMenuItem(b.getAttribute('data-id')));
      });

      if (window.lucide) window.lucide.createIcons();
    } catch (err) {
      console.error("Failed to load menu table:", err);
    }
  }

  function populateCategorySelects() {
    const selects = [document.getElementById('form-item-category')];
    selects.forEach(select => {
      if (!select) return;
      select.innerHTML = '';
      allCategories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.id;
        opt.textContent = cat.name;
        select.appendChild(opt);
      });
    });
  }

  if (priceTypeSelect) {
    priceTypeSelect.addEventListener('change', () => {
      if (priceTypeSelect.value === 'single') {
        pricingFieldSingle.style.display = 'block';
        pricingFieldsMulti.style.display = 'none';
      } else {
        pricingFieldSingle.style.display = 'none';
        pricingFieldsMulti.style.display = 'grid';
      }
    });
  }

  async function editMenuItem(itemId) {
    try {
      const { data: item, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('id', itemId)
        .single();
        
      if (error) throw error;
      
      editingItem = item;
      openMenuItemModal(item);
    } catch (err) {
      alert(`Error loading item: ${err.message}`);
    }
  }

  function openMenuItemModal(item = null) {
    if (!menuModal) return;
    
    menuItemForm.reset();
    document.getElementById('form-item-image-status').textContent = '';
    
    if (item) {
      document.getElementById('menu-modal-title').textContent = "Edit Menu Item";
      document.getElementById('menu-item-id').value = item.id;
      document.getElementById('form-item-name').value = item.name;
      document.getElementById('form-item-category').value = item.category_id;
      document.getElementById('form-item-order').value = item.display_order;
      document.getElementById('form-item-veg').checked = item.is_veg;
      document.getElementById('form-item-musttry').checked = item.is_must_try;
      document.getElementById('form-item-spicy').checked = item.is_spicy;
      document.getElementById('form-item-desc').value = item.description || '';
      document.getElementById('form-item-active').checked = item.is_active;

      const hasMultipleSizes = item.price_small || item.price_large || item.price_xxxl;
      if (hasMultipleSizes) {
        priceTypeSelect.value = 'sizes';
        pricingFieldSingle.style.display = 'none';
        pricingFieldsMulti.style.display = 'grid';
        
        document.getElementById('form-item-price-s').value = item.price_small || '';
        document.getElementById('form-item-price-m').value = item.price_medium || '';
        document.getElementById('form-item-price-l').value = item.price_large || '';
        document.getElementById('form-item-price-xxxl').value = item.price_xxxl || '';
      } else {
        priceTypeSelect.value = 'single';
        pricingFieldSingle.style.display = 'block';
        pricingFieldsMulti.style.display = 'none';
        
        document.getElementById('form-item-price').value = item.price_medium || '';
      }
      
      if (item.image_url) {
        document.getElementById('form-item-image-status').textContent = "Current image: " + item.image_url.split('/').pop();
      }
    } else {
      document.getElementById('menu-modal-title').textContent = "Add Menu Item";
      document.getElementById('menu-item-id').value = '';
      editingItem = null;
      
      priceTypeSelect.value = 'single';
      pricingFieldSingle.style.display = 'block';
      pricingFieldsMulti.style.display = 'none';
    }
    
    menuModal.classList.add('active');
  }

  if (closeMenuModalBtn) {
    closeMenuModalBtn.addEventListener('click', () => {
      menuModal.classList.remove('active');
      editingItem = null;
    });
  }

  if (menuItemForm) {
    menuItemForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = menuItemForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Saving...";

      const id = document.getElementById('menu-item-id').value;
      const name = document.getElementById('form-item-name').value.trim();
      const categoryId = document.getElementById('form-item-category').value;
      const order = parseInt(document.getElementById('form-item-order').value || 0, 10);
      const isVeg = document.getElementById('form-item-veg').checked;
      const isMustTry = document.getElementById('form-item-musttry').checked;
      const isSpicy = document.getElementById('form-item-spicy').checked;
      const desc = document.getElementById('form-item-desc').value.trim();
      const isActive = document.getElementById('form-item-active').checked;
      
      let pSmall = null, pMedium = null, pLarge = null, pXxxl = null;
      if (priceTypeSelect.value === 'single') {
        pMedium = parseFloat(document.getElementById('form-item-price').value) || null;
      } else {
        pSmall = parseFloat(document.getElementById('form-item-price-s').value) || null;
        pMedium = parseFloat(document.getElementById('form-item-price-m').value) || null;
        pLarge = parseFloat(document.getElementById('form-item-price-l').value) || null;
        pXxxl = parseFloat(document.getElementById('form-item-price-xxxl').value) || null;
      }

      let uploadedImageUrl = editingItem ? editingItem.image_url : null;
      const imageFileInput = document.getElementById('form-item-image');
      
      if (imageFileInput.files.length > 0) {
        const file = imageFileInput.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `menu/${fileName}`;

        try {
          const { error: uploadError } = await supabase.storage
            .from('cafe-uploads')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: publicUrlData } = supabase.storage
            .from('cafe-uploads')
            .getPublicUrl(filePath);
            
          uploadedImageUrl = publicUrlData.publicUrl;
        } catch (uploadErr) {
          alert(`Image upload error: ${uploadErr.message}`);
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
          return;
        }
      }

      const itemPayload = {
        category_id: categoryId,
        name: name,
        description: desc || null,
        price_small: pSmall,
        price_medium: pMedium,
        price_large: pLarge,
        price_xxxl: pXxxl,
        is_veg: isVeg,
        is_must_try: isMustTry,
        is_spicy: isSpicy,
        image_url: uploadedImageUrl,
        is_active: isActive,
        display_order: order
      };

      try {
        if (id) {
          const { error } = await supabase
            .from('menu_items')
            .update(itemPayload)
            .eq('id', id);
            
          if (error) throw error;
          triggerPetalSuccessBurst();
        } else {
          const { error } = await supabase
            .from('menu_items')
            .insert([itemPayload]);
            
          if (error) throw error;
          triggerPetalSuccessBurst();
        }

        menuModal.classList.remove('active');
        loadMenuItemsData();
      } catch (saveErr) {
        alert(`Database Save Error: ${saveErr.message}`);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }

  async function toggleItemActive(itemId, currentActive) {
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ is_active: !currentActive })
        .eq('id', itemId);
        
      if (error) throw error;
      loadMenuItemsData();
    } catch (e) {
      alert(`Toggle failed: ${e.message}`);
    }
  }

  async function deleteMenuItem(itemId) {
    if (!confirm("Are you absolutely sure you want to delete this menu item?")) return;
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', itemId);
        
      if (error) throw error;
      loadMenuItemsData();
    } catch (e) {
      alert(`Delete failed: ${e.message}`);
    }
  }

  /* ==========================================================================
     4. CRUD 2: CATEGORIES MANAGER
     ========================================================================== */
  async function loadCategoriesData() {
    try {
      const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });
        
      if (error) throw error;

      const tbody = document.getElementById('categories-table-body');
      tbody.innerHTML = '';
      
      if (categories.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No categories found. Click 'Add Category' to make one!</td></tr>`;
        return;
      }

      categories.forEach(cat => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td><strong>${cat.name}</strong></td>
          <td>${cat.display_order}</td>
          <td>
            <button class="status-badge btn-cat-toggle-active" data-id="${cat.id}" data-active="${cat.is_active}" style="cursor:pointer; background-color:${cat.is_active ? '#dcfce7;color:#166534;' : '#fee2e2;color:#991b1b;'}">
              ${cat.is_active ? 'Active' : 'Inactive'}
            </button>
          </td>
          <td>
            <button class="btn-edit-cat" data-id="${cat.id}" style="color:var(--navy-dark);margin-right:12px;font-weight:700;cursor:pointer;"><i data-lucide="edit-3" style="width:16px;height:16px;vertical-align:middle;"></i> Edit</button>
            <button class="btn-delete-cat" data-id="${cat.id}" style="color:#ef4444;font-weight:700;cursor:pointer;"><i data-lucide="trash-2" style="width:16px;height:16px;vertical-align:middle;"></i> Delete</button>
          </td>
        `;
        tbody.appendChild(row);
      });

      tbody.querySelectorAll('.btn-cat-toggle-active').forEach(b => {
        b.addEventListener('click', () => toggleCatActive(b.getAttribute('data-id'), b.getAttribute('data-active') === 'true'));
      });
      tbody.querySelectorAll('.btn-edit-cat').forEach(b => {
        b.addEventListener('click', () => editCategory(b.getAttribute('data-id')));
      });
      tbody.querySelectorAll('.btn-delete-cat').forEach(b => {
        b.addEventListener('click', () => deleteCategory(b.getAttribute('data-id')));
      });

      if (window.lucide) window.lucide.createIcons();
    } catch (err) {
      console.error("Categories table load failed:", err);
    }
  }

  const addCategoryBtn = document.getElementById('btn-add-category-trigger');
  if (addCategoryBtn) {
    addCategoryBtn.addEventListener('click', () => openCategoryModal());
  }
  
  if (closeCategoryModalBtn) {
    closeCategoryModalBtn.addEventListener('click', () => {
      categoryModal.classList.remove('active');
      editingCategory = null;
    });
  }

  function openCategoryModal(cat = null) {
    if (!categoryModal) return;
    
    categoryForm.reset();
    
    if (cat) {
      document.getElementById('category-modal-title').textContent = "Edit Category";
      document.getElementById('category-id').value = cat.id;
      document.getElementById('form-category-name').value = cat.name;
      document.getElementById('form-category-order').value = cat.display_order;
      document.getElementById('form-category-active').checked = cat.is_active;
    } else {
      document.getElementById('category-modal-title').textContent = "Add Category";
      document.getElementById('category-id').value = '';
      editingCategory = null;
    }
    
    categoryModal.classList.add('active');
  }

  async function editCategory(catId) {
    try {
      const { data: cat, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', catId)
        .single();
        
      if (error) throw error;
      
      editingCategory = cat;
      openCategoryModal(cat);
    } catch (err) {
      alert(`Load category failed: ${err.message}`);
    }
  }

  if (categoryForm) {
    categoryForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const id = document.getElementById('category-id').value;
      const name = document.getElementById('form-category-name').value.trim();
      const order = parseInt(document.getElementById('form-category-order').value || 0, 10);
      const isActive = document.getElementById('form-category-active').checked;
      
      const catPayload = {
        name: name,
        display_order: order,
        is_active: isActive
      };

      try {
        if (id) {
          const { error } = await supabase
            .from('categories')
            .update(catPayload)
            .eq('id', id);
          if (error) throw error;
          triggerPetalSuccessBurst();
        } else {
          const { error } = await supabase
            .from('categories')
            .insert([catPayload]);
          if (error) throw error;
          triggerPetalSuccessBurst();
        }

        categoryModal.classList.remove('active');
        loadCategoriesData();
      } catch (err) {
        alert(`Save failed: ${err.message}`);
      }
    });
  }

  async function toggleCatActive(catId, currentActive) {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ is_active: !currentActive })
        .eq('id', catId);
        
      if (error) throw error;
      loadCategoriesData();
    } catch (e) {
      alert(`Toggle failed: ${e.message}`);
    }
  }

  async function deleteCategory(catId) {
    if (!confirm("Deleting this category will delete all items inside it! Are you absolutely sure?")) return;
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', catId);
        
      if (error) throw error;
      loadCategoriesData();
    } catch (e) {
      alert(`Delete failed: ${e.message}`);
    }
  }

  /* ==========================================================================
     4B. CRUD 2B: CAMPAIGN OFFERS MANAGER
     ========================================================================== */
  async function loadOffersData() {
    try {
      const { data: offers, error } = await supabase
        .from('offers')
        .select('*')
        .order('display_order', { ascending: true });
        
      if (error) throw error;
      
      const tbody = document.getElementById('offers-table-body');
      tbody.innerHTML = '';
      
      if (offers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No offers active. Click 'Add New Offer' to launch one!</td></tr>`;
        return;
      }

      offers.forEach(offer => {
        const bannerImg = offer.image_url 
          ? `<img src="${offer.image_url}" class="image-preview-thumbnail" style="width:70px;height:45px;" alt="${offer.title}">`
          : `<span style="color:#94a3b8;font-size:0.75rem;">Text Only</span>`;

        const statusBadgeColor = offer.is_active ? '#dcfce7;color:#166534;' : '#fee2e2;color:#991b1b;';
        const isExpired = new Date(offer.end_date) < new Date();
        const durationText = `${offer.start_date} to ${offer.end_date}`;

        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${bannerImg}</td>
          <td><strong>${offer.title}</strong>${offer.description ? `<p style="font-size:0.75rem;color:#64748b;margin:2px 0 0 0;">${offer.description}</p>` : ''}</td>
          <td><span class="status-badge" style="background-color:rgba(230,0,126,0.1);color:var(--accent-magenta);font-weight:700;">${offer.badge_text || 'None'}</span></td>
          <td><span style="font-size:0.8rem;">${durationText}</span>${isExpired ? ` <span class="status-badge" style="background:#fee2e2;color:#ef4444;font-size:0.65rem;margin-left:4px;">Expired</span>` : ''}</td>
          <td>
            <button class="status-badge btn-offer-toggle-active" data-id="${offer.id}" data-active="${offer.is_active}" style="cursor:pointer; background-color:${statusBadgeColor}">
              ${offer.is_active ? 'Active' : 'Inactive'}
            </button>
          </td>
          <td>${offer.display_order}</td>
          <td>
            <button class="btn-edit-offer" data-id="${offer.id}" style="color:var(--navy-dark);margin-right:10px;font-weight:700;cursor:pointer;"><i data-lucide="edit-3" style="width:14px;height:14px;vertical-align:text-bottom;"></i> Edit</button>
            <button class="btn-duplicate-offer" data-id="${offer.id}" style="color:var(--primary-pink);margin-right:10px;font-weight:700;cursor:pointer;"><i data-lucide="copy" style="width:14px;height:14px;vertical-align:text-bottom;"></i> Copy</button>
            <button class="btn-delete-offer" data-id="${offer.id}" style="color:#ef4444;font-weight:700;cursor:pointer;"><i data-lucide="trash-2" style="width:14px;height:14px;vertical-align:text-bottom;"></i> Delete</button>
          </td>
        `;
        tbody.appendChild(row);
      });

      // Bind actions
      tbody.querySelectorAll('.btn-offer-toggle-active').forEach(b => {
        b.addEventListener('click', () => toggleOfferActive(b.getAttribute('data-id'), b.getAttribute('data-active') === 'true'));
      });
      tbody.querySelectorAll('.btn-edit-offer').forEach(b => {
        b.addEventListener('click', () => editOffer(b.getAttribute('data-id')));
      });
      tbody.querySelectorAll('.btn-duplicate-offer').forEach(b => {
        b.addEventListener('click', () => duplicateOffer(b.getAttribute('data-id')));
      });
      tbody.querySelectorAll('.btn-delete-offer').forEach(b => {
        b.addEventListener('click', () => deleteOffer(b.getAttribute('data-id')));
      });

      if (window.lucide) window.lucide.createIcons();
    } catch (err) {
      console.error("Offers failed to load:", err);
    }
  }

  const addOfferBtn = document.getElementById('btn-add-offer-trigger');
  if (addOfferBtn) {
    addOfferBtn.addEventListener('click', () => openOfferModal());
  }

  if (closeOfferModalBtn) {
    closeOfferModalBtn.addEventListener('click', () => {
      offerModal.classList.remove('active');
      editingOffer = null;
    });
  }

  function openOfferModal(offer = null) {
    if (!offerModal) return;
    
    offerForm.reset();
    document.getElementById('form-offer-image-status').textContent = '';
    
    if (offer) {
      document.getElementById('offer-modal-title').textContent = "Edit Promotional Campaign";
      document.getElementById('offer-id').value = offer.id;
      document.getElementById('form-offer-title').value = offer.title;
      document.getElementById('form-offer-badge').value = offer.badge_text || '';
      document.getElementById('form-offer-order').value = offer.display_order;
      document.getElementById('form-offer-start').value = offer.start_date;
      document.getElementById('form-offer-end').value = offer.end_date;
      document.getElementById('form-offer-desc').value = offer.description || '';
      document.getElementById('form-offer-active').checked = offer.is_active;

      if (offer.image_url) {
        document.getElementById('form-offer-image-status').textContent = "Current banner: " + offer.image_url.split('/').pop();
      }
    } else {
      document.getElementById('offer-modal-title').textContent = "Add Promotional Campaign";
      document.getElementById('offer-id').value = '';
      editingOffer = null;
      
      // Default start/end dates
      const today = new Date().toISOString().split('T')[0];
      document.getElementById('form-offer-start').value = today;
      
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      document.getElementById('form-offer-end').value = nextWeek.toISOString().split('T')[0];
    }
    
    offerModal.classList.add('active');
  }

  async function editOffer(offerId) {
    try {
      const { data: offer, error } = await supabase
        .from('offers')
        .select('*')
        .eq('id', offerId)
        .single();
      if (error) throw error;
      
      editingOffer = offer;
      openOfferModal(offer);
    } catch (e) {
      alert(`Load failed: ${e.message}`);
    }
  }

  if (offerForm) {
    offerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = offerForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Saving Campaign...";

      const id = document.getElementById('offer-id').value;
      const title = document.getElementById('form-offer-title').value.trim();
      const badge = document.getElementById('form-offer-badge').value.trim();
      const order = parseInt(document.getElementById('form-offer-order').value || 0, 10);
      const start = document.getElementById('form-offer-start').value;
      const end = document.getElementById('form-offer-end').value;
      const desc = document.getElementById('form-offer-desc').value.trim();
      const active = document.getElementById('form-offer-active').checked;

      let imageUrl = editingOffer ? editingOffer.image_url : null;
      const imageInput = document.getElementById('form-offer-image');

      if (imageInput.files.length > 0) {
        const file = imageInput.files[0];
        const ext = file.name.split('.').pop();
        const path = `offers/${Math.random().toString(36).substring(2)}.${ext}`;
        try {
          const { error: uploadErr } = await supabase.storage.from('cafe-uploads').upload(path, file);
          if (uploadErr) throw uploadErr;
          
          const { data } = supabase.storage.from('cafe-uploads').getPublicUrl(path);
          imageUrl = data.publicUrl;
        } catch (err) {
          alert(`Banner upload failed: ${err.message}`);
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
          return;
        }
      }

      const payload = {
        title: title,
        description: desc || null,
        badge_text: badge || null,
        image_url: imageUrl,
        start_date: start,
        end_date: end,
        is_active: active,
        display_order: order
      };

      try {
        if (id) {
          const { error } = await supabase.from('offers').update(payload).eq('id', id);
          if (error) throw error;
          triggerPetalSuccessBurst();
        } else {
          const { error } = await supabase.from('offers').insert([payload]);
          if (error) throw error;
          triggerPetalSuccessBurst();
        }
        
        offerModal.classList.remove('active');
        loadOffersData();
      } catch (err) {
        alert(`Save failed: ${err.message}`);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }

  async function duplicateOffer(offerId) {
    try {
      const { data: offer, error } = await supabase.from('offers').select('*').eq('id', offerId).single();
      if (error) throw error;

      // Reset values
      delete offer.id;
      delete offer.created_at;
      delete offer.updated_at;
      offer.title = `${offer.title} (Copy)`;

      const { error: insertErr } = await supabase.from('offers').insert([offer]);
      if (insertErr) throw insertErr;

      triggerPetalSuccessBurst();
      loadOffersData();
    } catch (e) {
      alert(`Duplicate failed: ${e.message}`);
    }
  }

  async function toggleOfferActive(offerId, currentActive) {
    try {
      const { error } = await supabase.from('offers').update({ is_active: !currentActive }).eq('id', offerId);
      if (error) throw error;
      loadOffersData();
    } catch (e) {
      alert(`Toggle failed: ${e.message}`);
    }
  }

  async function deleteOffer(offerId) {
    if (!confirm("Are you sure you want to remove this promotion?")) return;
    try {
      const { error } = await supabase.from('offers').delete().eq('id', offerId);
      if (error) throw error;
      loadOffersData();
    } catch (e) {
      alert(`Delete failed: ${e.message}`);
    }
  }

  /* ==========================================================================
     4C. FEATURE: SCAN MENU PHOTO ANALYSIS (Gemini vision client API)
     ========================================================================== */
  function resetScannerUI() {
    scannerUploadCard.style.display = 'block';
    scannerLoadingCard.style.display = 'none';
    scannerReviewCard.style.display = 'none';
    scanSelectedFiles = [];
    scanSelectedFilesContainer.innerHTML = '';
    scanStartActions.style.display = 'none';
    scanFileInput.value = '';
  }

  if (scanDragDrop) {
    scanDragDrop.addEventListener('click', () => scanFileInput.click());
    
    // Drag/drop setup
    ['dragenter', 'dragover'].forEach(eventName => {
      scanDragDrop.addEventListener(eventName, (e) => { e.preventDefault(); scanDragDrop.style.borderColor = 'var(--accent-magenta)'; }, false);
    });
    ['dragleave', 'drop'].forEach(eventName => {
      scanDragDrop.addEventListener(eventName, (e) => { e.preventDefault(); scanDragDrop.style.borderColor = ''; }, false);
    });
    
    scanDragDrop.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files.length > 0) addScanFiles(files);
    });
  }

  if (scanFileInput) {
    scanFileInput.addEventListener('change', () => {
      if (scanFileInput.files.length > 0) addScanFiles(scanFileInput.files);
    });
  }

  function addScanFiles(files) {
    for (let i = 0; i < Math.min(files.length, 3); i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        scanSelectedFiles.push(file);
      }
    }
    renderSelectedScanFiles();
  }

  function renderSelectedScanFiles() {
    scanSelectedFilesContainer.innerHTML = '';
    
    if (scanSelectedFiles.length === 0) {
      scanStartActions.style.display = 'none';
      return;
    }

    scanSelectedFiles.forEach((file, index) => {
      const fileRow = document.createElement('div');
      fileRow.style.display = 'flex';
      fileRow.style.justifyContent = 'space-between';
      fileRow.style.alignItems = 'center';
      fileRow.style.padding = '10px 15px';
      fileRow.style.background = '#e2e8f0';
      fileRow.style.borderRadius = 'var(--radius-sm)';
      fileRow.style.fontSize = '0.9rem';

      fileRow.innerHTML = `
        <span style="font-weight:600;"><i data-lucide="file-image" style="width:16px;height:16px;vertical-align:middle;margin-right:6px;"></i> ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)</span>
        <button type="button" class="btn-remove-scan-file" data-index="${index}" style="color:#ef4444;font-weight:700;cursor:pointer;"><i data-lucide="x" style="width:16px;height:16px;"></i></button>
      `;
      scanSelectedFilesContainer.appendChild(fileRow);
    });

    scanSelectedFilesContainer.querySelectorAll('.btn-remove-scan-file').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(btn.getAttribute('data-index'), 10);
        scanSelectedFiles.splice(index, 1);
        renderSelectedScanFiles();
      });
    });

    scanStartActions.style.display = 'flex';
    if (window.lucide) window.lucide.createIcons();
  }

  if (btnStartAiScan) {
    btnStartAiScan.addEventListener('click', async () => {
      if (scanSelectedFiles.length === 0) return;

      scannerUploadCard.style.display = 'none';
      scannerLoadingCard.style.display = 'block';

      // Check for Gemini API key
      if (!geminiApiKey) {
        // Run mock extraction if API key isn't provided
        updateScanProgress("API key blank. Initiating high-fidelity scan simulation...");
        setTimeout(() => updateScanProgress("Reading text grids from images..."), 1200);
        setTimeout(() => updateScanProgress("Running menu comparison engines..."), 2600);
        setTimeout(() => {
          const simulatedResults = getMockScanResults();
          buildDiffReviewScreen(simulatedResults);
        }, 4000);
      } else {
        // Run Gemini Vision API Call
        try {
          updateScanProgress("Reading menu photo files...");
          const base64Images = [];
          for (const file of scanSelectedFiles) {
            const b64 = await convertFileToBase64(file);
            base64Images.push(b64);
          }

          updateScanProgress("Sending images to Gemini 2.5 Flash API...");
          
          const results = [];
          for (let i = 0; i < base64Images.length; i++) {
            updateScanProgress(`Analyzing page ${i+1} of ${base64Images.length} with Gemini...`);
            const pageData = await callGeminiVision(base64Images[i]);
            results.push(...pageData);
          }

          buildDiffReviewScreen(results);
        } catch (err) {
          alert(`Gemini AI scan failed: ${err.message}`);
          resetScannerUI();
        }
      }
    });
  }

  function updateScanProgress(text) {
    const textEl = document.getElementById('scan-progress-text');
    if (textEl) textEl.textContent = text;
  }

  function convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Extract raw Base64 string from data URL
        const raw = reader.result.split(',')[1];
        resolve(raw);
      };
      reader.onerror = error => reject(error);
    });
  }

  async function callGeminiVision(base64Data) {
    const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
    
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `Extract all menu items from this printed menu photo page. Output ONLY a raw JSON array. DO NOT wrap it in markdown block fences. Each object in the array MUST have these keys:
- category: string (the category name e.g. 'Pizza', 'Sandwiches', 'Shakes')
- name: string (the item name)
- description: string (the descriptions if listed, otherwise null)
- price_small: number or null (small / standard size cost)
- price_medium: number or null (medium / standard single cost)
- price_large: number or null (large size cost)
- price_xxxl: number or null (xxxl drinks cost)
- is_veg: boolean (true if veg / green dot, false if contains meat)
- is_spicy: boolean (true if spicy or flame tag is shown, else false)
- is_must_try: boolean (true if musttry or crown tag is shown, else false)
- confidence: number (from 0.0 to 1.0, representing text clarity)`
            },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Data
              }
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json"
      }
    };

    const response = await fetch(apiURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Google API responded with status ${response.status}`);
    }

    const data = await response.json();
    try {
      const contentText = data.candidates[0].content.parts[0].text;
      return JSON.parse(contentText);
    } catch (e) {
      console.error("Gemini response parsing error. Raw response text:", data);
      throw new Error("Unable to parse structured JSON from Gemini API response.");
    }
  }

  function getMockScanResults() {
    return [
      {
        category: "Pizza",
        name: "Woodfired Garlic Mushroom Pizza",
        description: "Fresh button mushrooms, truffle oil, and roasted garlic cream cheese burst.",
        price_small: 189,
        price_medium: 349,
        price_large: 459,
        price_xxxl: null,
        is_veg: true,
        is_spicy: false,
        is_must_try: true,
        confidence: 0.95
      },
      {
        category: "Pizza",
        name: "Veg Supreme Pizza", // Existing pizza
        description: "Classic pizza loaded with bell peppers, onion, sweet corn and mozzarella.",
        price_small: 169, // Old: 149 -> change
        price_medium: 329, // Old: 299 -> change
        price_large: 429, // Old: 395 -> change
        price_xxxl: null,
        is_veg: true,
        is_spicy: false,
        is_must_try: false,
        confidence: 0.90
      },
      {
        category: "Sandwiches",
        name: "Pink Paradise Burger", // Existing burger item in DB
        description: "Beetroot-dyed soft pink buns, crispy vegetable patty, and signature herb cream sauce.",
        price_small: null,
        price_medium: 169, // Old: 159 -> change
        price_large: null,
        price_xxxl: null,
        is_veg: true,
        is_spicy: false,
        is_must_try: true,
        confidence: 0.88
      },
      {
        category: "Drinks",
        name: "Fior di Latte Shake",
        description: "Sweet milk cream base whipped with roasted vanilla pod syrup.",
        price_small: null,
        price_medium: 149,
        price_large: 199,
        price_xxxl: null,
        is_veg: true,
        is_spicy: false,
        is_must_try: false,
        confidence: 0.72 // Low confidence test!
      }
    ];
  }

  // Diff Builder Screen
  function buildDiffReviewScreen(scannedItems) {
    scannerLoadingCard.style.display = 'none';
    scannerReviewCard.style.display = 'block';
    
    scanDiffTbody.innerHTML = '';
    scanDiffItems = scannedItems;

    // Cache categories to build dropdown options inside cell inputs
    let catOptions = '';
    allCategories.forEach(cat => {
      catOptions += `<option value="${cat.name}">${cat.name}</option>`;
    });

    scannedItems.forEach((item, index) => {
      // Find matching item in DB
      const dbMatch = dbActiveItems.find(db => db.name.toLowerCase().trim() === item.name.toLowerCase().trim());
      
      let statusText = '';
      let rowClass = '';
      
      if (!dbMatch) {
        statusText = `<span class="status-badge" style="background:#dcfce7;color:#166534;">New Item</span>`;
        rowClass = 'diff-row-new';
      } else {
        // Compare standard price (price_medium)
        const isPriceDifferent = 
          (dbMatch.price_small !== item.price_small) ||
          (dbMatch.price_medium !== item.price_medium) ||
          (dbMatch.price_large !== item.price_large) ||
          (dbMatch.price_xxxl !== item.price_xxxl);
          
        if (isPriceDifferent) {
          statusText = `<span class="status-badge" style="background:#fef3c7;color:#92400e;">Price Edit</span>`;
          rowClass = 'diff-row-changed';
        } else {
          statusText = `<span class="status-badge" style="background:#f1f5f9;color:#475569;">No Change</span>`;
        }
      }

      // Check confidence level
      const confidenceWarning = item.confidence < 0.8 
        ? `<i data-lucide="alert-triangle" style="width:16px;height:16px;color:#d97706;vertical-align:middle;margin-left:4px;" title="Low AI Confidence (${Math.round(item.confidence*100)}%)"></i>`
        : '';

      const inputClass = item.confidence < 0.8 ? 'diff-input-inline diff-low-confidence' : 'diff-input-inline';

      const row = document.createElement('tr');
      if (rowClass) row.classList.add(rowClass);
      
      // Inline templates
      row.innerHTML = `
        <td>${statusText}${confidenceWarning}</td>
        <td>
          <input type="text" value="${item.name}" class="${inputClass} cell-item-name" data-index="${index}">
        </td>
        <td>
          <select class="diff-input-inline cell-item-category" data-index="${index}">
            <option value="${item.category}" selected>${item.category}</option>
            ${catOptions}
          </select>
        </td>
        <td>
          ${dbMatch && dbMatch.price_medium !== item.price_medium ? `<span class="diff-cell-old-price">₹${dbMatch.price_medium || 0}</span>` : ''}
          <input type="number" value="${item.price_medium || ''}" class="diff-input-inline cell-item-price-m" data-index="${index}" style="width:70px;">
        </td>
        <td>
          <div style="display:flex; flex-direction:column; gap:4px; font-size:0.75rem;">
            <label>S: <input type="number" value="${item.price_small || ''}" class="diff-input-inline cell-item-price-s" data-index="${index}" style="width:55px;padding:3px;"></label>
            <label>L: <input type="number" value="${item.price_large || ''}" class="diff-input-inline cell-item-price-l" data-index="${index}" style="width:55px;padding:3px;"></label>
            <label>XXXL: <input type="number" value="${item.price_xxxl || ''}" class="diff-input-inline cell-item-price-xxxl" data-index="${index}" style="width:55px;padding:3px;"></label>
          </div>
        </td>
        <td>
          <textarea rows="1" class="diff-input-inline cell-item-desc" data-index="${index}" style="min-width:140px; font-size:0.8rem;">${item.description || ''}</textarea>
        </td>
        <td>
          <div style="display:flex; flex-direction:column; gap:4px; font-size:0.8rem;">
            <label><input type="checkbox" class="cell-item-veg" data-index="${index}" ${item.is_veg ? 'checked' : ''}> Veg</label>
            <label><input type="checkbox" class="cell-item-must" data-index="${index}" ${item.is_must_try ? 'checked' : ''}> Crown</label>
            <label><input type="checkbox" class="cell-item-spicy" data-index="${index}" ${item.is_spicy ? 'checked' : ''}> Spicy</label>
          </div>
        </td>
        <td>
          <button type="button" class="btn-remove-diff-row" data-index="${index}" style="color:#ef4444;font-weight:700;cursor:pointer;font-size:0.8rem;"><i data-lucide="trash"></i> Skip</button>
        </td>
      `;

      scanDiffTbody.appendChild(row);
    });

    // Determine Missing Items (not in scanned list)
    const scannedNames = scannedItems.map(si => si.name.toLowerCase().trim());
    const missingItems = dbActiveItems.filter(db => !scannedNames.includes(db.name.toLowerCase().trim()));

    if (missingItems.length > 0) {
      scanMissingItemsBox.style.display = 'block';
      scanMissingList.innerHTML = '';
      
      missingItems.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.style.display = 'flex';
        itemDiv.style.alignItems = 'center';
        itemDiv.style.gap = '10px';
        itemDiv.style.fontSize = '0.9rem';
        
        itemDiv.innerHTML = `
          <label style="cursor:pointer; display:inline-flex; align-items:center; gap:8px;">
            <input type="checkbox" class="cell-missing-keep-checkbox" data-id="${item.id}" checked>
            <strong>${item.name}</strong> <span style="font-size:0.8rem;color:#64748b;">(Category: ${item.categories ? item.categories.name : 'Unknown'})</span>
          </label>
        `;
        scanMissingList.appendChild(itemDiv);
      });
    } else {
      scanMissingItemsBox.style.display = 'none';
    }

    // Bind skips
    scanDiffTbody.querySelectorAll('.btn-remove-diff-row').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.getAttribute('data-index'), 10);
        btn.closest('tr').remove();
        // Nullify in data payload so we skip it upon save
        scanDiffItems[index] = null;
      });
    });

    if (window.lucide) window.lucide.createIcons();
  }

  // Cancel Diff Screen
  if (btnCancelScanReview) {
    btnCancelScanReview.addEventListener('click', () => {
      if (confirm("Discard all scanned items?")) resetScannerUI();
    });
  }

  // Publish Scanned Items bulk update
  if (btnPublishScanChanges) {
    btnPublishScanChanges.addEventListener('click', async () => {
      btnPublishScanChanges.disabled = true;
      btnPublishScanChanges.textContent = "Publishing Changes...";

      // Get values from Diff inputs
      const finalItems = [];
      const rows = scanDiffTbody.querySelectorAll('tr');
      
      rows.forEach(row => {
        const nameInput = row.querySelector('.cell-item-name');
        if (!nameInput) return; // skipped row
        
        const index = parseInt(nameInput.getAttribute('data-index'), 10);
        if (scanDiffItems[index] === null) return; // skipped

        const name = nameInput.value.trim();
        const category = row.querySelector('.cell-item-category').value;
        const pMedium = parseFloat(row.querySelector('.cell-item-price-m').value) || null;
        const pSmall = parseFloat(row.querySelector('.cell-item-price-s').value) || null;
        const pLarge = parseFloat(row.querySelector('.cell-item-price-l').value) || null;
        const pXxxl = parseFloat(row.querySelector('.cell-item-price-xxxl').value) || null;
        const desc = row.querySelector('.cell-item-desc').value.trim();
        const isVeg = row.querySelector('.cell-item-veg').checked;
        const isMust = row.querySelector('.cell-item-must').checked;
        const isSpicy = row.querySelector('.cell-item-spicy').checked;

        finalItems.push({
          name: name,
          category: category,
          description: desc || null,
          price_small: pSmall,
          price_medium: pMedium,
          price_large: pLarge,
          price_xxxl: pXxxl,
          is_veg: isVeg,
          is_must_try: isMust,
          is_spicy: isSpicy
        });
      });

      try {
        // Bulk write process
        for (const item of finalItems) {
          // Find or create category
          let categoryId = "";
          const dbCat = allCategories.find(c => c.name.toLowerCase().trim() === item.category.toLowerCase().trim());
          
          if (dbCat) {
            categoryId = dbCat.id;
          } else {
            // Create Category
            const { data: newCat, error: catErr } = await supabase
              .from('categories')
              .insert([{ name: item.category, display_order: 100, is_active: true }])
              .select()
              .single();
            if (catErr) throw catErr;
            
            categoryId = newCat.id;
            allCategories.push(newCat); // cache it
          }

          // Check if item exists in DB by name
          const dbMatch = dbActiveItems.find(db => db.name.toLowerCase().trim() === item.name.toLowerCase().trim());
          
          const payload = {
            category_id: categoryId,
            name: item.name,
            description: item.description,
            price_small: item.price_small,
            price_medium: item.price_medium,
            price_large: item.price_large,
            price_xxxl: item.price_xxxl,
            is_veg: item.is_veg,
            is_must_try: item.is_must_try,
            is_spicy: item.is_spicy,
            is_active: true
          };

          if (dbMatch) {
            // Update
            const { error: updErr } = await supabase
              .from('menu_items')
              .update(payload)
              .eq('id', dbMatch.id);
            if (updErr) throw updErr;
          } else {
            // Insert
            const { error: insErr } = await supabase
              .from('menu_items')
              .insert([payload]);
            if (insErr) throw insErr;
          }
        }

        // Handle missing items deactivations
        const checkboxes = scanMissingList.querySelectorAll('.cell-missing-keep-checkbox');
        for (const cb of checkboxes) {
          if (!cb.checked) {
            const itemId = cb.getAttribute('data-id');
            const { error: deacErr } = await supabase
              .from('menu_items')
              .update({ is_active: false })
              .eq('id', itemId);
            if (deacErr) throw deacErr;
          }
        }

        triggerPetalSuccessBurst();
        resetScannerUI();
        
        // Return to Menu Tab & reload
        const menuBtn = document.querySelector('.sidebar-btn[data-tab="tab-menu"]');
        if (menuBtn) menuBtn.click();
        
      } catch (saveErr) {
        alert(`Failed to save scanned changes: ${saveErr.message}`);
      } finally {
        btnPublishScanChanges.disabled = false;
        btnPublishScanChanges.textContent = "Update My Menu";
      }
    });
  }

  /* ==========================================================================
     5. CRUD 3: GALLERY MANAGER (File upload & display)
     ========================================================================== */
  async function loadGalleryData() {
    try {
      const { data: images, error } = await supabase
        .from('gallery_images')
        .select('*')
        .order('display_order', { ascending: true });
        
      if (error) throw error;
      
      const grid = document.getElementById('gallery-images-grid');
      grid.innerHTML = '';
      
      if (images.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; padding: 20px; color: var(--navy-muted);">No images uploaded yet.</p>`;
        return;
      }

      images.forEach(img => {
        const card = document.createElement('div');
        card.classList.add('admin-card');
        card.style.padding = '15px';
        card.style.marginBottom = '0';
        
        card.innerHTML = `
          <div style="height:160px; overflow:hidden; border-radius:var(--radius-sm); margin-bottom:12px;">
            <img src="${img.image_url}" alt="Gallery" style="width:100%; height:100%; object-fit:cover;">
          </div>
          <div style="display:flex; flex-direction:column; gap:8px;">
            <input type="text" value="${img.caption || ''}" placeholder="Enter caption..." class="gallery-caption-input" data-id="${img.id}" style="padding:6px; font-size:0.8rem; border:1px solid #cbd5e1; border-radius:4px; outline:none;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <label style="font-size:0.75rem; font-weight:700;">Order: 
                <input type="number" value="${img.display_order}" class="gallery-order-input" data-id="${img.id}" style="width:45px; padding:3px; font-size:0.75rem; border:1px solid #cbd5e1; border-radius:4px;">
              </label>
              <button class="btn-delete-gallery" data-id="${img.id}" style="color:#ef4444; font-size:0.8rem; font-weight:700; cursor:pointer;"><i data-lucide="trash-2" style="width:14px; height:14px; vertical-align:text-bottom;"></i> Remove</button>
            </div>
          </div>
        `;
        
        grid.appendChild(card);
      });

      grid.querySelectorAll('.gallery-caption-input').forEach(input => {
        input.addEventListener('blur', () => updateGalleryCaption(input.getAttribute('data-id'), input.value.trim()));
      });
      grid.querySelectorAll('.gallery-order-input').forEach(input => {
        input.addEventListener('change', () => updateGalleryOrder(input.getAttribute('data-id'), parseInt(input.value || 0, 10)));
      });
      grid.querySelectorAll('.btn-delete-gallery').forEach(btn => {
        btn.addEventListener('click', () => deleteGalleryImage(btn.getAttribute('data-id')));
      });

      if (window.lucide) window.lucide.createIcons();
    } catch (err) {
      console.error("Gallery loading failed:", err);
    }
  }

  const dropZone = document.getElementById('gallery-drag-drop');
  const fileInput = document.getElementById('gallery-file-input');

  if (dropZone) {
    dropZone.addEventListener('click', () => fileInput.click());
    
    ['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => { e.preventDefault(); dropZone.style.borderColor = 'var(--accent-magenta)'; }, false);
    });
    ['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => { e.preventDefault(); dropZone.style.borderColor = ''; }, false);
    });
    
    dropZone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files.length > 0) handleGalleryUpload(files[0]);
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', () => {
      if (fileInput.files.length > 0) handleGalleryUpload(fileInput.files[0]);
    });
  }

  async function handleGalleryUpload(file) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `gallery/${fileName}`;

    const textEl = dropZone.querySelector('p');
    const originalText = textEl.innerHTML;
    textEl.innerHTML = `<i data-lucide="loader" class="animate-spin" style="width:16px;height:16px;vertical-align:middle;display:inline-block;"></i> Uploading file to storage...`;
    if (window.lucide) window.lucide.createIcons();

    try {
      const { error: uploadError } = await supabase.storage
        .from('cafe-uploads')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('cafe-uploads')
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      const { error: dbErr } = await supabase
        .from('gallery_images')
        .insert([{
          image_url: publicUrl,
          caption: '',
          display_order: 10,
          is_active: true
        }]);

      if (dbErr) throw dbErr;
      
      textEl.innerHTML = `<i data-lucide="check" style="color:#2e7d32"></i> Success! File uploaded.`;
      if (window.lucide) window.lucide.createIcons();
      
      setTimeout(() => { textEl.innerHTML = originalText; }, 2000);
      loadGalleryData();
    } catch (err) {
      alert(`Upload failed: ${err.message}`);
      textEl.innerHTML = originalText;
    }
  }

  async function updateGalleryCaption(imgId, captionText) {
    try {
      const { error } = await supabase
        .from('gallery_images')
        .update({ caption: captionText })
        .eq('id', imgId);
      if (error) throw error;
    } catch (e) {
      console.error("Caption update failed:", e);
    }
  }

  async function updateGalleryOrder(imgId, orderVal) {
    try {
      const { error } = await supabase
        .from('gallery_images')
        .update({ display_order: orderVal })
        .eq('id', imgId);
      if (error) throw error;
      loadGalleryData();
    } catch (e) {
      console.error("Order update failed:", e);
    }
  }

  async function deleteGalleryImage(imgId) {
    if (!confirm("Remove this image from the gallery?")) return;
    try {
      const { error } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', imgId);
      if (error) throw error;
      loadGalleryData();
    } catch (e) {
      alert(`Delete failed: ${e.message}`);
    }
  }

  /* ==========================================================================
     6. RESERVATIONS INBOX
     ========================================================================== */
  async function loadReservationsData() {
    try {
      const { data: bookings, error } = await supabase
        .from('reservations')
        .select('*')
        .order('date', { ascending: false })
        .order('time', { ascending: false });
        
      if (error) throw error;

      const tbody = document.getElementById('reservations-table-body');
      tbody.innerHTML = '';
      
      if (bookings.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;">No reservation requests found.</td></tr>`;
        return;
      }

      bookings.forEach(res => {
        let actionButtons = '';
        if (res.status === 'new') {
          actionButtons = `
            <button class="btn-confirm-res" data-id="${res.id}" style="color:#166534; font-weight:700; margin-right:12px; cursor:pointer;"><i data-lucide="check" style="width:14px;height:14px;vertical-align:text-top;"></i> Confirm</button>
            <button class="btn-cancel-res" data-id="${res.id}" style="color:#ef4444; font-weight:700; cursor:pointer;"><i data-lucide="x" style="width:14px;height:14px;vertical-align:text-top;"></i> Cancel</button>
          `;
        } else {
          actionButtons = `<span style="color:#94a3b8; font-size:0.8rem;">Processed</span>`;
        }

        const row = document.createElement('tr');
        row.innerHTML = `
          <td><strong>${res.name}</strong></td>
          <td>${res.phone}</td>
          <td>${res.date}</td>
          <td>${res.time}</td>
          <td>${res.party_size}</td>
          <td><span style="font-size:0.85rem;color:#475569;">${res.occasion_note || 'None'}</span></td>
          <td><span class="status-badge ${res.status}">${res.status}</span></td>
          <td>${actionButtons}</td>
        `;
        tbody.appendChild(row);
      });

      tbody.querySelectorAll('.btn-confirm-res').forEach(btn => {
        btn.addEventListener('click', () => updateResStatus(btn.getAttribute('data-id'), 'confirmed'));
      });
      tbody.querySelectorAll('.btn-cancel-res').forEach(btn => {
        btn.addEventListener('click', () => updateResStatus(btn.getAttribute('data-id'), 'cancelled'));
      });

      if (window.lucide) window.lucide.createIcons();
    } catch (err) {
      console.error("Reservations loading failed:", err);
    }
  }

  async function updateResStatus(resId, statusVal) {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status: statusVal })
        .eq('id', resId);
      if (error) throw error;
      loadReservationsData();
    } catch (e) {
      alert(`Update status failed: ${e.message}`);
    }
  }

  /* ==========================================================================
     7. CONTACT MESSAGES INBOX
     ========================================================================== */
  async function loadMessagesData() {
    try {
      const { data: messages, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;

      const tbody = document.getElementById('messages-table-body');
      tbody.innerHTML = '';
      
      if (messages.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No messages found.</td></tr>`;
        return;
      }

      messages.forEach(msg => {
        let action = '';
        if (msg.status === 'unread') {
          action = `<button class="btn-read-msg" data-id="${msg.id}" style="color:#166534; font-weight:700; cursor:pointer;"><i data-lucide="eye" style="width:14px;height:14px;vertical-align:text-top;"></i> Mark Read</button>`;
        } else {
          action = `<span style="color:#94a3b8; font-size:0.8rem;">Read</span>`;
        }

        const dateStr = new Date(msg.created_at).toLocaleDateString() + ' ' + new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        const row = document.createElement('tr');
        row.innerHTML = `
          <td><strong>${msg.name}</strong></td>
          <td>${msg.email_or_phone}</td>
          <td><p style="max-width:350px; font-size:0.85rem; color:#475569; overflow-wrap:break-word;">${msg.message}</p></td>
          <td>${dateStr}</td>
          <td><span class="status-badge ${msg.status}">${msg.status}</span></td>
          <td>${action}</td>
        `;
        tbody.appendChild(row);
      });

      tbody.querySelectorAll('.btn-read-msg').forEach(btn => {
        btn.addEventListener('click', () => markMessageRead(btn.getAttribute('data-id')));
      });

      if (window.lucide) window.lucide.createIcons();
    } catch (err) {
      console.error("Messages inbox loading failed:", err);
    }
  }

  async function markMessageRead(msgId) {
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .update({ status: 'read' })
        .eq('id', msgId);
      if (error) throw error;
      loadMessagesData();
    } catch (e) {
      console.error("Mark read failed:", e);
    }
  }

  /* ==========================================================================
     8. CAFE SETTINGS PAGE
     ========================================================================== */
  async function loadSettingsData() {
    try {
      const { data, error } = await supabase
        .from('cafe_settings')
        .select('*')
        .limit(1)
        .single();
        
      if (error) throw error;
      if (!data) return;

      document.getElementById('settings-phone').value = data.phone;
      document.getElementById('settings-whatsapp').value = data.whatsapp_number;
      document.getElementById('settings-email').value = data.email;
      document.getElementById('settings-address').value = data.address;
      document.getElementById('settings-map-url').value = data.map_embed_url || '';
      document.getElementById('settings-instagram').value = data.instagram_url || '';
      document.getElementById('settings-facebook').value = data.facebook_url || '';
      document.getElementById('settings-gemini-key').value = data.gemini_api_key || '';
      
      geminiApiKey = data.gemini_api_key || ''; // cache locally

      const hoursFieldsContainer = document.getElementById('hours-config-fields');
      hoursFieldsContainer.innerHTML = '';
      
      const days = {
        mon: "Monday", tue: "Tuesday", wed: "Wednesday",
        thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday"
      };

      const hours = data.hours_json || {};

      for (const [key, label] of Object.entries(days)) {
        const formGroup = document.createElement('div');
        formGroup.classList.add('form-group');
        formGroup.style.gap = '4px';
        formGroup.innerHTML = `
          <label for="hours-${key}" style="font-size:0.75rem;">${label}</label>
          <input type="text" id="hours-${key}" required value="${hours[key] || '11:00 AM to 10:15 PM'}" style="padding: 10px 14px;">
        `;
        hoursFieldsContainer.appendChild(formGroup);
      }
      
    } catch (err) {
      console.error("Settings load failed:", err);
    }
  }

  if (settingsForm) {
    settingsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = settingsForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Saving...";

      const phone = document.getElementById('settings-phone').value.trim();
      const whatsapp = document.getElementById('settings-whatsapp').value.trim();
      const email = document.getElementById('settings-email').value.trim();
      const address = document.getElementById('settings-address').value.trim();
      const mapUrl = document.getElementById('settings-map-url').value.trim();
      const insta = document.getElementById('settings-instagram').value.trim();
      const fb = document.getElementById('settings-facebook').value.trim();
      const geminiKey = document.getElementById('settings-gemini-key').value.trim();

      const hoursJson = {
        mon: document.getElementById('hours-mon').value.trim(),
        tue: document.getElementById('hours-tue').value.trim(),
        wed: document.getElementById('hours-wed').value.trim(),
        thu: document.getElementById('hours-thu').value.trim(),
        fri: document.getElementById('hours-fri').value.trim(),
        sat: document.getElementById('hours-sat').value.trim(),
        sun: document.getElementById('hours-sun').value.trim()
      };

      try {
        const { error } = await supabase
          .from('cafe_settings')
          .update({
            phone: phone,
            whatsapp_number: whatsapp,
            email: email,
            address: address,
            map_embed_url: mapUrl || null,
            instagram_url: insta || null,
            facebook_url: fb || null,
            hours_json: hoursJson,
            gemini_api_key: geminiKey || null
          })
          .eq('id', '00000000-0000-0000-0000-000000000000'); 

        if (error) throw error;
        
        geminiApiKey = geminiKey; // cache key in memory
        
        triggerPetalSuccessBurst();
        alert("Global configurations saved successfully!");
        loadSettingsData();
      } catch (err) {
        alert(`Save failed: ${err.message}`);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }

  /* ==========================================================================
     9. CELEBRATORY WHIMSICAL PETAL CONFETTI
     ========================================================================== */
  function triggerPetalSuccessBurst() {
    const container = document.getElementById('admin-confetti-container');
    if (!container) return;
    if (document.body.classList.contains('reduced-motion')) return;

    container.innerHTML = '';
    const bubbleCount = 35;
    
    for (let i = 0; i < bubbleCount; i++) {
      const bubble = document.createElement('div');
      bubble.classList.add('confetti-heart');
      
      bubble.style.left = `${Math.random() * 100}%`;
      bubble.style.top = `${Math.random() * -20}%`;
      
      const scale = Math.random() * 0.8 + 0.4;
      bubble.style.transform = `rotate(${Math.random() * 360}deg) scale(${scale})`;
      
      const colors = ['#E6007E', '#F2A6C4', '#D9A441', '#FF4081', '#FFFFFF', '#FFB7D5'];
      bubble.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      
      // Dynamic blossom or heart shapes
      if (Math.random() > 0.5) {
        bubble.style.borderRadius = '50% 0 50% 50%'; // petal leaf shape
      }
      
      const duration = Math.random() * 2 + 1.2; 
      const delay = Math.random() * 0.2;
      
      bubble.style.animation = `floatConfetti ${duration}s cubic-bezier(0.1, 0.8, 0.3, 1) ${delay}s forwards`;
      container.appendChild(bubble);
      
      setTimeout(() => {
        bubble.remove();
      }, (duration + delay) * 1000);
    }
  }

  /* ==========================================================================
     10. UNCONFIGURED PREVIEW MODE (Seeding Mock Data)
     ========================================================================== */
  function loadMockDashboardData() {
    allCategories = [
      { id: "1", name: "Burgers", display_order: 1, is_active: true },
      { id: "2", name: "Pizza", display_order: 2, is_active: true },
      { id: "3", name: "Drinks", display_order: 3, is_active: true }
    ];
    populateCategorySelects();

    const tbody = document.getElementById('menu-items-table-body');
    tbody.innerHTML = `
      <tr>
        <td><span style="color:#64748b;font-size:0.75rem;">Mock Photo</span></td>
        <td><strong>Pink Paradise Burger</strong><p style="font-size:0.75rem;color:#64748b;margin:2px 0 0 0;">Signature bun burger</p></td>
        <td>Burgers</td>
        <td><span class="status-badge" style="background-color:#dcfce7;color:#166534;">Veg</span></td>
        <td>M: ₹159</td>
        <td>1</td>
        <td><span class="status-badge" style="background-color:#dcfce7;color:#166534;">Active</span></td>
        <td><span style="color:#94a3b8; font-size:0.8rem;">Preview Only</span></td>
      </tr>
      <tr>
        <td><span style="color:#64748b;font-size:0.75rem;">Mock Photo</span></td>
        <td><strong>Blue Curacao</strong><p style="font-size:0.75rem;color:#64748b;margin:2px 0 0 0;">Vibrant mocktail</p></td>
        <td>Drinks</td>
        <td><span class="status-badge" style="background-color:#dcfce7;color:#166534;">Veg</span></td>
        <td>M: ₹129 | L: ₹179 | XXXL: ₹549</td>
        <td>2</td>
        <td><span class="status-badge" style="background-color:#dcfce7;color:#166534;">Active</span></td>
        <td><span style="color:#94a3b8; font-size:0.8rem;">Preview Only</span></td>
      </tr>
    `;

    const catTbody = document.getElementById('categories-table-body');
    catTbody.innerHTML = allCategories.map(c => `
      <tr>
        <td><strong>${c.name}</strong></td>
        <td>${c.display_order}</td>
        <td><span class="status-badge" style="background-color:#dcfce7;color:#166534;">Active</span></td>
        <td><span style="color:#94a3b8; font-size:0.8rem;">Preview Only</span></td>
      </tr>
    `).join('');

    const resTbody = document.getElementById('reservations-table-body');
    resTbody.innerHTML = `
      <tr>
        <td><strong>Jane Miller</strong></td>
        <td>+91-9876543210</td>
        <td>2026-07-14</td>
        <td>19:30</td>
        <td>2</td>
        <td><span style="font-size:0.85rem;color:#475569;">Date Night - Window Table</span></td>
        <td><span class="status-badge new">new</span></td>
        <td><span style="color:#94a3b8; font-size:0.8rem;">Preview Only</span></td>
      </tr>
    `;

    const msgTbody = document.getElementById('messages-table-body');
    msgTbody.innerHTML = `
      <tr>
        <td><strong>Rajesh Kumar</strong></td>
        <td>rajesh@gmail.com</td>
        <td><p style="max-width:350px; font-size:0.85rem; color:#475569; overflow-wrap:break-word;">Do you support booking for private birthday parties of 25 people?</p></td>
        <td>07/07/2026 10:45 AM</td>
        <td><span class="status-badge unread">unread</span></td>
        <td><span style="color:#94a3b8; font-size:0.8rem;">Preview Only</span></td>
      </tr>
    `;

    const offersTbody = document.getElementById('offers-table-body');
    offersTbody.innerHTML = `
      <tr>
        <td><span style="color:#94a3b8;font-size:0.75rem;">Mock Banner</span></td>
        <td><strong>Buy 1 Get 1 Free on all Shakes!</strong><p style="font-size:0.75rem;color:#64748b;margin:2px 0 0 0;">Valid on dine-in weekdays.</p></td>
        <td><span class="status-badge" style="background:rgba(230,0,126,0.1);color:var(--accent-magenta);font-weight:700;">BOGO</span></td>
        <td><span style="font-size:0.8rem;">2026-07-07 to 2026-07-14</span></td>
        <td><span class="status-badge" style="background-color:#dcfce7;color:#166534;">Active</span></td>
        <td>1</td>
        <td><span style="color:#94a3b8; font-size:0.8rem;">Preview Only</span></td>
      </tr>
    `;

    const hoursFieldsContainer = document.getElementById('hours-config-fields');
    hoursFieldsContainer.innerHTML = '';
    const days = {
      mon: "Monday", tue: "Tuesday", wed: "Wednesday",
      thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday"
    };
    for (const [key, label] of Object.entries(days)) {
      const formGroup = document.createElement('div');
      formGroup.classList.add('form-group');
      formGroup.style.gap = '4px';
      formGroup.innerHTML = `
        <label for="hours-${key}" style="font-size:0.75rem;">${label}</label>
        <input type="text" id="hours-${key}" required value="11:00 AM to 10:15 PM" style="padding: 10px 14px;">
      `;
      hoursFieldsContainer.appendChild(formGroup);
    }

    // Set up Mock drag drop simulation triggers
    if (scanDragDrop) {
      scanDragDrop.addEventListener('click', () => {
        // Trigger simulated scanning pipeline
        scannerUploadCard.style.display = 'none';
        scannerLoadingCard.style.display = 'block';
        updateScanProgress("Initiating high-fidelity scan simulation...");
        setTimeout(() => updateScanProgress("Reading text grids from images..."), 1000);
        setTimeout(() => updateScanProgress("Running menu comparison engines..."), 2000);
        setTimeout(() => {
          const simulatedResults = getMockScanResults();
          buildDiffReviewScreen(simulatedResults);
        }, 3000);
      });
    }
  }

});
