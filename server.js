require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 8000;
const DB_FILE = path.join(__dirname, 'db.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');

// Initialize PostgreSQL connection pool if DATABASE_URL is set
let pgPool = null;
if (process.env.DATABASE_URL) {
  console.log("DATABASE_URL env variable detected. Connecting to PostgreSQL database...");
  pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  // Test connection
  pgPool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error("❌ Failed to connect to PostgreSQL database via pool:", err.message);
    } else {
      console.log("✅ Successfully connected to PostgreSQL database at:", res.rows[0].now);
    }
  });
} else {
  console.log("No DATABASE_URL environment variable detected. Running in JSON file database mode (db.json).");
}

// Initialize Supabase Client on the backend for Storage uploads
let supabaseClient = null;
const supabaseConfigPath = path.join(__dirname, 'supabase_config.json');
let supabaseUrl = null;
let supabaseKey = null;

if (fs.existsSync(supabaseConfigPath)) {
  try {
    const config = JSON.parse(fs.readFileSync(supabaseConfigPath, 'utf8'));
    supabaseUrl = config.SUPABASE_URL;
    // Use service role key if available in env, otherwise fallback to anon key from config
    supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || config.SUPABASE_ANON_KEY;
  } catch (err) {
    console.error("Error reading supabase_config.json:", err.message);
  }
}

if (supabaseUrl && supabaseUrl !== "https://your-supabase-url.supabase.co" && supabaseKey) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseKey);
    console.log("✅ Supabase client initialized on backend.");
  } catch (err) {
    console.error("❌ Failed to initialize Supabase client on backend:", err.message);
  }
}

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
    address: "",
    map_embed_url: "",
    phone: "8950191495",
    whatsapp_number: "8950191495",
    email: "zato08100@gmail.com",
    instagram_url: "https://instagram.com",
    facebook_url: "https://facebook.com",
    hours_json: {
      mon: "10:00 AM to 10:00 PM",
      tue: "10:00 AM to 10:00 PM",
      wed: "10:00 AM to 10:00 PM",
      thu: "10:00 AM to 10:00 PM",
      fri: "10:00 AM to 10:00 PM",
      sat: "10:00 AM to 10:00 PM",
      sun: "10:00 AM to 10:00 PM"
    },
    gemini_api_key: null,
    theme_name: "pink_paradise",
    custom_primary_pink: "#F2A6C4",
    custom_accent_magenta: "#E6007E",
    custom_bg_blush: "#FADDE8",
    custom_bg_blush_light: "#FEF6F9",
    custom_navy_dark: "#1B2A4A",
    font_heading: "Outfit",
    font_body: "Inter",
    logo_text: "We Vibes",
    enable_blossom: true,
    hero_title_line1: "Italian Cuisine",
    hero_title_line2: "With a Twist",
    hero_description: "Enter a dreamy pastel paradise under glowing lanterns and cherry-blossoms, where plates look like art and food tastes like magic.",
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

const pg = require('pg');
pg.types.setTypeParser(pg.types.builtins.NUMERIC, val => val === null ? null : parseFloat(val));

const VALID_TABLES = [
  'categories',
  'menu_items',
  'gallery_images',
  'cafe_settings',
  'offers',
  'reservations',
  'contact_submissions',
  'newsletter_signups',
  'guest_reviews'
];

