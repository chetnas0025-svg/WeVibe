const express = require('express');
const cors = require('cors');
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

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

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
        return res.json(items[0] || null);
      }

    } catch (err) {
      console.error("Query parse error:", err);
      return res.status(400).send("Query parse error");
    }
  }

  res.json(items);
});

// POST API Table Endpoint (Insert Row & triggers)
app.post('/api/:table', (req, res) => {
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
app.put('/api/:table', (req, res) => {
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
app.delete('/api/:table', (req, res) => {
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
app.post('/api/storage/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  const publicUrl = `/uploads/${req.file.filename}`;
  res.json({ publicUrl });
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
