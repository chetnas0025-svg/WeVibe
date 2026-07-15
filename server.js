require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 8000;
const DB_FILE = path.join(__dirname, 'db.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Ensure uploads folder exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Config Multer for storage uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = crypto.randomUUID() + ext;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Block direct browser access to the private folder containing protected pages
app.use((req, res, next) => {
  if (req.path.startsWith('/private')) {
    return res.status(403).send("Access Denied");
  }
  next();
});

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

const MOCK_JWT_SECRET = 'local-dev-mock-jwt-secret-key-12345';

// Helper function to verify incoming session cookies (mock and Supabase JWT)
function verifySession(req) {
  const token = req.cookies.admin_session;
  if (!token) return null;

  // 1. Try Supabase verification if secret is provided in environment variables
  const supabaseSecret = process.env.SUPABASE_JWT_SECRET;
  if (supabaseSecret) {
    try {
      // Supabase JWT secret is base64-encoded; try buffer first
      const decoded = jwt.verify(token, Buffer.from(supabaseSecret, 'base64'));
      return decoded;
    } catch (e) {
      try {
        // Fall back to literal string verification
        const decoded = jwt.verify(token, supabaseSecret);
        return decoded;
      } catch (err) {
        // Fall through to mock secret check
      }
    }
  }

  // 2. Fall back to local development mock verification
  try {
    const decoded = jwt.verify(token, MOCK_JWT_SECRET);
    return decoded;
  } catch (e) {
    return null;
  }
}

// Authentication gate middleware
function requireAuth(req, res, next) {
  const session = verifySession(req);
  if (!session) {
    return res.status(401).send("Unauthorized: Authentication required.");
  }
  req.user = session;
  next();
}

// Serve static uploads
app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/assets/uploads', express.static(UPLOADS_DIR));

// Helper function to read database JSON
function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    // Initialize DB with seed data from menu.json
    const initialDb = seedInitialData();
    writeDB(initialDb);
    return initialDb;
  }
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    console.error("Error reading database file, resetting:", e);
    const initialDb = seedInitialData();
    writeDB(initialDb);
    return initialDb;
  }
}