// GET API Table Endpoints with Query Builder execution
app.get('/api/:table', async (req, res) => {
  const table = req.params.table;
  if (!VALID_TABLES.includes(table)) {
    return res.status(404).send(`Table ${table} not found.`);
  }

  if (pgPool) {
    try {
      let queryText = `SELECT * FROM "${table}" WHERE 1=1`;
      const queryParams = [];
      let paramCounter = 1;

      // Handle simple URL query filters (e.g. ?id=...)
      Object.keys(req.query).forEach(key => {
        if (key !== 'query') {
          queryText += ` AND "${key}" = $${paramCounter}`;
          queryParams.push(req.query[key]);
          paramCounter++;
        }
      });

      let singleVal = false;
      let limitVal = null;
      let orderClause = '';

      // Handle advanced query builder JSON payload
      if (req.query.query) {
        try {
          const q = JSON.parse(decodeURIComponent(req.query.query));
          
          // Filters
          if (Array.isArray(q.filters)) {
            q.filters.forEach(f => {
              if (f.type === 'eq') {
                queryText += ` AND "${f.field}" = $${paramCounter}`;
                queryParams.push(f.value);
                paramCounter++;
              } else if (f.type === 'gte') {
                queryText += ` AND "${f.field}" >= $${paramCounter}`;
                queryParams.push(f.value);
                paramCounter++;
              }
            });
          }

          // Sorting
          if (Array.isArray(q.orders)) {
            const orderParts = q.orders.map(o => `"${o.field}" ${o.ascending ? 'ASC' : 'DESC'}`);
            if (orderParts.length > 0) {
              orderClause = ` ORDER BY ${orderParts.join(', ')}`;
            }
          }

          // Limit
          if (q.limitVal !== null && q.limitVal !== undefined) {
            limitVal = q.limitVal;
          }

          // Single row selection
          if (q.singleVal) {
            singleVal = true;
          }
        } catch (err) {
          console.error("Query parse error:", err);
          return res.status(400).send("Query parse error");
        }
      }

      // Append order clause
      queryText += orderClause;

      // Append limit
      if (limitVal !== null) {
        queryText += ` LIMIT ${parseInt(limitVal, 10)}`;
      } else if (singleVal) {
        queryText += ` LIMIT 1`;
      }

      const result = await pgPool.query(queryText, queryParams);
      let items = result.rows;

      if (singleVal) {
        const item = items[0] || null;
        if (item && table === 'cafe_settings' && !verifySession(req)) {
          const { gemini_api_key, ...safeItem } = item;
          return res.json(safeItem);
        }
        return res.json(item);
      }

      if (table === 'cafe_settings' && !verifySession(req)) {
        items = items.map(item => {
          const { gemini_api_key, ...safeItem } = item;
          return safeItem;
        });
      }

      return res.json(items);

    } catch (dbErr) {
      console.error(`PostgreSQL query error on table ${table}:`, dbErr.message);
      return res.status(500).send(`Database error: ${dbErr.message}`);
    }
  }

  const db = readDB();
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
}, async (req, res) => {
  const table = req.params.table;
  if (!VALID_TABLES.includes(table)) {
    return res.status(404).send(`Table ${table} not found.`);
  }

  if (pgPool) {
    try {
      const payload = req.body;
      const id = table === 'cafe_settings' ? '00000000-0000-0000-0000-000000000000' : (payload.id || crypto.randomUUID());
      
      const keys = ['id', ...Object.keys(payload).filter(k => k !== 'id')];
      const values = [id, ...keys.slice(1).map(k => {
        if (table === 'cafe_settings' && k === 'hours_json' && typeof payload[k] === 'object') {
          return JSON.stringify(payload[k]);
        }
        return payload[k];
      })];
      
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      const queryText = `INSERT INTO "${table}" (${keys.map(k => `"${k}"`).join(', ')}) VALUES (${placeholders}) RETURNING *`;
      
      const result = await pgPool.query(queryText, values);
      return res.status(201).json(result.rows[0]);
    } catch (dbErr) {
      console.error(`PostgreSQL insert error on table ${table}:`, dbErr.message);
      
      // Translate rate-limit trigger exception to 429
      if (dbErr.message && dbErr.message.includes('Rate limit exceeded')) {
        return res.status(429).send(dbErr.message);
      }
      
      return res.status(500).send(`Database error: ${dbErr.message}`);
    }
  }

  const db = readDB();
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
app.put('/api/:table', requireAuth, async (req, res) => {
  const table = req.params.table;
  if (!VALID_TABLES.includes(table)) {
    return res.status(404).send(`Table ${table} not found.`);
  }

  // Find using query string filters
  const keys = Object.keys(req.query);
  if (keys.length === 0) {
    return res.status(400).send("Update requires a query parameter (e.g. ?id=...)");
  }

  if (pgPool) {
    try {
      const updateKeys = Object.keys(req.body).filter(k => k !== 'updated_at');
      if (updateKeys.length === 0) {
        return res.status(400).send("Update requires request body fields.");
      }

      let paramCounter = 1;
      const setPairs = [];
      const queryValues = [];

      updateKeys.forEach(k => {
        let val = req.body[k];
        if (table === 'cafe_settings' && k === 'hours_json' && typeof val === 'object') {
          val = JSON.stringify(val);
        }
        setPairs.push(`"${k}" = $${paramCounter}`);
        queryValues.push(val);
        paramCounter++;
      });

      if (table !== 'newsletter_signups') {
        setPairs.push(`"updated_at" = NOW()`);
      }

      const wherePairs = [];
      keys.forEach(k => {
        wherePairs.push(`"${k}" = $${paramCounter}`);
        queryValues.push(req.query[k]);
        paramCounter++;
      });

      const queryText = `UPDATE "${table}" SET ${setPairs.join(', ')} WHERE ${wherePairs.join(' AND ')} RETURNING *`;
      const result = await pgPool.query(queryText, queryValues);

      if (result.rows.length === 0) {
        return res.status(404).send("Item matching parameters not found.");
      }

      return res.json(result.rows[0]);
    } catch (dbErr) {
      console.error(`PostgreSQL update error on table ${table}:`, dbErr.message);
      return res.status(500).send(`Database error: ${dbErr.message}`);
    }
  }

  const db = readDB();
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
app.delete('/api/:table', requireAuth, async (req, res) => {
  const table = req.params.table;
  if (!VALID_TABLES.includes(table)) {
    return res.status(404).send(`Table ${table} not found.`);
  }

  const keys = Object.keys(req.query);
  if (keys.length === 0) {
    return res.status(400).send("Delete requires a query parameter (e.g. ?id=...)");
  }

  if (pgPool) {
    try {
      let paramCounter = 1;
      const wherePairs = [];
      const queryValues = [];

      keys.forEach(k => {
        wherePairs.push(`"${k}" = $${paramCounter}`);
        queryValues.push(req.query[k]);
        paramCounter++;
      });

      const queryText = `DELETE FROM "${table}" WHERE ${wherePairs.join(' AND ')} RETURNING *`;
      const result = await pgPool.query(queryText, queryValues);

      if (result.rows.length === 0) {
        return res.status(404).send("No matching items found to delete.");
      }

      return res.json({ success: true });
    } catch (dbErr) {
      console.error(`PostgreSQL delete error on table ${table}:`, dbErr.message);
      return res.status(500).send(`Database error: ${dbErr.message}`);
    }
  }

  const db = readDB();
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
app.post('/api/storage/upload', requireAuth, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  if (supabaseClient) {
    try {
      const fileBuffer = fs.readFileSync(req.file.path);
      const uniqueName = req.file.filename;
      
      const { data, error } = await supabaseClient.storage
        .from('cafe-uploads')
        .upload(uniqueName, fileBuffer, {
          contentType: req.file.mimetype,
          duplex: 'half'
        });

      if (error) {
        throw error;
      }

      const { data: urlData } = supabaseClient.storage
        .from('cafe-uploads')
        .getPublicUrl(uniqueName);

      // Clean up local temp file
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        // Ignore link errors
      }

      return res.json({ publicUrl: urlData.publicUrl });
    } catch (err) {
      console.error("Supabase Storage upload failed, falling back to local:", err.message);
    }
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
// 9B. PHONE OTP AUTHENTICATION ENDPOINTS
// ==========================================================================
const activeOTPs = {};

app.post('/api/auth/send-otp', async (req, res) => {
  const { email, phone } = req.body || {};
  const targetKey = email || phone;
  if (!targetKey) {
    return res.status(400).json({ success: false, message: "Email address or phone number is required." });
  }

  // Generate 6-digit code
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const entry = {
    otp,
    expires: Date.now() + 5 * 60 * 1000 // 5 minutes
  };

  if (email) activeOTPs[email] = entry;
  if (phone) activeOTPs[phone] = entry;

  let sentRealEmail = false;
  let previewUrl = null;

  if (email) {
    try {
      let transporter;
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '587', 10),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });
      } else {
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass
          }
        });
      }

      const mailOptions = {
        from: '"We Vibes Cafe" <reservations@wevibescafe.com>',
        to: email,
        subject: `🌸 ${otp} is your We Vibes Cafe Verification Code`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 2px solid #F2A6C4; border-radius: 12px; background-color: #FEF6F9;">
            <h2 style="color: #1B2A4A; text-align: center; margin-bottom: 5px;">🌸 We Vibes Cafe</h2>
            <p style="color: #666; text-align: center; font-size: 14px; margin-top: 0;">Table Reservation Verification</p>
            <hr style="border: none; border-top: 1px dashed #F2A6C4; margin: 20px 0;">
            <p style="color: #1B2A4A; font-size: 15px;">Hello!</p>
            <p style="color: #555; font-size: 14px; line-height: 1.5;">Thank you for reserving a table at <strong>We Vibes Cafe</strong>. Use the 6-digit verification code below to confirm your booking:</p>
            <div style="background-color: #ffffff; border: 2px solid #E6007E; border-radius: 8px; padding: 15px; text-align: center; margin: 25px 0;">
              <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #E6007E;">${otp}</span>
            </div>
            <p style="color: #888; font-size: 12px; text-align: center;">This code is valid for 5 minutes. If you did not request this, please ignore this email.</p>
          </div>
        `
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`=========================================`);
      console.log(`✉️ [EMAIL SYSTEM] Sent verification code to: ${email}`);
      console.log(`👉 OTP CODE IS: ${otp}`);
      if (nodemailer.getTestMessageUrl(info)) {
        previewUrl = nodemailer.getTestMessageUrl(info);
        console.log(`🔗 Ethereal Email Preview URL: ${previewUrl}`);
      }
      console.log(`=========================================`);
      sentRealEmail = true;
    } catch (emailErr) {
      console.error("Failed to send verification email:", emailErr.message);
    }
  }

  return res.json({ 
    success: true, 
    otp,
    real_email_sent: sentRealEmail,
    preview_url: previewUrl,
    message: sentRealEmail ? "Verification code sent to your email address!" : "Dev Mode: Verification code generated."
  });
});

app.post('/api/auth/verify-otp', (req, res) => {
  const { email, phone, otp } = req.body || {};
  const targetKey = email || phone;
  if (!targetKey || !otp) {
    return res.status(400).json({ success: false, message: "Email address or phone number and OTP are required." });
  }

  const entry = activeOTPs[targetKey] || (email && activeOTPs[email]) || (phone && activeOTPs[phone]);
  if (!entry) {
    return res.json({ success: false, message: "No OTP verification request found." });
  }

  if (Date.now() > entry.expires) {
    if (email) delete activeOTPs[email];
    if (phone) delete activeOTPs[phone];
    return res.json({ success: false, message: "Verification code has expired." });
  }

  if (entry.otp !== otp) {
    return res.json({ success: false, message: "Invalid verification code." });
  }

  if (email) delete activeOTPs[email];
  if (phone) delete activeOTPs[phone];
  return res.json({ success: true });
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

  let geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    if (pgPool) {
      try {
        const result = await pgPool.query('SELECT gemini_api_key FROM cafe_settings LIMIT 1');
        if (result.rows.length > 0) {
          geminiKey = result.rows[0].gemini_api_key;
        }
      } catch (err) {
        console.error("Failed to query gemini_api_key from PostgreSQL:", err.message);
      }
    } else {
      const db = readDB();
      const settings = db.cafe_settings && db.cafe_settings[0];
      geminiKey = settings && settings.gemini_api_key;
    }
  }

  if (!geminiKey) {
    console.log("Gemini API key environment variable and database settings are blank. Running simulation mode...");
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
  console.log(`WE VIBES CAFE local API & frontend server running`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`Database File: ${DB_FILE}`);
  console.log(`Uploads Directory: ${UPLOADS_DIR}`);
  console.log(`===================================================`);
});