// Helper function to write to database JSON
function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// Seed helper
function seedInitialData() {
  console.log("Initializing local database with seed data...");
  let menuData = { categories: [] };
  const menuJsonPath = path.join(__dirname, 'menu.json');
  if (fs.existsSync(menuJsonPath)) {
    try {
      menuData = JSON.parse(fs.readFileSync(menuJsonPath, 'utf8'));
    } catch (e) {
      console.error("Failed to parse menu.json for seeding:", e);
    }
  }

  const seededCategories = [];
  const seededMenuItems = [];

  // Parse menu.json categories and items
  if (Array.isArray(menuData.categories)) {
    menuData.categories.forEach((cat, index) => {
      const catId = crypto.randomUUID();
      seededCategories.push({
        id: catId,
        name: cat.name,
        display_order: (index + 1) * 10,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (Array.isArray(cat.items)) {
        cat.items.forEach((item, itemIdx) => {
          let pSmall = null;
          let pMedium = null;
          let pLarge = null;
          let pXxxl = null;

          if (typeof item.price === 'object') {
            pSmall = item.price.S || item.price.Standard || null;
            pMedium = item.price.M || null;
            pLarge = item.price.L || item.price.Roasted || null;
            pXxxl = item.price.XXXL || null;
          } else {
            pMedium = item.price;
          }

          seededMenuItems.push({
            id: crypto.randomUUID(),
            category_id: catId,
            name: item.name,
            description: item.description || null,
            price_small: pSmall,
            price_medium: pMedium,
            price_large: pLarge,
            price_xxxl: pXxxl,
            is_veg: item.veg !== undefined ? item.veg : true,
            is_must_try: item.mustTry || false,
            is_spicy: item.spicy || false,
            image_url: item.imageUrl || null,
            is_active: true,
            display_order: (itemIdx + 1) * 10,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        });
      }
    });
  }

  // Pre-seed signature items URLs to default assets
  seededMenuItems.forEach(item => {
    if (item.name.includes("Pink Paradise")) {
      item.image_url = "/assets/pink-burger.png";
      item.is_must_try = true;
    } else if (item.name.includes("Blue Curacao")) {
      item.image_url = "/assets/blue-curacao.png";
      item.is_must_try = true;
    } else if (item.name.includes("Kitty Waffle")) {
      item.image_url = "/assets/kitty-waffle.png";
      item.is_must_try = true;
    }
  });

  // Seed default gallery images
  const seededGallery = [
    { id: crypto.randomUUID(), image_url: "/assets/hero-bg.png", caption: "Cherry Blossom Seating Booths", display_order: 10, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: crypto.randomUUID(), image_url: "/assets/blue-curacao.png", caption: "Blue Curacao Mocktail", display_order: 20, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: crypto.randomUUID(), image_url: "/assets/pink-burger.png", caption: "Pink Paradise Burger", display_order: 30, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: crypto.randomUUID(), image_url: "/assets/kitty-waffle.png", caption: "Kitty Waffle Dessert", display_order: 40, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  ];

  // Seed default configuration settings
  const seededSettings = {
    id: "00000000-0000-0000-0000-000000000000",
    address: "220-B, Satiya Wala Mandir Road, Model Town, Karnal, Haryana 132001",
    map_embed_url: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3464.7107770857317!2d76.97495097629555!3d29.699144475101672!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390e7195dfb8243b%3A0xe9f7bf9c855a0b73!2sSatiya%20Wala%20Mandir%20Road%2C%20Model%20Town%2C%20Karnal%2C%20Haryana%20132001!5e0!3m2!1sen!2sin!4v1711200000000!5m2!1sen!2sin",
    phone: "+91-9991110124",
    whatsapp_number: "+91-9991110124",
    email: "info@pinkandbluecafe.com",
    instagram_url: "https://instagram.com",
    facebook_url: "https://facebook.com",
    hours_json: {
      mon: "11:00 AM to 10:15 PM",
      tue: "11:00 AM to 10:15 PM",
      wed: "11:00 AM to 10:15 PM",
      thu: "11:00 AM to 10:15 PM",
      fri: "11:00 AM to 10:15 PM",
      sat: "11:00 AM to 10:15 PM",
      sun: "11:00 AM to 10:15 PM"
    },
    gemini_api_key: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Seed default offers
  const seededOffers = [
    {
      id: crypto.randomUUID(),
      title: "Buy 1 Get 1 Free on signature milkshakes!",
      description: "Dine-in special: Order any standard size Woodfired Pizza and get a free Rose Petal Shake or Strawberry Cream Mojito. Show this banner to claim.",
      badge_text: "BOGO DEAL",
      image_url: "/assets/kitty-waffle.png",
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0], // 30 days active
      is_active: true,
      display_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      title: "Magical 20% OFF on first table booking",
      description: "Use our reservation wizard to secure your window seat today and get an automatic 20% discount on your total bill. Valid all week.",
      badge_text: "20% OFF",
      image_url: "/assets/pink-burger.png",
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
      is_active: true,
      display_order: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  return {
    categories: seededCategories,
    menu_items: seededMenuItems,
    gallery_images: seededGallery,
    cafe_settings: [seededSettings],
    offers: seededOffers,
    reservations: [],
    contact_submissions: [],
    newsletter_signups: []
  };
}

// GET API Table Endpoints with Query Builder execution
app.get('/api/:table', (req, res) => {
  const table = req.params.table;
  const db = readDB();
  
  if (!db[table]) {
    return res.status(404).send(`Table ${table} not found.`);
  }

  let items = [...db[table]];

  // Handle URL filters directly (e.g. ?id=...)
  Object.keys(req.query).forEach(key => {
    if (key !== 'query') {
      items = items.filter(item => String(item[key]) === String(req.query[key]));
    }
  });

  // Handle advanced query builder JSON payload
  if (req.query.query) {
    try {
      const q = JSON.parse(decodeURIComponent(req.query.query));
      
      // Filters
      if (Array.isArray(q.filters)) {
        q.filters.forEach(f => {
          if (f.type === 'eq') {
            items = items.filter(item => String(item[f.field]) === String(f.value));
          } else if (f.type === 'gte') {
            items = items.filter(item => {
              if (item[f.field] === null || item[f.field] === undefined) return false;
              return String(item[f.field]) >= String(f.value);
            });
          }
        });
      }

      // Sorting
      if (Array.isArray(q.orders)) {
        q.orders.forEach(o => {
          items.sort((a, b) => {
            let valA = a[o.field];
            let valB = b[o.field];
            
            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();

            if (valA < valB) return o.ascending ? -1 : 1;
            if (valA > valB) return o.ascending ? 1 : -1;
            return 0;
          });
        });
      }

      // Limit
      if (q.limitVal !== null && q.limitVal !== undefined) {
        items = items.slice(0, q.limitVal);
      }

      // Single row selection
      if (q.singleVal) {
        const item = items[0] || null;
        if (item && table === 'cafe_settings' && !verifySession(req)) {
          const { gemini_api_key, ...safeItem } = item;
          return res.json(safeItem);
        }
        return res.json(item || null);
      }

    } catch (err) {
      console.error("Query parse error:", err);
      return res.status(400).send("Query parse error");
    }
  }

  if (table === 'cafe_settings' && !verifySession(req)) {
    items = items.map(item => {
      const { gemini_api_key, ...safeItem } = item;
      return safeItem;
    });
  }

  res.json(items);
});

// POST API Table Endpoint (Insert Row & triggers)
app.post('/api/:table', (req, res, next) => {
  const table = req.params.table;
  const publicTables = ['reservations', 'contact_submissions', 'newsletter_signups'];
  if (publicTables.includes(table)) {
    return next();
  }
  requireAuth(req, res, next);
}, (req, res) => {
  const table = req.params.table;
  const db = readDB();

  if (!db[table]) {
    return res.status(404).send(`Table ${table} not found.`);
  }

  const payload = req.body;

  // Rate Limiting Triggers (Max 5 submissions per hour per user key)
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  
  if (table === 'reservations') {
    const recentReservations = db.reservations.filter(r => 
      r.phone === payload.phone && new Date(r.created_at).getTime() > oneHourAgo
    );
    if (recentReservations.length >= 5) {
      return res.status(429).send("Rate limit exceeded for this phone number. Please try again in an hour.");
    }
  } else if (table === 'contact_submissions') {
    const recentSubmissions = db.contact_submissions.filter(c => 
      c.email_or_phone === payload.email_or_phone && new Date(c.created_at).getTime() > oneHourAgo
    );
    if (recentSubmissions.length >= 5) {
      return res.status(429).send("Rate limit exceeded for this contact. Please try again in an hour.");
    }
  } else if (table === 'newsletter_signups') {
    const recentSignups = db.newsletter_signups.filter(n => 
      n.email === payload.email && new Date(n.created_at).getTime() > oneHourAgo
    );
    if (recentSignups.length >= 5) {
      return res.status(429).send("Rate limit exceeded for this email. Please try again in an hour.");
    }
  }

  // Set default settings primary key
  const newRow = {
    id: table === 'cafe_settings' ? '00000000-0000-0000-0000-000000000000' : crypto.randomUUID(),
    ...payload,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db[table].push(newRow);
  writeDB(db);

  res.status(201).json(newRow);
});

// PUT API Table Endpoint (Update Row)
app.put('/api/:table', requireAuth, (req, res) => {
  const table = req.params.table;
  const db = readDB();

  if (!db[table]) {
    return res.status(404).send(`Table ${table} not found.`);
  }

  // Find index using query string filters
  const keys = Object.keys(req.query);
  if (keys.length === 0) {
    return res.status(400).send("Update requires a query parameter (e.g. ?id=...)");
  }

  const index = db[table].findIndex(item => {
    return keys.every(key => String(item[key]) === String(req.query[key]));
  });

  if (index === -1) {
    return res.status(404).send("Item matching parameters not found.");
  }

  const updatedItem = {
    ...db[table][index],
    ...req.body,
    updated_at: new Date().toISOString()
  };

  db[table][index] = updatedItem;
  writeDB(db);

  res.json(updatedItem);
});

// DELETE API Table Endpoint (Delete Row)
app.delete('/api/:table', requireAuth, (req, res) => {
  const table = req.params.table;
  const db = readDB();

  if (!db[table]) {
    return res.status(404).send(`Table ${table} not found.`);
  }

  const keys = Object.keys(req.query);
  if (keys.length === 0) {
    return res.status(400).send("Delete requires a query parameter (e.g. ?id=...)");
  }

  const beforeLen = db[table].length;
  db[table] = db[table].filter(item => {
    return !keys.every(key => String(item[key]) === String(req.query[key]));
  });

  if (db[table].length === beforeLen) {
    return res.status(404).send("No matching items found to delete.");
  }

  writeDB(db);
  res.json({ success: true });
});

// Upload endpoint mimicking Supabase storage uploading
app.post('/api/storage/upload', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  const publicUrl = `/uploads/${req.file.filename}`;
  res.json({ publicUrl });
});

// ==========================================================================
// 9. ADMIN PAGES & AUTHENTICATION ENDPOINTS
// ==========================================================================

// Serve login page
app.get('/admin/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin_login.html'));
});

// Protect the admin panel dashboard route
app.get('/admin', (req, res) => {
  const session = verifySession(req);
  if (!session) {
    return res.redirect('/admin/login');
  }
  res.sendFile(path.join(__dirname, 'private', 'admin_panel.html'));
});

// Login endpoint (handles Supabase JWT exchange & local mock fallback)
app.post('/api/auth/login', (req, res) => {
  const { email, password, token } = req.body || {};

  if (token) {
    // Supabase Auth token session creation (cookie storage)
    res.cookie('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    return res.json({ success: true });
  }

  // Local dev mock credentials check
  if (email === 'admin@pinkandbluecafe.com' && password === 'password') {
    const mockToken = jwt.sign(
      { email, role: 'authenticated' },
      MOCK_JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.cookie('admin_session', mockToken, {
      httpOnly: true,
      secure: false, // Local HTTP is safe in dev
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });
    return res.json({ success: true });
  }

  res.status(401).send("Invalid credentials.");
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('admin_session');
  res.json({ success: true });
});

// ==========================================================================
// 10. AI MENU SCANNER PROXY ENDPOINT
// ==========================================================================

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
      name: "Veg Supreme Pizza",
      description: "Classic pizza loaded with bell peppers, onion, sweet corn and mozzarella.",
      price_small: 169,
      price_medium: 329,
      price_large: 429,
      price_xxxl: null,
      is_veg: true,
      is_spicy: false,
      is_must_try: false,
      confidence: 0.90
    },
    {
      category: "Sandwiches",
      name: "Pink Paradise Burger",
      description: "Beetroot-dyed soft pink buns, crispy vegetable patty, and signature herb cream sauce.",
      price_small: null,
      price_medium: 169,
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
      confidence: 0.72
    }
  ];
}

async function callGeminiVisionAPI(base64Data, geminiKey) {
  const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: `Extract all menu items from this printed menu photo page. Output ONLY a raw JSON array. DO NOT wrap it in markdown block fences. Each object in the array MUST have these keys:
- category: string (the category name e.g. 'Pizza', 'Sandwiches', 'Shakes')
- name: string (the item name)
- description: string (the descriptions if listed, otherwise null)
- price_small: number or null (small size cost)
- price_medium: number or null (medium size cost)
- price_large: number or null (large size cost)
- price_xxxl: number or null (xxxl drinks cost)
- is_veg: boolean (true if veg / green dot, false if contains meat)
- is_spicy: boolean (true if spicy, else false)
- is_must_try: boolean (true if signature / crown tag, else false)
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
  const contentText = data.candidates[0].content.parts[0].text;
  return JSON.parse(contentText);
}

app.post('/api/scan-menu', requireAuth, async (req, res) => {
  const { images } = req.body;
  if (!images || !Array.isArray(images)) {
    return res.status(400).send("No images provided.");
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    console.log("Gemini API key environment variable is blank. Running simulation mode...");
    // Artificial delay to make simulation feel authentic
    await new Promise(resolve => setTimeout(resolve, 3000));
    return res.json({ success: true, simulated: true, items: getMockScanResults() });
  }

  try {
    const results = [];
    for (let i = 0; i < images.length; i++) {
      const pageData = await callGeminiVisionAPI(images[i], geminiKey);
      results.push(...pageData);
    }
    res.json({ success: true, simulated: false, items: results });
  } catch (err) {
    console.error("Gemini Vision processing failed:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Serve frontend static files
app.use(express.static(__dirname));

// Direct fallback to index.html for routing
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Express server
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`PINK & BLUE CAFE local API & frontend server running`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`Database File: ${DB_FILE}`);
  console.log(`Uploads Directory: ${UPLOADS_DIR}`);
  console.log(`===================================================`);
});
